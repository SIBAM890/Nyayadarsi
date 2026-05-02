"""
Test Gemini API Connection
Quick validation that API key works and JSON parsing is correct.
Run before demo to verify rate limit status.
"""
import sys
import os
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("❌ GEMINI_API_KEY not set in .env file")
        print("   Get a free key at: https://aistudio.google.com/app/apikey")
        return False

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        print("📡 Testing Gemini API connection...")
        start = time.time()

        response = model.generate_content(
            'Return ONLY this JSON: [{"test": true, "status": "ok"}]',
            generation_config={"max_output_tokens": 100, "temperature": 0},
        )

        elapsed = time.time() - start
        print(f"✅ Gemini response received in {elapsed:.2f}s")
        print(f"   Response: {response.text[:200]}")

        # Validate JSON parsing
        import json
        clean = response.text.strip().strip('`').strip()
        if clean.startswith('json'):
            clean = clean[4:].strip()
        parsed = json.loads(clean)
        print(f"   JSON parsed successfully: {parsed}")
        return True

    except Exception as e:
        print(f"❌ Gemini test failed: {e}")
        return False


def test_groq():
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key or api_key == "your_groq_api_key_here":
        print("⚠️  GROQ_API_KEY not set (optional fallback)")
        return False

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        print("📡 Testing Groq API connection...")
        start = time.time()

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": 'Return ONLY: [{"test": true}]'}],
            max_tokens=50,
            temperature=0,
        )

        elapsed = time.time() - start
        print(f"✅ Groq response received in {elapsed:.2f}s")
        print(f"   Response: {response.choices[0].message.content[:200]}")
        return True

    except Exception as e:
        print(f"⚠️  Groq test failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("NYAYADARSI — AI CONNECTION TEST")
    print("=" * 50)

    gemini_ok = test_gemini()
    print()
    groq_ok = test_groq()

    print()
    print("=" * 50)
    if gemini_ok:
        print("✅ Ready for demo! Gemini is working.")
    elif groq_ok:
        print("⚠️  Gemini unavailable. Groq fallback is working.")
    else:
        print("❌ No AI provider available. Check .env file.")
    print("=" * 50)
