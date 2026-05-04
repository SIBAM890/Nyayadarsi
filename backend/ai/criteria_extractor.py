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


async def extract(tender_text: str) -> list:
    """
    Extract eligibility criteria from tender text using AI.
    Returns validated list of criterion dicts.
    Never crashes — returns empty list on failure.
    """
    if not tender_text or len(tender_text.strip()) < 50:
        return []

    prompt = EXTRACTION_PROMPT.format(tender_text=tender_text[:15000])  # Cap context

    # Try Gemini first, fallback to OpenRouter
    raw_response = None
    model_used = None

    # Check if Gemini is configured
    if gemini_client.is_configured():
        try:
            raw_response = await gemini_client.generate(prompt, max_tokens=4000)
            model_used = gemini_client.DEFAULT_MODEL
            logger.info(f"Successfully extracted criteria using {model_used}")
        except ValueError as e:
            # API key issue - log and skip to fallback
            logger.warning(f"Gemini configuration error: {e}. Trying OpenRouter fallback...")
        except RuntimeError as e:
            logger.warning(f"Gemini API failed: {e}. Falling back to OpenRouter...")
    else:
        logger.info("Gemini not configured. Using OpenRouter directly.")

    # Fallback to OpenRouter if Gemini failed or not configured
    if raw_response is None and openrouter_client.is_configured():
        try:
            raw_response = await openrouter_client.generate(prompt, max_tokens=4000)
            model_used = f"openrouter/{openrouter_client.DEFAULT_MODEL}"
            logger.info(f"Successfully extracted criteria using {model_used}")
        except ValueError as e:
            logger.error(f"OpenRouter configuration error: {e}")
        except RuntimeError as e:
            logger.error(f"OpenRouter API failed: {e}")

    # Both failed
    if raw_response is None:
        logger.error("Both Gemini and OpenRouter failed. Check API keys and network.")
        return []

    if not raw_response:
        logger.warning("AI returned empty response")
        return []

    # Parse JSON — attempt repair if Gemini returned slightly malformed output
    try:
        cleaned = _clean_json_response(raw_response)
        cleaned = _repair_json(cleaned)  # Recover truncated/trailing-comma JSON
        criteria = json.loads(cleaned)

        if not isinstance(criteria, list):
            print(f"⚠️ AI returned non-list: {type(criteria)}")
            return []

        # Validate each criterion has required fields
        validated = []
        for i, c in enumerate(criteria):
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

        return validated

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e}")
        logger.error(f"Failed to parse JSON. Raw response:\n{raw_response}")
        logger.error(f"Cleaned string attempted:\n{cleaned}")
        return []
