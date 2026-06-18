"""
Document summarization module.
Generates different types of summaries using the configured LLM.
"""

import time
from typing import Dict, Any
from app.rag.pipeline import get_llm, invoke_with_retry
from app.vectorstore.chroma_store import get_document_chunks


# ── Summary Prompt Templates ─────────────────────────────────

SUMMARY_PROMPTS = {
    "concise": """Provide a concise summary of the following document content in 3-5 paragraphs.
Focus on the main topics, key arguments, and conclusions.

DOCUMENT CONTENT:
{content}

CONCISE SUMMARY:""",

    "key_points": """Extract the key points from the following document content.
List each key point as a clear, standalone statement.
Aim for 5-10 key points.

DOCUMENT CONTENT:
{content}

KEY POINTS:""",

    "bullet": """Create a comprehensive bullet-point summary of the following document content.
Organize the bullets by topic/section.
Each bullet should be a concise, informative statement.

DOCUMENT CONTENT:
{content}

BULLET SUMMARY:""",

    "insights": """Analyze the following document content and provide:
1. Main Theme: What is this document primarily about?
2. Key Findings: What are the most important findings or arguments?
3. Notable Details: What interesting details stand out?
4. Implications: What are the implications of this content?
5. Questions Raised: What questions does this content raise?

DOCUMENT CONTENT:
{content}

DOCUMENT INSIGHTS:""",
}


async def summarize_document(
    document_id: str,
    summary_type: str = "concise",
) -> Dict[str, Any]:
    """
    Generate a summary of a document.
    
    Args:
        document_id: The document to summarize
        summary_type: Type of summary (concise, key_points, bullet, insights)
    
    Returns:
        Dict with summary and metadata
    """
    start_time = time.time()

    # Retrieve all chunks for the document
    chunks = get_document_chunks(document_id)

    if not chunks:
        raise ValueError(f"No content found for document: {document_id}")

    # Combine all chunk content (limit to avoid token overflow)
    combined_content = "\n\n".join([c["content"] for c in chunks])

    # Truncate if too long (roughly 15k chars ~ 4k tokens)
    max_chars = 15000
    if len(combined_content) > max_chars:
        combined_content = combined_content[:max_chars] + "\n\n[Content truncated for summarization...]"

    # Get the appropriate prompt template
    prompt_template = SUMMARY_PROMPTS.get(summary_type, SUMMARY_PROMPTS["concise"])
    prompt = prompt_template.format(content=combined_content)

    # Generate summary with LLM
    llm = get_llm()
    summary = await invoke_with_retry(llm, prompt)

    # Get filename from first chunk
    filename = chunks[0]["metadata"].get("filename", "Unknown") if chunks else "Unknown"

    processing_time = round(time.time() - start_time, 2)

    return {
        "document_id": document_id,
        "filename": filename,
        "summary_type": summary_type,
        "summary": summary,
        "processing_time": processing_time,
    }
