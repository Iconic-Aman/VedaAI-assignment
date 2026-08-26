import uuid
import base64
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException
from store.memory_store import create_session, get_session_raw, update_session
from services.pdf_service import process_upload_to_images, image_to_bytes

router = APIRouter(prefix="", tags=["Upload"])

# Reason: POST /upload route accepting question paper and optional answer sheet
@router.post("/upload")
async def upload_documents(
    question_paper: UploadFile = File(...),
    answer_sheet: Optional[UploadFile] = File(None)
):
    session_id = str(uuid.uuid4())
    session = create_session(session_id)
    raw_store = get_session_raw(session_id)

    try:
        q_bytes = await question_paper.read()
        q_images = process_upload_to_images(q_bytes, question_paper.filename)
        raw_store["q_images"] = q_images

        a_images = []
        if answer_sheet and answer_sheet.filename:
            a_bytes = await answer_sheet.read()
            a_images = process_upload_to_images(a_bytes, answer_sheet.filename)
        raw_store["a_images"] = a_images

        # Convert page images to base64 data URIs
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

        return {
            "session_id": session_id,
            "status": "uploaded",
            "question_page_count": len(q_images),
            "answer_page_count": len(a_images)
        }
    except Exception as e:
        session.status = "failed"
        session.error = str(e)
        update_session(session_id, session)
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")
