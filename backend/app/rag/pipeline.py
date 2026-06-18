"""
RAG (Retrieval-Augmented Generation) pipeline.
Combines semantic search with LLM generation for contextual Q&A.
"""

import time
import asyncio
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.vectorstore.chroma_store import search_similar

logger = logging.getLogger(__name__)

MAX_RETRIES = 5
INITIAL_BACKOFF = 2  # seconds


def get_llm():
    """
    Initialize and return the configured LLM.
    Supports both Gemini and OpenAI providers.
    """
    provider = settings.LLM_PROVIDER.lower()

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
        )
    elif provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model="gpt-3.5-turbo",
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.3,
        )
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")


async def invoke_with_retry(llm, prompt: str) -> str:
    """
    Invoke the LLM with automatic retry and exponential backoff
    for rate-limit (429) errors.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = llm.invoke(prompt)
            return response.content if hasattr(response, 'content') else str(response)
        except Exception as e:
            error_str = str(e)
            is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower()

            if is_rate_limit and attempt < MAX_RETRIES:
                wait_time = INITIAL_BACKOFF * (2 ** (attempt - 1))
                logger.warning(f"Rate limited (attempt {attempt}/{MAX_RETRIES}). Retrying in {wait_time}s...")
                await asyncio.sleep(wait_time)
            else:
                raise


def build_context(chunks: list) -> str:
    """
    Build a context string from retrieved chunks for the LLM prompt.
    
    Args:
        chunks: List of chunk dicts from vector search
    
    Returns:
        Formatted context string with source references
    """
    if not chunks:
        return "No relevant context found."

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk["metadata"].get("filename", "Unknown")
        page = chunk["metadata"].get("page_number", "N/A")
        context_parts.append(
            f"[Source {i}: {source}, Page {page}]\n{chunk['content']}"
        )

    return "\n\n---\n\n".join(context_parts)


def build_qa_prompt(question: str, context: str) -> str:
    """Build the QA prompt for the LLM."""
    return f"""You are an AI assistant that answers questions based on the provided document context.
Use ONLY the information from the context below to answer the question.
If the context doesn't contain enough information, say so clearly.
Always cite which source(s) you used in your answer.

CONTEXT:
{context}

QUESTION: {question}

INSTRUCTIONS:
1. Answer the question accurately based on the context
2. Reference the source numbers (e.g., [Source 1]) when citing information
3. If multiple sources support your answer, cite all of them
4. If the context doesn't contain the answer, state that clearly
5. Be concise but thorough

ANSWER:"""


async def query_rag(
    question: str,
    document_id: Optional[str] = None,
    top_k: int = None,
) -> Dict[str, Any]:
    """
    Execute the full RAG pipeline:
    1. Convert question to embedding
    2. Retrieve relevant chunks via semantic search
    3. Build context from retrieved chunks
    4. Send context + question to LLM
    5. Return answer with source citations
    
    Args:
        question: User's question
        document_id: Optional filter to search within a specific document
        top_k: Number of chunks to retrieve
    
    Returns:
        Dict with answer, sources, and metadata
    """
    start_time = time.time()
    top_k = top_k or settings.TOP_K_RESULTS

    # Step 1 & 2: Semantic search
    retrieved_chunks = search_similar(
        query=question,
        top_k=top_k,
        document_id=document_id,
    )

    # Step 3: Build context
    context = build_context(retrieved_chunks)

    # Step 4: Generate answer with LLM
    llm = get_llm()
    prompt = build_qa_prompt(question, context)

    answer = await invoke_with_retry(llm, prompt)

    # Step 5: Format sources
    sources = []
    for chunk in retrieved_chunks:
        sources.append({
            "content": chunk["content"],
            "filename": chunk["metadata"].get("filename", "Unknown"),
            "page_number": chunk["metadata"].get("page_number"),
            "chunk_id": chunk["chunk_id"],
            "relevance_score": chunk.get("relevance_score", 0),
        })

    processing_time = round(time.time() - start_time, 2)

    return {
        "answer": answer,
        "sources": sources,
        "question": question,
        "processing_time": processing_time,
    }
