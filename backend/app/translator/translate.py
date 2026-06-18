"""
Multilingual translation module.
Supports translation to multiple languages using deep-translator.
"""

from deep_translator import GoogleTranslator
from typing import Dict, Any

# ── Supported Languages ──────────────────────────────────────
SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "ja": "Japanese",
    "zh-CN": "Chinese (Simplified)",
    "ar": "Arabic",
    "pt": "Portuguese",
}


async def translate_text(
    text: str,
    target_language: str = "hi",
) -> Dict[str, Any]:
    """
    Translate text to the target language.
    
    Args:
        text: Text to translate
        target_language: ISO language code (e.g., 'hi', 'fr', 'es')
    
    Returns:
        Dict with original text, translated text, and language info
    """
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language: {target_language}. "
            f"Supported: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    try:
        translator = GoogleTranslator(source='auto', target=target_language)
        # deep-translator has a 5000 char limit per call, so chunk if needed
        if len(text) > 4500:
            chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
            translated_parts = [translator.translate(chunk) for chunk in chunks]
            translated_text = " ".join(translated_parts)
        else:
            translated_text = translator.translate(text)
    except Exception as e:
        # Fallback: return original text with error note
        translated_text = f"[Translation error: {str(e)}] {text}"

    return {
        "original_text": text,
        "translated_text": translated_text,
        "target_language": target_language,
        "language_name": SUPPORTED_LANGUAGES.get(target_language, target_language),
    }


def get_supported_languages() -> Dict[str, str]:
    """Return the dictionary of supported languages."""
    return SUPPORTED_LANGUAGES
