import os
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer(auto_error=True)

# Reason: Verify Bearer authentication token from request header against environment variable
def verify_bearer_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    expected_token = os.getenv("API_BEARER_TOKEN")
    token = credentials.credentials

    # If expected_token is set in env, validate against it
    if expected_token and token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token
