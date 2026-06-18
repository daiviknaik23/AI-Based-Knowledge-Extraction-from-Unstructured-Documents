"""
ChromaDB vector store management.
Handles embedding generation, storage, and semantic search.
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import uuid
from app.config import settings


# ── Singleton instances ───────────────────────────────────────

_embedding_model: Optional[SentenceTransformer] = None
_chroma_client: Optional[chromadb.PersistentClient] = None

COLLECTION_NAME = "documents"


def get_embedding_model() -> SentenceTransformer:
    """Get or initialize the embedding model (singleton)."""
    global _embedding_model
    if _embedding_model is None:
        print(f"[VectorStore] Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        print("[VectorStore] Embedding model loaded successfully.")
    return _embedding_model


def get_chroma_client() -> chromadb.PersistentClient:
    """Get or initialize the ChromaDB client (singleton)."""
    global _chroma_client
    if _chroma_client is None:
        print(f"[VectorStore] Initializing ChromaDB at: {settings.CHROMA_DB_PATH}")
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        print("[VectorStore] ChromaDB initialized successfully.")
    return _chroma_client


def get_collection():
    """Get or create the documents collection."""
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of texts.
    
    Args:
        texts: List of text strings to embed
    
    Returns:
        List of embedding vectors
    """
    model = get_embedding_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def store_chunks(
    chunks: List[Dict[str, Any]],
    document_id: str,
) -> int:
    """
    Store text chunks with embeddings in ChromaDB.
    
    Args:
        chunks: List of chunk dicts with 'content' and 'metadata'
        document_id: Unique document identifier
    
    Returns:
        Number of chunks stored
    """
    if not chunks:
        return 0

    collection = get_collection()

    # Prepare data for ChromaDB
    texts = [chunk["content"] for chunk in chunks]
    embeddings = generate_embeddings(texts)

    ids = []
    metadatas = []
    for i, chunk in enumerate(chunks):
        chunk_id = f"{document_id}_chunk_{i}"
        ids.append(chunk_id)
        metadatas.append({
            "document_id": document_id,
            "filename": chunk["metadata"]["filename"],
            "page_number": chunk["metadata"].get("page_number", 0),
            "chunk_index": chunk["metadata"].get("chunk_index", i),
        })

    # Upsert into ChromaDB
    collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    return len(ids)


def search_similar(
    query: str,
    top_k: int = None,
    document_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Perform semantic search for similar chunks.
    
    Args:
        query: The search query
        top_k: Number of results to return
        document_id: Optional filter by document ID
    
    Returns:
        List of matching chunks with scores
    """
    top_k = top_k or settings.TOP_K_RESULTS
    collection = get_collection()

    # Generate query embedding
    query_embedding = generate_embeddings([query])[0]

    # Build where filter if document_id specified
    where_filter = None
    if document_id:
        where_filter = {"document_id": document_id}

    # Search
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where=where_filter,
        include=["documents", "metadatas", "distances"],
    )

    # Format results
    formatted = []
    if results and results["ids"] and results["ids"][0]:
        for i in range(len(results["ids"][0])):
            formatted.append({
                "chunk_id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i],
                "relevance_score": round(1 - results["distances"][0][i], 4),
            })

    return formatted


def delete_document_chunks(document_id: str) -> bool:
    """
    Delete all chunks belonging to a document.
    
    Args:
        document_id: The document ID whose chunks to delete
    
    Returns:
        True if successful
    """
    try:
        collection = get_collection()
        # Get all chunk IDs for this document
        results = collection.get(
            where={"document_id": document_id},
            include=[],
        )
        if results["ids"]:
            collection.delete(ids=results["ids"])
        return True
    except Exception:
        return False


def get_document_chunks(document_id: str) -> List[Dict[str, Any]]:
    """Retrieve all chunks for a specific document."""
    collection = get_collection()
    results = collection.get(
        where={"document_id": document_id},
        include=["documents", "metadatas"],
    )

    chunks = []
    if results["ids"]:
        for i in range(len(results["ids"])):
            chunks.append({
                "chunk_id": results["ids"][i],
                "content": results["documents"][i],
                "metadata": results["metadatas"][i],
            })

    return chunks
