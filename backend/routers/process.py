import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks
from store.memory_store import get_session, get_session_raw, update_session
from services.question_extractor import extract_all_questions
from services.answer_extractor import extract_all_answers
from services.ocr_service import refine_answer_bboxes
from services.mapping_service import map_answers_to_questions
from services.grading_service import grade_all_answers

router = APIRouter(prefix="", tags=["Process"])

# Reason: Run full assessment extraction & answer mapping pipeline
def run_pipeline(session_id: str):
    session = get_session(session_id)
    raw_store = get_session_raw(session_id)
    if not session or not raw_store:
        return

    try:
        session.status = "processing"
        update_session(session_id, session)

        q_images = raw_store.get("q_images", [])
        a_images = raw_store.get("a_images", [])

        # Step 1: Question extraction in printed order with sub-parts
        questions = extract_all_questions(q_images)

        # Step 2: Answer segment extraction
        answers = extract_all_answers(a_images)

        # Step 3: Refine bounding boxes with OCR line alignment
        refined_answers = refine_answer_bboxes(answers, a_images)

        # Step 4: Map answers to questions (3-pass algorithm)
        mappings, unmatched_answers = map_answers_to_questions(questions, refined_answers)

        # Step 5: Optional Grading & AI feedback
        grading = grade_all_answers(questions, refined_answers, mappings)

        session.questions = questions
        session.answer_segments = refined_answers
        session.mappings = mappings
        session.unmatched_answers = unmatched_answers
        session.grading = grading
        session.status = "completed"
        update_session(session_id, session)
    except Exception as e:
        session.status = "failed"
        session.error = str(e)
        update_session(session_id, session)
        print(f"Pipeline failure for session {session_id}: {e}")

# Reason: POST /process/{session_id} route
@router.post("/process/{session_id}")
async def process_session_endpoint(session_id: str, background_tasks: BackgroundTasks):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Run synchronously or dispatch background task
    run_pipeline(session_id)
    return {
        "session_id": session_id,
        "status": session.status,
        "message": "Processing pipeline completed"
    }
