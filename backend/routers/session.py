from fastapi import APIRouter, HTTPException
from models.schema import SessionData
from store.memory_store import get_session

router = APIRouter(prefix="", tags=["Session"])

# Reason: GET /session/{session_id} route with console logging
@router.get("/session/{session_id}", response_model=SessionData)
async def get_session_details(session_id: str):
    print(f"\n[SESSION GET] Fetching details for session: {session_id}")
    session = get_session(session_id)
    if not session:
        print(f"[SESSION GET] ERROR: Session {session_id} not found!")
        raise HTTPException(status_code=404, detail="Session not found")

    print(f"[SESSION GET] Found session {session_id}. Status: {session.status}, Questions: {len(session.questions)}, Answer segments: {len(session.answer_segments)}")
    return session

# Reason: GET /session/{session_id}/status route for polling status
@router.get("/session/{session_id}/status")
async def get_session_status(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session.session_id,
        "status": session.status,
        "error": session.error
    }
