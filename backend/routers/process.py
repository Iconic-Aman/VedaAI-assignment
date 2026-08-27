import traceback
from fastapi import APIRouter, HTTPException
from store.memory_store import get_session, get_session_raw, update_session
from services.question_extractor import extract_all_questions
from services.answer_extractor import extract_all_answers
from services.ocr_service import refine_answer_bboxes
from services.mapping_service import map_answers_to_questions
from services.grading_service import grade_all_answers

router = APIRouter(prefix="", tags=["Process"])

# Reason: Run extraction & mapping pipeline with step-by-step logging and traceback for cloud deployment
def run_pipeline(session_id: str):
    session = get_session(session_id)
    raw_store = get_session_raw(session_id)
    if not session or not raw_store:
        print(f"[PROCESS ERROR] Session {session_id} not found in store!")
        return

    try:
        session.status = "processing"
        update_session(session_id, session)

        q_images = raw_store.get("q_images", [])
        a_images = raw_store.get("a_images", [])
        print(f"\n[PROCESS START] Session {session_id} (Q pages: {len(q_images)}, A pages: {len(a_images)})")

        # Step 1: Question extraction
        print(f"[PROCESS 1/5] Extracting questions from {len(q_images)} page(s)...")
        questions = extract_all_questions(q_images) if q_images else []
        print(f"[PROCESS 1/5 DONE] Extracted {len(questions)} question(s).")

        # Step 2: Answer extraction via Surya OCR
        print(f"[PROCESS 2/5] Extracting answer segments from {len(a_images)} page(s)...")
        answers = extract_all_answers(a_images) if a_images else []
        print(f"[PROCESS 2/5 DONE] Extracted {len(answers)} answer segment(s).")

        # Step 3: Refine bounding boxes
        print(f"[PROCESS 3/5] Refining bounding boxes...")
        refined_answers = refine_answer_bboxes(answers, a_images) if a_images else []
        print(f"[PROCESS 3/5 DONE] Refined {len(refined_answers)} bounding box(es).")

        # Step 4: Map answers to questions
        print(f"[PROCESS 4/5] Mapping answers to questions...")
        mappings, unmatched_answers = map_answers_to_questions(questions, refined_answers)
        print(f"[PROCESS 4/5 DONE] Generated {len(mappings)} question mapping(s).")

        # Step 5: AI grading
        print(f"[PROCESS 5/5] Grading student answers...")
        grading = grade_all_answers(questions, refined_answers, mappings)
        print(f"[PROCESS 5/5 DONE] Graded {len(grading)} question(s).")

        session.questions = questions
        session.answer_segments = refined_answers
        session.mappings = mappings
        session.unmatched_answers = unmatched_answers
        session.grading = grading
        session.status = "completed"
        update_session(session_id, session)
        print(f"[PROCESS COMPLETED] Session {session_id} finished successfully!")
    except Exception as e:
        traceback.print_exc()
        session.status = "failed"
        session.error = str(e)
        update_session(session_id, session)
        print(f"[PROCESS FAILURE] Session {session_id} encountered fatal error: {e}")

# Reason: POST /process/{session_id} route
@router.post("/process/{session_id}")
async def process_session_endpoint(session_id: str):
    print(f"\n[PROCESS ENDPOINT] Received request for session: {session_id}")
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    run_pipeline(session_id)
    if session.status == "failed":
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {session.error}")

    return {
        "session_id": session_id,
        "status": session.status,
        "question_count": len(session.questions),
        "answer_segment_count": len(session.answer_segments),
        "message": "Processing pipeline completed"
    }
