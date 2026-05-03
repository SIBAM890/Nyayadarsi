"""
Gemini AI Client for Nyayadarsi
Wrapper around Google Generative AI SDK.
Uses gemini-2.5-flash for all extraction tasks.
"""
import asyncio
import logging
import google.generativeai as genai
from backend.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Configure on import
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

_model = None


def _get_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel("gemini-2.5-flash")
    return _model


async def generate(prompt: str, max_tokens: int = 2000) -> str:
    """
    Send prompt to Gemini and return text response.
    Retries once on rate limit with 10s backoff (async-safe).
    Raises exception on second failure so caller can fallback to Groq.
    """
    model = _get_model()

    for attempt in range(2):
        try:
            # Run the blocking SDK call in a thread pool to avoid blocking the event loop
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        max_output_tokens=max_tokens,
                        temperature=0.1,  # Low temperature for extraction accuracy
                    ),
                ),
            )
            return response.text
        except Exception as e:
            error_str = str(e).lower()
            if "rate" in error_str or "quota" in error_str or "429" in error_str:
                if attempt == 0:
                    logger.warning("Gemini rate limited. Waiting 10s before retry...")
                    await asyncio.sleep(10)  # Non-blocking — does NOT freeze the server
                    continue
            raise Exception(f"Gemini API error: {e}")

    raise Exception("Gemini rate limit exceeded after retry")
