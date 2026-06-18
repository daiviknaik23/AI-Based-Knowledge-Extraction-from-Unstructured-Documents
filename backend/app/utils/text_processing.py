"""
Text cleaning and processing utilities.
Handles normalization, deduplication, and chunking of extracted text.
"""

import re
from typing import List, Dict, Any
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings


def clean_text(text: str) -> str:
    """
    Clean and normalize extracted text.
    
    - Remove excessive whitespace
    - Remove duplicate blank lines
    - Normalize unicode characters
    - Strip leading/trailing whitespace
    """
    if not text:
        return ""

    # Replace multiple spaces with single space
    text = re.sub(r'[ \t]+', ' ', text)

    # Replace multiple newlines with double newline
    text = re.sub(r'\n\s*\n', '\n\n', text)

    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]

    # Remove duplicate consecutive lines
    deduplicated = []
    prev_line = None
    for line in lines:
        if line != prev_line:
            deduplicated.append(line)
            prev_line = line

    text = '\n'.join(deduplicated)

    # Final strip
    return text.strip()


def chunk_text(
    text: str,
    filename: str,
    page_number: int = 0,
    chunk_size: int = None,
    chunk_overlap: int = None,
) -> List[Dict[str, Any]]:
    """
    Split text into semantic chunks with metadata.
    
    Args:
        text: The text to chunk
        filename: Source filename for metadata
        page_number: Source page number for metadata
        chunk_size: Size of each chunk (default from settings)
        chunk_overlap: Overlap between chunks (default from settings)
    
    Returns:
        List of dicts with 'content' and 'metadata' keys
    """
    if not text or not text.strip():
        return []

    chunk_size = chunk_size or settings.CHUNK_SIZE
    chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)

    result = []
    for i, chunk_content in enumerate(chunks):
        result.append({
            "content": chunk_content,
            "metadata": {
                "filename": filename,
                "page_number": page_number,
                "chunk_index": i,
            },
        })

    return result


def validate_file_extension(filename: str) -> bool:
    """Check if the file extension is allowed."""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in settings.ALLOWED_EXTENSIONS


def get_file_extension(filename: str) -> str:
    """Get the file extension in lowercase."""
    return "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
