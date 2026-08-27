import uuid
import base64
import traceback
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from store.memory_store import create_session, get_session_raw, update_session
from services.pdf_service import process_upload_to_images, image_to_bytes

router = APIRouter(prefix="", tags=["Upload"])

# Reason: POST /upload route with comprehensive error tracking and traceback logging for Render/Vercel
@router.post("/upload")
async def upload_documents(
    question_paper: Optional[UploadFile] = File(None),
    answer_sheet: Optional[UploadFile] = File(None)
):
    if not question_paper and not answer_sheet:
        print("[UPLOAD ERROR] Request received without question_paper or answer_sheet files!")
        raise HTTPException(status_code=400, detail="At least one document must be uploaded.")

    session_id = str(uuid.uuid4())
    print(f"\n[UPLOAD START] Session {session_id} | Q: {getattr(question_paper, 'filename', None)} | A: {getattr(answer_sheet, 'filename', None)}")
    session = create_session(session_id)
    raw_store = get_session_raw(session_id)

    try:
        q_images = []
        if question_paper and question_paper.filename:
            q_bytes = await question_paper.read()
            print(f"[UPLOAD] Read {len(q_bytes)} bytes from {question_paper.filename}. Converting to images...")
            q_images = process_upload_to_images(q_bytes, question_paper.filename)
            print(f"[UPLOAD] Successfully generated {len(q_images)} question page image(s).")
        raw_store["q_images"] = q_images

        a_images = []
        if answer_sheet and answer_sheet.filename:
            a_bytes = await answer_sheet.read()
            print(f"[UPLOAD] Read {len(a_bytes)} bytes from {answer_sheet.filename}. Converting to images...")
            a_images = process_upload_to_images(a_bytes, answer_sheet.filename)
            print(f"[UPLOAD] Successfully generated {len(a_images)} answer page image(s).")
        raw_store["a_images"] = a_images

        q_b64 = [
            f"data:image/png;base64,{base64.b64encode(image_to_bytes(img)).decode('utf-8')}"
            for img in q_images
        ]
        a_b64 = [
            f"data:image/png;base64,{base64.b64encode(image_to_bytes(img)).decode('utf-8')}"
            for img in a_images
        ]

        session.question_pages = q_b64
        session.answer_pages = a_b64
        update_session(session_id, session)

        res = {
            "session_id": session_id,
            "status": "uploaded",
            "question_page_count": len(q_images),
            "answer_page_count": len(a_images)
        }
        print(f"[UPLOAD SUCCESS] {res}")
        return res
    except Exception as e:
        traceback.print_exc()
        session.status = "failed"
        session.error = str(e)
        update_session(session_id, session)
        print(f"[UPLOAD FAILURE] Session {session_id} failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
