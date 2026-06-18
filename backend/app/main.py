"""
Main FastAPI Application Entry Point.
Configures CORS, rate limiting, and registers all route handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from app.config import settings
from app.routes import upload, query, summarize, translate, tts, documents


# ── Rate Limiter ──────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="AI Knowledge Extraction",
    description="Extract knowledge from unstructured documents using LLMs and RAG",
    version="1.0.0",
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ───────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files (serve uploaded files & audio) ──────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs("./audio_output", exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/audio", StaticFiles(directory="./audio_output"), name="audio")

# ── Register Routes ──────────────────────────────────────────
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(query.router, prefix="/api", tags=["Query"])
app.include_router(summarize.router, prefix="/api", tags=["Summarize"])
app.include_router(translate.router, prefix="/api", tags=["Translate"])
app.include_router(tts.router, prefix="/api", tags=["Text-to-Speech"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Knowledge Extraction API",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    """API health check with configuration info."""
    return {
        "status": "healthy",
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_model": settings.EMBEDDING_MODEL,
        "chunk_size": settings.CHUNK_SIZE,
        "top_k": settings.TOP_K_RESULTS,
    }
