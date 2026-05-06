"""
Criteria Extractor for Nyayadarsi
Core AI pipeline: Takes raw text from tender PDF → Returns structured criteria JSON.
Uses Gemini with fallback to OpenRouter.
"""
import json
import logging
import re
from backend.ai import gemini_client, openrouter_client

logger = logging.getLogger(__name__)


EXTRACTION_PROMPT = """You are an expert in Indian government procurement law under GFR 2017.

Extract ALL eligibility criteria from the tender text below. 
Be COMPREHENSIVE. Do not skip or truncate any technical, financial, or compliance requirements.
Return ONLY a valid JSON array. No explanation. No markdown. No backticks.

Expected Format:
[
  {
    "criterion_id": "FIN_001",
    "type": "financial",
    "description": "exact description from tender",
    "threshold": 50000000,
    "threshold_unit": "INR",
    "mandatory": true,
    "blocker": false,
    "language_signal": "shall",
    "specificity_alert": false,
    "acceptable_documents": ["CA_certificate"]
  }
]

RULES:
- mandatory=true for: shall, must, mandatory, essential, required.
- threshold must be a NUMBER (e.g., 50000000).
- If the document is long, ensure the JSON array is complete and closed.

TENDER TEXT:
{tender_text}"""



def _clean_json_response(text: str) -> str:
    """Strip markdown code fences and other noise from LLM response."""
    # Remove ```json ... ``` wrapping
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```$', '', text.strip())
    # Find the JSON array
    start = text.find('[')
    end = text.rfind(']')
    if start != -1 and end != -1:
        return text[start:end + 1]
    return text


def _repair_json(text: str) -> str:
    """
    Attempt to repair malformed JSON from LLM responses.
    Covers all common Gemini/DeepSeek JSON quirks.
    """
    # First try as-is
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass

    # ── Normalisation pass ───────────────────────────────────────────────────
    repaired = text

    # 1. Strip JavaScript-style single-line comments  // ...
    repaired = re.sub(r'//[^\n]*', '', repaired)
    # 2. Strip JavaScript-style block comments  /* ... */
    repaired = re.sub(r'/\*.*?\*/', '', repaired, flags=re.DOTALL)
    # 3. Replace JS/Python non-JSON literals with null
    repaired = re.sub(r'\bundefined\b', 'null', repaired)
    repaired = re.sub(r'\bNone\b', 'null', repaired)
    repaired = re.sub(r'\bNaN\b', 'null', repaired)
    repaired = re.sub(r'\bInfinity\b', 'null', repaired)
    repaired = re.sub(r'\b-Infinity\b', 'null', repaired)
    # 4. Replace Python booleans True/False → true/false
    repaired = re.sub(r'\bTrue\b', 'true', repaired)
    repaired = re.sub(r'\bFalse\b', 'false', repaired)
    # 5. Remove trailing commas before } or ]  (e.g. {"a":1,})
    repaired = re.sub(r',\s*([}\]])', r'\1', repaired)

    try:
        json.loads(repaired)
        return repaired
    except json.JSONDecodeError:
        pass

    # Strategy A: truncate at last complete object '}' and close the array
    last_close = repaired.rfind('}')
    if last_close != -1:
        candidate = repaired[:last_close + 1] + ']'
        candidate = re.sub(r',\s*([}\]])', r'\1', candidate)
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass

    # Strategy B: "Force Close" — append missing closing markers
    # 1. Close string if open
    if repaired.count('"') % 2 != 0:
        repaired += '"'
    
    # 2. Add closing braces/brackets based on count
    open_braces = repaired.count('{') - repaired.count('}')
    open_brackets = repaired.count('[') - repaired.count(']')
    
    repaired += ('}' * max(0, open_braces))
    repaired += (']' * max(0, open_brackets))
    
    # 3. Final cleanup of trailing commas before closing
    repaired = re.sub(r',\s*([}\]])', r'\1', repaired)

    try:
        json.loads(repaired)
        return repaired
    except json.JSONDecodeError:
        pass

    # Give up — return whatever we have (caller will log the error)
    return repaired


def _validate_criteria_schema(data: object) -> list:
    """
    Ensure the parsed AI output is a list of criterion dicts.
    Handles cases where Gemini wraps the array in a dict:
      - {"criteria": [...]}   → unwrap and return the list
      - [{...}, {...}]        → return as-is
      - anything else         → return empty list (fail-safe)
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        # Common wrapper: {"criteria": [...]} or {"eligibility_criteria": [...]}
        for key in ("criteria", "eligibility_criteria", "items", "results"):
            if key in data and isinstance(data[key], list):
                logger.warning(f"AI wrapped response in dict key '{key}' — unwrapping.")
                return data[key]
    logger.error(f"AI returned invalid top-level structure: {type(data)}. Expected list.")
    return []



async def extract(tender_text: str) -> dict:
    """
    Extract eligibility criteria from tender text using AI.

    Returns:
        {
            "criteria": list[dict],   # validated criterion objects
            "warning": {              # structured warning if criteria is empty
                "message": str,
                "type": str
            } | None
        }
    Never crashes — returns a warning dict on every failure path.
    """

    def _empty(message: str, error_type: str = "GENERIC_ERROR") -> dict:
        """Consistent empty result with a structured warning."""
        logger.warning(f"[{error_type}] {message}")
        return {
            "criteria": [], 
            "warning": {
                "message": message,
                "type": error_type
            }
        }

    # ── Guard: document too short ─────────────────────────────────────────────
    if not tender_text or len(tender_text.strip()) < 50:
        return _empty("Document text is too short or empty for AI extraction.", "EMPTY_DOC")

    # ── Safe Prompt Generation ──────────────────────────────────────────────
    # We use replacement instead of .format() to avoid KeyError if tender_text contains { }
    prompt = EXTRACTION_PROMPT.replace("{tender_text}", tender_text[:20000])

    # ── Try Extraction with Retry (Robust Loop) ──────────────────────────────
    # We retry the whole AI process if JSON parsing fails even after repair.
    for attempt in range(3):
        raw_response = None
        model_used = None

        # ── Call AI Providers ──
        if gemini_client.is_configured():
            try:
                # Call Gemini (without schema to avoid limiting output size)
                raw_response = await gemini_client.generate(prompt, max_tokens=4000)
                model_used = gemini_client.DEFAULT_MODEL
            except Exception as e:
                logger.warning(f"Gemini API failed (attempt {attempt+1}): {e}")

        if raw_response is None and openrouter_client.is_configured():
            try:
                raw_response = await openrouter_client.generate(prompt, max_tokens=4000)
                model_used = f"openrouter/{openrouter_client.DEFAULT_MODEL}"
            except Exception as e:
                logger.warning(f"OpenRouter API failed (attempt {attempt+1}): {e}")

        if raw_response is None:
            if attempt < 2: continue
            return _empty("AI providers unavailable. Check API keys.", "SERVICE_UNAVAILABLE")

        if not raw_response.strip():
            if attempt < 2: continue
            return _empty("AI returned empty response.", "EMPTY_RESPONSE")

        # ── Parse and Validate JSON ──
        try:
            cleaned = _clean_json_response(raw_response)
            repaired = _repair_json(cleaned)
            parsed = json.loads(repaired)
            
            # Successfully parsed! Break the retry loop
            criteria_list = _validate_criteria_schema(parsed)
            break
            
        except json.JSONDecodeError as e:
            if attempt < 2:
                logger.warning(f"JSON Parse Error (attempt {attempt+1}). Model may have truncated. Retrying...")
                continue
            
            logger.error(f"JSON parse error after final attempt: {e}")
            logger.error(f"Raw response snippets: {raw_response[:200]}...{raw_response[-200:]}")
            return _empty(
                "AI consistently returned malformed JSON that could not be repaired.",
                "PARSE_ERROR"
            )
    else:
        return _empty("AI extraction failed after multiple retries.", "MAX_RETRIES_EXCEEDED")

    # ── Validate schema ───────────────────────────────────────────────────────
    criteria_list = _validate_criteria_schema(parsed)
    if not criteria_list:
        return _empty(
            "AI returned valid JSON but in an unexpected structure.",
            "SCHEMA_MISMATCH"
        )

    # ── Field-level validation ────────────────────────────────────────────────
    validated = []
    for i, c in enumerate(criteria_list):
        validated_criterion = {
            "criterion_id": c.get("criterion_id", f"CRIT_{i+1:03d}"),
            "type": c.get("type", "compliance"),
            "description": c.get("description", ""),
            "threshold": c.get("threshold"),
            "threshold_unit": c.get("threshold_unit"),
            "mandatory": bool(c.get("mandatory", False)),
            "blocker": bool(c.get("blocker", False)),
            "language_signal": c.get("language_signal"),
            "specificity_alert": bool(c.get("specificity_alert", False)),
            "acceptable_documents": c.get("acceptable_documents", []),
            "model_used": model_used,
        }
        if validated_criterion["description"]:
            validated.append(validated_criterion)

    if not validated:
        return _empty(
            "AI could not confidently extract any eligibility criteria from this document.",
            "NO_CRITERIA_FOUND"
        )

    return {"criteria": validated, "warning": None}
