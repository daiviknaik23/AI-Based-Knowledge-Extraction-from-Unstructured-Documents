"""
Upload route handler.
Handles document upload with file validation and processing.
"""

import os
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import settings
from app.utils.text_processing import validate_file_extension
from app.services.document_service import process_document

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/upload")
@limiter.limit("10/minute")
async def upload_document(request: Request, file: UploadFile = File(...)):
    """
    Upload a document for processing.
    
    Supports: PDF, TXT, PNG, JPG, JPEG
    Max size: 50MB (configurable)
    
    Pipeline: Upload → Extract Text → Clean → Chunk → Embed → Store
    """
    # Validate file extension
    if not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {settings.ALLOWED_EXTENSIONS}",
        )

    # Read file content
    content = await file.read()
    file_size = len(content)

    # Validate file size
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Validate content is not empty
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    # Save file to uploads directory
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

    # Handle duplicate filenames
    base, ext = os.path.splitext(file.filename)
    counter = 1
    while os.path.exists(file_path):
        file_path = os.path.join(settings.UPLOAD_DIR, f"{base}_{counter}{ext}")
        counter += 1

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    try:
        # Process document through the full pipeline
        result = await process_document(
            file_path=file_path,
            filename=file.filename,
            file_size=file_size,
        )

        return {
            "id": result["id"],
            "filename": result["filename"],
            "file_type": result["file_type"],
            "file_size": result["file_size"],
            "num_pages": result.get("num_pages"),
            "num_chunks": result["num_chunks"],
            "message": "Document uploaded and processed successfully.",
            "uploaded_at": result["uploaded_at"],
        }

    except ValueError as e:
        # Clean up file on processing error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {str(e)}",
        )
