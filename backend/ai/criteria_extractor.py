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
Return ONLY valid JSON array. No explanation. No markdown. No backticks.

Each criterion must have:
[
  {{
    "criterion_id": "FIN_001",
    "type": "financial", // Choose one: "financial", "technical", "compliance"
    "description": "exact description from tender",
    "threshold": 50000000,
    "threshold_unit": "INR", // Choose one: "INR", "years", "projects", "boolean"
    "mandatory": true,
    "blocker": false,
    "language_signal": "shall", // e.g., "shall", "must", "preferred", "may"
    "specificity_alert": false,
    "acceptable_documents": ["CA_certificate", "audited_balance_sheet"]
  }}
]

MANDATORY RULES:
- mandatory=true when text uses: shall, must, mandatory, essential, required
- mandatory=false when text uses: preferred, desirable, advantageous, may
- blocker=true only when mandatory=true AND failure means disqualification
- threshold must be a NUMBER not a string. Rs 5 Crore = 50000000
- specificity_alert=true when criterion mentions specific brand, model number, or year range narrower than 5 years

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

    # ── Truncation strategies (response got cut off mid-object) ──────────────
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

    prompt = EXTRACTION_PROMPT.format(tender_text=tender_text[:15000])

    # ── Try Gemini first, fallback to OpenRouter ──────────────────────────────
    raw_response = None
    model_used = None

    if gemini_client.is_configured():
        try:
            raw_response = await gemini_client.generate(prompt, max_tokens=4000)
            model_used = gemini_client.DEFAULT_MODEL
            logger.info(f"Successfully extracted criteria using {model_used}")
        except ValueError as e:
            logger.warning(f"Gemini configuration error: {e}. Trying OpenRouter fallback...")
        except RuntimeError as e:
            logger.warning(f"Gemini API failed: {e}. Falling back to OpenRouter...")
    else:
        logger.info("Gemini not configured. Using OpenRouter directly.")

    if raw_response is None and openrouter_client.is_configured():
        try:
            raw_response = await openrouter_client.generate(prompt, max_tokens=4000)
            model_used = f"openrouter/{openrouter_client.DEFAULT_MODEL}"
            logger.info(f"Successfully extracted criteria using {model_used}")
        except ValueError as e:
            logger.error(f"OpenRouter configuration error: {e}")
        except RuntimeError as e:
            logger.error(f"OpenRouter API failed: {e}")

    # ── Both AI providers failed ──────────────────────────────────────────────
    if raw_response is None:
        return _empty(
            "Both Gemini and OpenRouter are unavailable. Check API keys and network connectivity.",
            "SERVICE_UNAVAILABLE"
        )

    if not raw_response.strip():
        return _empty("AI returned an empty response. The model may be overloaded — please retry.", "EMPTY_RESPONSE")

    # ── Parse JSON (with repair) ──────────────────────────────────────────────
    try:
        cleaned = _clean_json_response(raw_response)
        cleaned = _repair_json(cleaned)
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        logger.error(f"Raw response:\n{raw_response}")
        logger.error(f"Cleaned string attempted:\n{cleaned}")
        return _empty(
            "AI returned malformed JSON that could not be repaired.",
            "PARSE_ERROR"
        )

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
