import time
from typing import Dict, Optional, Any
from models.schema import SessionData

# Reason: In-memory session store dictionary per requirements
_sessions: Dict[str, Dict[str, Any]] = {}

def create_session(session_id: str) -> SessionData:
    session = SessionData(session_id=session_id, status="uploaded")
    _sessions[session_id] = {
        "data": session,
        "raw_files": {},
        "created_at": time.time()
    }
    return session

def get_session(session_id: str) -> Optional[SessionData]:
    if session_id in _sessions:
        return _sessions[session_id]["data"]
    return None

def get_session_raw(session_id: str) -> Optional[Dict[str, Any]]:
    return _sessions.get(session_id)

def update_session(session_id: str, session: SessionData) -> None:
    if session_id in _sessions:
        _sessions[session_id]["data"] = session

def cleanup_old_sessions(max_age_seconds: int = 3600) -> None:
    now = time.time()
    expired = [
        sid for sid, item in _sessions.items()
        if now - item.get("created_at", now) > max_age_seconds
    ]
    for sid in expired:
        _sessions.pop(sid, None)
