"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Upload Models ─────────────────────────────────────────────

class UploadResponse(BaseModel):
    """Response after successful document upload."""
    id: str
    filename: str
    file_type: str
    file_size: int
    num_pages: Optional[int] = None
    num_chunks: int
    message: str
    uploaded_at: str


# ── Query Models ──────────────────────────────────────────────

class QueryRequest(BaseModel):
    """Request to query the RAG pipeline."""
    question: str = Field(..., min_length=1, max_length=2000)
    document_id: Optional[str] = None  # Filter by specific document
    top_k: Optional[int] = Field(default=5, ge=1, le=20)


class SourceChunk(BaseModel):
    """A source chunk used to generate the answer."""
    content: str
    filename: str
    page_number: Optional[int] = None
    chunk_id: str
    relevance_score: float


class QueryResponse(BaseModel):
    """Response from the RAG pipeline."""
    answer: str
    sources: List[SourceChunk]
    question: str
    processing_time: float


# ── Summarization Models ─────────────────────────────────────

class SummarizeRequest(BaseModel):
    """Request to summarize a document."""
    document_id: str
    summary_type: str = Field(default="concise", pattern="^(concise|key_points|bullet|insights)$")


class SummarizeResponse(BaseModel):
    """Summarization response."""
    document_id: str
    filename: str
    summary_type: str
    summary: str
    processing_time: float


# ── Translation Models ───────────────────────────────────────

class TranslateRequest(BaseModel):
    """Request to translate text."""
    text: str = Field(..., min_length=1, max_length=10000)
    target_language: str = Field(default="hi")  # ISO language code


class TranslateResponse(BaseModel):
    """Translation response."""
    original_text: str
    translated_text: str
    target_language: str
    language_name: str


# ── TTS Models ────────────────────────────────────────────────

class TTSRequest(BaseModel):
    """Request for text-to-speech conversion."""
    text: str = Field(..., min_length=1, max_length=5000)
    language: str = Field(default="en")


class TTSResponse(BaseModel):
    """TTS response with audio file URL."""
    audio_url: str
    text: str
    language: str


# ── Document Models ──────────────────────────────────────────

class DocumentInfo(BaseModel):
    """Information about an uploaded document."""
    id: str
    filename: str
    file_type: str
    file_size: int
    num_chunks: int
    uploaded_at: str
    status: str = "processed"


class DocumentListResponse(BaseModel):
    """List of all documents."""
    documents: List[DocumentInfo]
    total: int
