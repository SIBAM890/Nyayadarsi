"""
PDF Reader for Nyayadarsi
Extracts text from tender PDFs using pdfplumber with PyMuPDF fallback.
"""
import io
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None


def extract_text(file_path: str = None, file_bytes: bytes = None) -> dict:
    """
    Extract text from a PDF file.
    Tries pdfplumber first (better for digital PDFs), falls back to PyMuPDF.
    
    Returns:
        {
            "text": str,
            "pages": int,
            "tables": list,
            "method": str,
            "is_scanned": bool,
        }
    """
    text = ""
    pages = 0
    tables = []
    method = "none"

    # Try pdfplumber first
    if pdfplumber:
        try:
            if file_bytes:
                pdf = pdfplumber.open(io.BytesIO(file_bytes))
            else:
                pdf = pdfplumber.open(file_path)

            page_texts = []
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                page_texts.append(page_text)

                # Extract tables if present
                page_tables = page.extract_tables()
                if page_tables:
                    tables.extend(page_tables)

            text = "\n\n".join(page_texts)
            pages = len(pdf.pages)
            method = "pdfplumber"
            pdf.close()

        except Exception as e:
            print(f"⚠️ pdfplumber failed: {e}")
            text = ""

    # Fallback to PyMuPDF
    if not text and fitz:
        try:
            if file_bytes:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
            else:
                doc = fitz.open(file_path)

            page_texts = []
            for page in doc:
                page_texts.append(page.get_text())

            text = "\n\n".join(page_texts)
            pages = len(doc)
            method = "pymupdf"
            doc.close()

        except Exception as e:
            print(f"⚠️ PyMuPDF failed: {e}")
            text = ""

    # Check if likely scanned (low text density)
    is_scanned = False
    if pages > 0:
        chars_per_page = len(text) / pages
        is_scanned = chars_per_page < 100  # Very low text = likely scanned image

    return {
        "text": text.strip(),
        "pages": pages,
        "tables": tables,
        "method": method,
        "is_scanned": is_scanned,
    }
