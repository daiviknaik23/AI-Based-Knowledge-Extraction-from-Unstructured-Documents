"""
Documents route handler.
List and delete uploaded documents.
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import DocumentListResponse
from app.services.document_service import get_all_documents, delete_document

router = APIRouter()


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """Get list of all uploaded and processed documents."""
    docs = get_all_documents()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.delete("/document/{doc_id}")
async def remove_document(doc_id: str):
    """
    Delete a document and all its associated data.
    Removes the file, chunks from ChromaDB, and metadata.
    """
    try:
        delete_document(doc_id)
        return {"message": f"Document {doc_id} deleted successfully.", "id": doc_id}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
