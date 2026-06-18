"""
Text-to-Speech route handler.
"""

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.schemas import TTSRequest, TTSResponse
from app.tts.speech import text_to_speech

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/tts", response_model=TTSResponse)
@limiter.limit("10/minute")
async def generate_speech(request: Request, body: TTSRequest):
    """
    Convert text to speech audio.
    Returns a URL to the generated audio file.
    """
    try:
        result = await text_to_speech(
            text=body.text,
            language=body.language,
        )
        return TTSResponse(**result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")
