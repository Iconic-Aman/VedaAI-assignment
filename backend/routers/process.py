from fastapi import APIRouter, HTTPException
from store.memory_store import get_session, get_session_raw, update_session
from services.question_extractor import extract_all_questions
from services.answer_extractor import extract_all_answers
from services.ocr_service import refine_answer_bboxes
from services.mapping_service import map_answers_to_questions
from services.grading_service import grade_all_answers

router = APIRouter(prefix="", tags=["Process"])

# Reason: Run extraction & mapping pipeline with step-by-step logging
def run_pipeline(session_id: str):
    session = get_session(session_id)
    raw_store = get_session_raw(session_id)
    if not session or not raw_store:
        print(f"[PROCESS] ERROR: Session {session_id} not found in store!")
        return

    try:
        session.status = "processing"
        update_session(session_id, session)

        q_images = raw_store.get("q_images", [])
        a_images = raw_store.get("a_images", [])
        print(f"\n[PROCESS] Running pipeline for session {session_id} (Q pages: {len(q_images)}, A pages: {len(a_images)})")

        # Step 1: Question extraction in printed order with sub-parts
        print(f"[PROCESS] Step 1/5: Extracting questions via Gemini Vision...")
        questions = extract_all_questions(q_images)
        print(f"[PROCESS] Step 1/5 DONE: Extracted {len(questions)} questions.")

        # Step 2: Answer segment extraction (if answer sheet provided)
        print(f"[PROCESS] Step 2/5: Extracting student answer segments...")
        answers = extract_all_answers(a_images) if a_images else []
        print(f"[PROCESS] Step 2/5 DONE: Extracted {len(answers)} answer segments.")

        # Step 3: Refine bounding boxes with OCR line alignment
        print(f"[PROCESS] Step 3/5: Refining answer bounding boxes...")
        refined_answers = refine_answer_bboxes(answers, a_images) if a_images else []
        print(f"[PROCESS] Step 3/5 DONE: Refined {len(refined_answers)} bounding boxes.")

        # Step 4: Map answers to questions
        print(f"[PROCESS] Step 4/5: Mapping answers to questions...")
        mappings, unmatched_answers = map_answers_to_questions(questions, refined_answers)
        print(f"[PROCESS] Step 4/5 DONE: Generated {len(mappings)} mappings.")

        # Step 5: Optional Grading & AI feedback
        print(f"[PROCESS] Step 5/5: Grading answers...")
        grading = grade_all_answers(questions, refined_answers, mappings)
        print(f"[PROCESS] Step 5/5 DONE: Graded {len(grading)} questions.")

        session.questions = questions
        session.answer_segments = refined_answers
        session.mappings = mappings
        session.unmatched_answers = unmatched_answers
        session.grading = grading
        session.status = "completed"
        update_session(session_id, session)
        print(f"[PROCESS] Pipeline COMPLETED successfully for session {session_id}!")
    except Exception as e:
        session.status = "failed"
        session.error = str(e)
        update_session(session_id, session)
        print(f"[PROCESS] Pipeline FAILURE for session {session_id}: {e}")

# Reason: POST /process/{session_id} route
@router.post("/process/{session_id}")
async def process_session_endpoint(session_id: str):
    print(f"\n[PROCESS ENDPOINT] Received request for session: {session_id}")
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    run_pipeline(session_id)
    return {
        "session_id": session_id,
        "status": session.status,
        "question_count": len(session.questions),
        "message": "Processing pipeline completed"
    }
