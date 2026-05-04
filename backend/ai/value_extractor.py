"""
Value Extractor for Nyayadarsi
Extracts specific values from bidder documents to match against tender criteria.
Phase 1: Returns mock data for demo. Phase 2: Real AI extraction.
"""
# gemini_client imported in Phase 2 when live extraction is wired up


EXTRACTION_PROMPT = """You are verifying a bidder document against a tender criterion.

CRITERION: {criterion_description}
THRESHOLD: {threshold} {threshold_unit}

Extract the EXACT value from the document that satisfies or fails this criterion.
Return ONLY valid JSON:
{{
  "extracted_value": 1500000,
  "source_quote": "exact text from document",
  "page_number": 4,
  "confidence": 0.95,
  "meets_threshold": true
}}

No explanation. No markdown. No backticks.

DOCUMENT TEXT:
{document_text}"""


async def extract_value(document_text: str, criterion: dict) -> dict:
    """
    Extract a specific value from document text matching a criterion.
    Currently returns structured result — Gemini integration for Phase 2.
    """
    # For MVP: return a structured placeholder
    # Real implementation would call Gemini with the extraction prompt
    return {
        "extracted_value": None,
        "source_quote": "",
        "page_number": None,
        "confidence": 0.0,
        "meets_threshold": None,
        "note": "Value extraction via Gemini - Phase 2 implementation",
    }
