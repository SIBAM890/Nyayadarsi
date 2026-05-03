"""
Generic Upload and AI Processing Routes for Nyayadarsi
Handles document upload, text extraction, and AI processing.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Any

from backend.ai import gemini_client, openrouter_client
from backend.utils.pdf_reader import extract_text

router = APIRouter(prefix="/api/v1", tags=["upload"])

@router.post("/upload", summary="Upload and process document with AI")
async def upload_and_process(file: UploadFile = File(...)) -> dict[str, Any]:
    """
    Upload a document (PDF or Text) → Extract content → Process with AI.
    """
    filename = file.filename or ""
    content_type = file.content_type or ""
    
    # ── 1. Read Content ───────────────────────────────────────────────────
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file uploaded")

    text_content = ""
    
    if filename.lower().endswith(".pdf") or content_type == "application/pdf":
        try:
            pdf_result = extract_text(file_bytes=file_bytes)
            text_content = pdf_result["text"]
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"PDF extraction failed: {str(e)}")
    else:
        try:
            text_content = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file must be a PDF or UTF-8 text file.")

    if not text_content.strip():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No readable text found in document.")

    # ── 2. AI Processing ──────────────────────────────────────────────────
    prompt = f"Please review and professionally summarize/refine the following document text:\n\n{text_content[:10000]}"
    
    ai_result = ""
    error_msg = ""
    
    # Try Gemini first
    if gemini_client.is_configured():
        try:
            ai_result = await gemini_client.generate(prompt)
        except Exception as e:
            error_msg = f"Gemini error: {str(e)}"
    
    # Fallback to OpenRouter if Gemini failed or isn't configured
    if not ai_result and openrouter_client.is_configured():
        try:
            ai_result = await openrouter_client.generate(prompt)
        except Exception as e:
            error_msg = f"{error_msg} | OpenRouter error: {str(e)}"

    if not ai_result:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI processing failed. {error_msg}"
        )

    return {
        "success": True,
        "filename": filename,
        "processed_text": ai_result,
        "original_length": len(text_content)
    }
