"""
Text-to-Speech module using gTTS.
Converts text to speech audio files for playback/download.
"""

from gtts import gTTS
import os
import uuid
from typing import Dict, Any


# Output directory for audio files
AUDIO_OUTPUT_DIR = "./audio_output"
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)


async def text_to_speech(
    text: str,
    language: str = "en",
) -> Dict[str, Any]:
    """
    Convert text to speech audio file.
    
    Args:
        text: Text to convert to speech
        language: Language code for speech (e.g., 'en', 'hi', 'fr')
    
    Returns:
        Dict with audio file URL and metadata
    """
    try:
        # Generate unique filename
        audio_id = str(uuid.uuid4())[:8]
        filename = f"speech_{audio_id}.mp3"
        filepath = os.path.join(AUDIO_OUTPUT_DIR, filename)

        # Generate speech
        tts = gTTS(text=text, lang=language, slow=False)
        tts.save(filepath)

        # Return URL path (served by FastAPI static files)
        audio_url = f"/audio/{filename}"

        return {
            "audio_url": audio_url,
            "text": text[:200] + "..." if len(text) > 200 else text,
            "language": language,
        }

    except Exception as e:
        raise RuntimeError(f"TTS generation failed: {str(e)}")
