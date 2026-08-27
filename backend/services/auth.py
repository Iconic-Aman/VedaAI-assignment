import os
from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer(auto_error=False)

# Reason: Verify Bearer authentication token if configured in environment
def verify_bearer_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> str:
    expected_token = os.getenv("API_BEARER_TOKEN")
    if not expected_token:
        return "anonymous"

    if not credentials or credentials.credentials != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials
