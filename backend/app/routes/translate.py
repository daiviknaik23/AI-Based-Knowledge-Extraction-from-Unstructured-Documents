"""
Translation route handler.
"""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import TranslateRequest, TranslateResponse
from app.translator.translate import translate_text, get_supported_languages

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/translate", response_model=TranslateResponse)
@limiter.limit("20/minute")
async def translate(request: Request, body: TranslateRequest):
    """
    Translate text to the specified target language.
    """
    try:
        result = await translate_text(
            text=body.text,
            target_language=body.target_language,
        )
        return TranslateResponse(**result)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.get("/languages")
async def list_languages():
    """Get list of supported languages."""
    return {"languages": get_supported_languages()}
