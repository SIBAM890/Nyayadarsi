"""
OpenRouter AI Client for Nyayadarsi
Fallback LLM using DeepSeek via OpenRouter API.
Same interface as gemini_client for seamless switching.
"""
from openai import OpenAI
from backend.config import OPENROUTER_API_KEY

_client = None


def _get_client():
    global _client
    if _client is None and OPENROUTER_API_KEY:
        _client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
    return _client


async def generate(prompt: str, max_tokens: int = 2000) -> str:
    """
    Send prompt to OpenRouter (deepseek-chat) and return text response.
    Used as fallback when Gemini rate limits.
    """
    client = _get_client()
    if client is None:
        raise Exception("OpenRouter API key not configured")

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.1,
            extra_headers={
                "HTTP-Referer": "http://localhost:8000", # Optional, for including your app on openrouter.ai rankings.
                "X-Title": "Nyayadarsi", # Optional. Shows in rankings on openrouter.ai.
            }
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"OpenRouter API error: {e}")
