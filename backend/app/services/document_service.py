"""
Document processing service.
Handles the complete pipeline: upload → extract → clean → chunk → embed → store.
"""

import os
import uuid
import json
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path

from pypdf import PdfReader
import pdfplumber
from PIL import Image

from app.config import settings
from app.utils.text_processing import clean_text, chunk_text, get_file_extension
from app.ocr.ocr_engine import extract_text_from_image, is_scanned_pdf_page
from app.vectorstore.chroma_store import store_chunks, delete_document_chunks


# ── Document metadata store (JSON-based for simplicity) ──────
METADATA_FILE = os.path.join(settings.UPLOAD_DIR, "_metadata.json")


def _load_metadata() -> Dict[str, Any]:
    """Load document metadata from JSON file."""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r") as f:
            return json.load(f)
    return {}


def _save_metadata(metadata: Dict[str, Any]):
    """Save document metadata to JSON file."""
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)


def _add_document_metadata(doc_id: str, info: Dict[str, Any]):
    """Add metadata for a new document."""
    metadata = _load_metadata()
    metadata[doc_id] = info
    _save_metadata(metadata)


def _remove_document_metadata(doc_id: str):
    """Remove metadata for a document."""
    metadata = _load_metadata()
    if doc_id in metadata:
        del metadata[doc_id]
        _save_metadata(metadata)


# ── Text Extraction ──────────────────────────────────────────

def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract text from a PDF file, with OCR fallback for scanned pages.
    
    Returns:
        List of dicts with 'text' and 'page_number' keys
    """
    pages = []

    try:
        # Try pdfplumber first (better for complex layouts)
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""

                # If page appears scanned, try OCR
                if is_scanned_pdf_page(text):
                    try:
                        # Convert PDF page to image for OCR
                        img = page.to_image(resolution=300)
                        pil_image = img.original
                        import pytesseract
                        text = pytesseract.image_to_string(pil_image)
                    except Exception:
                        pass  # Keep whatever text we got

                pages.append({
                    "text": text,
                    "page_number": i + 1,
                })

    except Exception:
        # Fallback to PyPDF
        try:
            reader = PdfReader(file_path)
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                pages.append({
                    "text": text,
                    "page_number": i + 1,
                })
        except Exception as e:
            raise RuntimeError(f"Failed to extract text from PDF: {str(e)}")

    return pages


def extract_text_from_txt(file_path: str) -> List[Dict[str, Any]]:
    """Extract text from a plain text file."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    return [{"text": text, "page_number": 1}]


def extract_text_from_image_file(file_path: str) -> List[Dict[str, Any]]:
    """Extract text from an image file using OCR."""
    text = extract_text_from_image(file_path)
    return [{"text": text, "page_number": 1}]


# ── Main Processing Pipeline ────────────────────────────────

async def process_document(
    file_path: str,
    filename: str,
    file_size: int,
) -> Dict[str, Any]:
    """
    Complete document processing pipeline:
    1. Extract text (with OCR if needed)
    2. Clean text
    3. Chunk text
    4. Generate embeddings and store in ChromaDB
    
    Args:
        file_path: Path to the uploaded file
        filename: Original filename
        file_size: File size in bytes
    
    Returns:
        Processing result with metadata
    """
    doc_id = str(uuid.uuid4())[:12]
    ext = get_file_extension(filename)

    # Step 1: Extract text based on file type
    if ext == ".pdf":
        pages = extract_text_from_pdf(file_path)
    elif ext == ".txt":
        pages = extract_text_from_txt(file_path)
    elif ext in [".png", ".jpg", ".jpeg"]:
        pages = extract_text_from_image_file(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    # Step 2 & 3: Clean and chunk each page
    all_chunks = []
    for page in pages:
        cleaned = clean_text(page["text"])
        if cleaned:
            chunks = chunk_text(
                text=cleaned,
                filename=filename,
                page_number=page["page_number"],
            )
            all_chunks.extend(chunks)

    if not all_chunks:
        raise ValueError("No text could be extracted from the document.")

    # Step 4: Store chunks with embeddings in ChromaDB
    num_stored = store_chunks(all_chunks, doc_id)

    # Save document metadata
    doc_info = {
        "id": doc_id,
        "filename": filename,
        "file_type": ext,
        "file_size": file_size,
        "num_pages": len(pages),
        "num_chunks": num_stored,
        "uploaded_at": datetime.now().isoformat(),
        "status": "processed",
        "file_path": file_path,
    }
    _add_document_metadata(doc_id, doc_info)

    return doc_info


def get_all_documents() -> List[Dict[str, Any]]:
    """Get metadata for all uploaded documents."""
    metadata = _load_metadata()
    return list(metadata.values())


def get_document(doc_id: str) -> Dict[str, Any]:
    """Get metadata for a specific document."""
    metadata = _load_metadata()
    if doc_id not in metadata:
        raise ValueError(f"Document not found: {doc_id}")
    return metadata[doc_id]


def delete_document(doc_id: str) -> bool:
    """
    Delete a document and its chunks.
    
    Args:
        doc_id: Document ID to delete
    
    Returns:
        True if successful
    """
    metadata = _load_metadata()
    if doc_id not in metadata:
        raise ValueError(f"Document not found: {doc_id}")

    doc = metadata[doc_id]

    # Delete the uploaded file
    file_path = doc.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    # Delete chunks from ChromaDB
    delete_document_chunks(doc_id)

    # Remove metadata
    _remove_document_metadata(doc_id)

    return True
