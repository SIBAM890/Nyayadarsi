"""
Nyayadarsi Configuration (Legacy Compatibility Shim)
Redirects to the new core.config module.
"""
from backend.core.config import settings

# Re-export for backward compatibility with AI/collusion/utils modules
GEMINI_API_KEY = settings.GEMINI_API_KEY
OPENROUTER_API_KEY = settings.OPENROUTER_API_KEY
DATABASE_URL = settings.DATABASE_URL
DB_PATH = settings.DB_PATH
REGISTERED_SITE_LAT = settings.REGISTERED_SITE_LAT
REGISTERED_SITE_LON = settings.REGISTERED_SITE_LON
GPS_THRESHOLD_METERS = settings.GPS_THRESHOLD_METERS
UPLOAD_DIR = settings.UPLOAD_DIR
DEMO_DATA_DIR = settings.DEMO_DATA_DIR
APP_VERSION = settings.APP_VERSION
