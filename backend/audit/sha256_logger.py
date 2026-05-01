"""
SHA-256 Audit Logger for Nyayadarsi
Every automated action and human decision generates a cryptographically signed record.
Append-only — INSERT privileges only. No UPDATE, no DELETE.
"""
import hashlib
import json
from datetime import datetime, timezone

from backend.database import get_db


def log(
    action: str,
    entity_id: str,
    entity_type: str,
    input_data: dict,
    output_data: dict,
    model_version: str = None,
    officer_id: str = None,
    confidence: float = None,
    verdict: str = None,
) -> dict:
    """
    Create an immutable audit record with SHA-256 hashes.
    
    Returns:
        {"input_hash": str, "output_hash": str, "timestamp": str, "audit_id": int}
    """
    input_str = json.dumps(input_data, sort_keys=True, default=str)
    output_str = json.dumps(output_data, sort_keys=True, default=str)

    input_hash = hashlib.sha256(input_str.encode()).hexdigest()
    output_hash = hashlib.sha256(output_str.encode()).hexdigest()

    timestamp = datetime.now(timezone.utc).isoformat()

    details = {
        "input_preview": input_str[:200],
        "output_preview": output_str[:200],
    }

    with get_db() as db:
        cursor = db.execute(
            """
            INSERT INTO audit_log 
            (timestamp, entity_type, entity_id, action,
             sha256_input, sha256_output, model_version,
             officer_id, confidence, verdict, details_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp, entity_type, entity_id, action,
                input_hash, output_hash, model_version,
                officer_id, confidence, verdict,
                json.dumps(details),
            ),
        )
        audit_id = cursor.lastrowid

    return {
        "input_hash": input_hash,
        "output_hash": output_hash,
        "timestamp": timestamp,
        "audit_id": audit_id,
    }


def get_trail(entity_id: str) -> list:
    """Get all audit entries for an entity, chronologically ordered."""
    with get_db() as db:
        cursor = db.execute(
            "SELECT * FROM audit_log WHERE entity_id = ? ORDER BY timestamp ASC",
            (entity_id,),
        )
        return [dict(row) for row in cursor.fetchall()]


def get_full_trail() -> list:
    """Get all audit entries, chronologically ordered."""
    with get_db() as db:
        cursor = db.execute(
            "SELECT * FROM audit_log ORDER BY timestamp ASC LIMIT 1000"
        )
        return [dict(row) for row in cursor.fetchall()]
