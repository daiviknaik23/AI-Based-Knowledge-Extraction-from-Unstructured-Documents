"""
OCR module for extracting text from scanned PDFs and images.
Uses pytesseract for Optical Character Recognition.
"""

import pytesseract
from PIL import Image
from typing import List, Dict
import io
import os
from app.config import settings


# Configure Tesseract path if specified
if settings.TESSERACT_PATH and os.path.exists(settings.TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_PATH


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from a single image file using OCR.
    
    Args:
        image_path: Path to the image file (PNG, JPG, JPEG)
    
    Returns:
        Extracted text string
    """
    try:
        image = Image.open(image_path)
        # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
        if image.mode != "RGB":
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR failed for {image_path}: {str(e)}")


def extract_text_from_image_bytes(image_bytes: bytes) -> str:
    """
    Extract text from image bytes using OCR.
    
    Args:
        image_bytes: Raw image bytes
    
    Returns:
        Extracted text string
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        if image.mode != "RGB":
            image = image.convert("RGB")
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"OCR failed on image bytes: {str(e)}")


def is_scanned_pdf_page(page_text: str, threshold: int = 50) -> bool:
    """
    Determine if a PDF page is likely scanned (image-based).
    If extracted text is very short, it's probably a scanned page.
    
    Args:
        page_text: Text extracted from the PDF page
        threshold: Minimum character count to consider as text-based
    
    Returns:
        True if the page appears to be scanned/image-based
    """
    clean = page_text.strip()
    return len(clean) < threshold
