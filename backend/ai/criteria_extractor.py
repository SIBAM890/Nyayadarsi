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
{{
  "criterion_id": "FIN_001",
  "type": "financial" | "technical" | "compliance",
  "description": "exact description from tender",
  "threshold": 50000000,
  "threshold_unit": "INR" | "years" | "projects" | "boolean",
  "mandatory": true | false,
  "blocker": true | false,
  "language_signal": "shall" | "must" | "preferred" | "may",
  "specificity_alert": true | false,
  "acceptable_documents": ["CA_certificate", "audited_balance_sheet"]
}}

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

    # Parse JSON
    try:
        cleaned = _clean_json_response(raw_response)
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
        logger.debug(f"Raw response (first 500 chars): {raw_response[:500]}")
        return []
