"""
OpenRouter AI Client for Nyayadarsi
Fallback LLM using DeepSeek via OpenRouter API.
Same interface as gemini_client for seamless switching.
"""
import logging
from typing import Optional

from openai import AsyncOpenAI, APIError, APIConnectionError, RateLimitError, AuthenticationError

from backend.config import OPENROUTER_API_KEY

logger = logging.getLogger(__name__)

# OpenRouter configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "deepseek/deepseek-chat"

# Async client singleton
_client: Optional[AsyncOpenAI] = None


def _validate_api_key() -> None:
    """Validate API key exists and has correct format."""
    if not OPENROUTER_API_KEY:
        raise ValueError(
            "OPENROUTER_API_KEY is not set. "
            "Please add it to your .env file or Render environment variables. "
            "Get a key from https://openrouter.ai/keys"
        )
    if not OPENROUTER_API_KEY.startswith("sk-or-"):
        logger.warning(
            "OPENROUTER_API_KEY doesn't start with 'sk-or-'. "
            "This may be invalid. Get a valid key from https://openrouter.ai/keys"
        )


def _get_client() -> AsyncOpenAI:
    """Get or create async OpenRouter client."""
    global _client

    if _client is None:
        _validate_api_key()
        _client = AsyncOpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
            timeout=60.0,  # 60 second timeout for long extractions
            max_retries=2,  # Built-in retry logic
        )
        logger.info("OpenRouter async client initialized")

    return _client


async def generate(
    prompt: str,
    max_tokens: int = 2000,
    temperature: float = 0.1,
    model: str = DEFAULT_MODEL,
) -> str:
    """
    Send prompt to OpenRouter and return text response.
    Uses async client to avoid blocking the FastAPI event loop.

    Args:
        prompt: The text prompt to send
        max_tokens: Maximum tokens in response (default: 2000)
        temperature: Sampling temperature 0.0-1.0 (default: 0.1 for accuracy)
        model: Model to use via OpenRouter (default: deepseek/deepseek-chat)

    Returns:
        Generated text response

    Raises:
        ValueError: If API key is missing or invalid
        RuntimeError: If API call fails
    """
    client = _get_client()

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=temperature,
            extra_headers={
                "HTTP-Referer": "https://nyayadarsi.onrender.com",
                "X-Title": "Nyayadarsi - Procurement Justice Platform",
            },
        )

        if not response.choices or not response.choices[0].message.content:
            raise RuntimeError("OpenRouter returned empty response")

        return response.choices[0].message.content

    except AuthenticationError as e:
        raise ValueError(
            f"OpenRouter API key is invalid: {e}. "
            "Get a valid key from https://openrouter.ai/keys"
        )

    except RateLimitError as e:
        raise RuntimeError(
            f"OpenRouter rate limit exceeded: {e}. "
            "Check your usage at https://openrouter.ai/activity"
        )

    except APIConnectionError as e:
        raise RuntimeError(
            f"Failed to connect to OpenRouter: {e}. "
            "Check your network connection."
        )

    except APIError as e:
        raise RuntimeError(f"OpenRouter API error: {e}")

    except Exception as e:
        raise RuntimeError(f"Unexpected OpenRouter error: {e}")


def is_configured() -> bool:
    """Check if OpenRouter is properly configured with a valid API key."""
    return bool(OPENROUTER_API_KEY and len(OPENROUTER_API_KEY) >= 10)
