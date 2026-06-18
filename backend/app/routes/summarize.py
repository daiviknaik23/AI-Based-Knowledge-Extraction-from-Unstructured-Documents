"""
Summarization route handler.
"""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.summarizer.summarizer import summarize_document

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/summarize", response_model=SummarizeResponse)
@limiter.limit("10/minute")
async def summarize(request: Request, body: SummarizeRequest):
    """
    Generate a summary of an uploaded document.
    
    Summary types: concise, key_points, bullet, insights
    """
    try:
        result = await summarize_document(
            document_id=body.document_id,
            summary_type=body.summary_type,
        )

        return SummarizeResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
