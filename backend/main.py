import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.upload import router as upload_router
from routers.process import router as process_router
from routers.session import router as session_router
from services.auth import verify_bearer_token

load_dotenv()

# Reason: Initialize FastAPI with docs mounted at /api/docs and /api/openapi.json
app = FastAPI(
    title="VedaAI Assessment Extraction & Answer Mapping API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    description="Backend API for question paper extraction, handwritten answer mapping, and AI grading with Bearer Auth."
)

# Reason: CORS middleware configuration with origins from environment variable
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Reason: Register API routers protected by Bearer authentication
app.include_router(upload_router, dependencies=[Depends(verify_bearer_token)])
app.include_router(process_router, dependencies=[Depends(verify_bearer_token)])
app.include_router(session_router, dependencies=[Depends(verify_bearer_token)])

# Reason: Public healthcheck route
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "VedaAI Assessment Mapper"}

# Reason: Root API endpoint
@app.get("/")
def root():
    return {"message": "VedaAI Assessment Extraction & Answer Mapping API is running. Docs at /api/docs"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    # Single worker is required for in-memory session store consistency
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, workers=1)
