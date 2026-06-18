"""
Query route handler.
Handles RAG-based question answering.
"""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import QueryRequest, QueryResponse
from app.rag.pipeline import query_rag

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/query", response_model=QueryResponse)
@limiter.limit("20/minute")
async def query_documents(request: Request, body: QueryRequest):
    """
    Query the RAG pipeline with a question.
    
    Retrieves relevant document chunks and generates
    a contextual answer using the configured LLM.
    """
    try:
        result = await query_rag(
            question=body.question,
            document_id=body.document_id,
            top_k=body.top_k,
        )

        return QueryResponse(
            answer=result["answer"],
            sources=[
                {
                    "content": s["content"],
                    "filename": s["filename"],
                    "page_number": s.get("page_number"),
                    "chunk_id": s["chunk_id"],
                    "relevance_score": s.get("relevance_score", 0),
                }
                for s in result["sources"]
            ],
            question=result["question"],
            processing_time=result["processing_time"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
