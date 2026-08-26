from fastapi import APIRouter, HTTPException
from models.schema import SessionData
from store.memory_store import get_session

router = APIRouter(prefix="", tags=["Session"])

# Reason: GET /session/{session_id} route returning full mapped result data
@router.get("/session/{session_id}", response_model=SessionData)
async def get_session_details(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
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
