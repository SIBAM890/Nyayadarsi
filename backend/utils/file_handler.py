"""
File Handler for Nyayadarsi
Handles file uploads, validation, and storage.
"""
import hashlib
import uuid
from pathlib import Path
from datetime import datetime, timezone

from backend.config import UPLOAD_DIR


ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".mp4", ".mov", ".doc", ".docx"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


def compute_sha256(data: bytes) -> str:
    """Compute SHA-256 hash of file data."""
    return hashlib.sha256(data).hexdigest()


async def save_upload(file_bytes: bytes, original_name: str, category: str = "general") -> dict:
    """
    Save an uploaded file to disk with metadata.
    Returns file metadata including SHA-256 hash.
    """
    ext = Path(original_name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return {
            "saved": False,
            "error": f"File type {ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        }

    if len(file_bytes) > MAX_FILE_SIZE:
        return {
            "saved": False,
            "error": f"File too large. Maximum: {MAX_FILE_SIZE / (1024*1024):.0f} MB",
        }

    # Generate unique filename
    file_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_name = f"{timestamp}_{file_id}{ext}"

    # Create category subdirectory
    save_dir = UPLOAD_DIR / category
    save_dir.mkdir(parents=True, exist_ok=True)
    save_path = save_dir / safe_name

    # Write file
    with open(save_path, "wb") as f:
        f.write(file_bytes)

    return {
        "saved": True,
        "file_path": str(save_path),
        "file_name": safe_name,
        "original_name": original_name,
        "sha256": compute_sha256(file_bytes),
        "size_bytes": len(file_bytes),
        "category": category,
    }
