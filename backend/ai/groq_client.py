"""
Groq AI Client for Nyayadarsi
Fallback LLM using Llama 3 8B via Groq API.
Same interface as gemini_client for seamless switching.
"""
from groq import Groq
from backend.config import GROQ_API_KEY

_client = None


def _get_client():
    global _client
    if _client is None and GROQ_API_KEY:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client


async def generate(prompt: str, max_tokens: int = 2000) -> str:
    """
    Send prompt to Groq (Llama 3 8B) and return text response.
    Used as fallback when Gemini rate limits.
    """
    client = _get_client()
    if client is None:
        raise Exception("Groq API key not configured")

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.1,
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Groq API error: {e}")
