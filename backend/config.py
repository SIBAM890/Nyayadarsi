"""
Nyayadarsi Configuration
Loads environment variables from .env file
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# AI Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nyayadarsi.db")
DB_PATH = Path(__file__).resolve().parent / "nyayadarsi.db"

# GPS Configuration
REGISTERED_SITE_LAT = float(os.getenv("REGISTERED_SITE_LAT", "20.2961"))
REGISTERED_SITE_LON = float(os.getenv("REGISTERED_SITE_LON", "85.8245"))
GPS_THRESHOLD_METERS = float(os.getenv("GPS_THRESHOLD_METERS", "100"))

# Upload Directory
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Demo Data Directory
DEMO_DATA_DIR = Path(__file__).resolve().parent.parent / "demo" / "mock_data"

# Application Version
APP_VERSION = "1.0.0"
