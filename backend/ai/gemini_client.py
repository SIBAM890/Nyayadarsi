"""
Gemini AI Client for Nyayadarsi
Wrapper around Google Genai SDK (new package: google.genai).
Uses gemini-2.5-flash for all extraction tasks.
"""
import asyncio
import logging
from typing import Optional

from google import genai as google_genai
from google.genai import types

from backend.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Valid Gemini model names for text generation
VALID_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-3-flash-preview",
    "gemini-3-pro-preview",
]

DEFAULT_MODEL = "gemini-2.5-flash"

# Client singleton
_client: Optional[google_genai.Client] = None


def _validate_api_key() -> None:
    """Validate API key exists and has correct format."""
    if not GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY is not set. "
            "Please add it to your .env file or Render environment variables."
        )
    if len(GEMINI_API_KEY) < 10:
        raise ValueError(
            "GEMINI_API_KEY appears to be invalid (too short). "
            "Please check your API key from Google AI Studio."
        )


def _get_client() -> google_genai.Client:
    """Get or create Gemini client."""
    global _client

    if _client is None:
        _validate_api_key()
        _client = google_genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Gemini client initialized with new google.genai SDK")

    return _client


async def generate(
    prompt: str,
    max_tokens: int = 2000,
    temperature: float = 0.1,
    model_name: str = DEFAULT_MODEL,
) -> str:
    """
    Send prompt to Gemini and return text response.

    Args:
        prompt: The text prompt to send to Gemini
        max_tokens: Maximum tokens in response (default: 2000)
        temperature: Sampling temperature 0.0-1.0 (default: 0.1 for accuracy)
        model_name: Gemini model to use (default: gemini-2.5-flash)

    Returns:
        Generated text response

    Raises:
        ValueError: If API key is missing or invalid
        RuntimeError: If API call fails after retries
    """
    client = _get_client()

    for attempt in range(2):
        try:
            # The new SDK is synchronous, so run in executor for async compatibility
            loop = asyncio.get_running_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        max_output_tokens=max_tokens,
                        temperature=temperature,
                    ),
                ),
            )

            # Handle empty or blocked responses
            if not response.text:
                # Check for safety blocking
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    block_reason = getattr(response.prompt_feedback, 'block_reason', None)
                    if block_reason:
                        raise RuntimeError(
                            f"Gemini blocked prompt due to safety: {block_reason}"
                        )
                raise RuntimeError("Gemini returned empty response")

            return response.text

        except Exception as e:
            error_str = str(e).lower()

            # Handle rate limit errors
            if "rate" in error_str or "quota" in error_str or "429" in error_str:
                if attempt == 0:
                    logger.warning("Gemini rate limited. Waiting 10s before retry...")
                    await asyncio.sleep(10)
                    continue
                raise RuntimeError(
                    f"Gemini rate limit exceeded after retry. "
                    f"Consider using OpenRouter fallback. Error: {e}"
                )

            # Handle authentication errors
            if "api key" in error_str or "invalid" in error_str or "401" in error_str or "403" in error_str:
                raise ValueError(
                    f"Gemini API key invalid or lacks permissions: {e}. "
                    "Get a valid key from https://aistudio.google.com/app/apikey"
                )

            # Handle timeout
            if "timeout" in error_str or "deadline" in error_str:
                raise RuntimeError(f"Gemini request timed out: {e}")

            # Handle service unavailable
            if "unavailable" in error_str or "503" in error_str:
                if attempt == 0:
                    logger.warning(f"Gemini service unavailable. Retrying in 5s... ({e})")
                    await asyncio.sleep(5)
                    continue
                raise RuntimeError(f"Gemini service unavailable after retry: {e}")

            # Unknown error - wrap and raise
            raise RuntimeError(f"Gemini API error: {e}")

    raise RuntimeError("Gemini failed after maximum retries")


def is_configured() -> bool:
    """Check if Gemini is properly configured with a valid API key."""
    return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) >= 10)
