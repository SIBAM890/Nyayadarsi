"""
SHA-256 Audit Logger for Nyayadarsi
Every automated action and human decision generates a cryptographically signed record.
Append-only — INSERT privileges only. No UPDATE, no DELETE.

Refactored: Uses SQLAlchemy Session instead of raw sqlite3 connection.
"""
import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from backend.models.audit_log import AuditLog


def log(
    db: Session,
    action: str,
    entity_id: str,
    entity_type: str,
    input_data: dict[str, Any],
    output_data: dict[str, Any],
    model_version: Optional[str] = None,
    officer_id: Optional[str] = None,
    confidence: Optional[float] = None,
    verdict: Optional[str] = None,
) -> dict[str, Any]:
    """
    Create an immutable audit record with SHA-256 hashes.

    Args:
        db: SQLAlchemy session (injected via Depends).
        action: Action type (e.g., 'CRITERIA_EXTRACTED', 'OFFICER_DECISION').
        entity_id: ID of the entity this action relates to.
        entity_type: Type of entity ('tender', 'evaluation', etc.).
        input_data: Input payload to hash.
        output_data: Output payload to hash.
        model_version: AI model version if applicable.
        officer_id: Officer ID if human decision.
        confidence: Confidence score if applicable.
        verdict: Decision verdict if applicable.

    Returns:
        {"input_hash": str, "output_hash": str, "timestamp": str, "audit_id": int}
    """
    input_str = json.dumps(input_data, sort_keys=True, default=str)
    output_str = json.dumps(output_data, sort_keys=True, default=str)

    input_hash = hashlib.sha256(input_str.encode()).hexdigest()
    output_hash = hashlib.sha256(output_str.encode()).hexdigest()

    timestamp = datetime.now(timezone.utc)

    details = {
        "input_preview": input_str[:200],
        "output_preview": output_str[:200],
    }

    audit_entry = AuditLog(
        timestamp=timestamp,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        sha256_input=input_hash,
        sha256_output=output_hash,
        model_version=model_version,
        officer_id=officer_id,
        confidence=confidence,
        verdict=verdict,
        details_json=json.dumps(details),
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)

    return {
        "input_hash": input_hash,
        "output_hash": output_hash,
        "timestamp": timestamp.isoformat(),
        "audit_id": audit_entry.id,
    }


def get_trail(db: Session, entity_id: str) -> list[dict[str, Any]]:
    """Get all audit entries for an entity, chronologically ordered."""
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.entity_id == entity_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )
    return [_entry_to_dict(e) for e in entries]


def get_full_trail(db: Session) -> list[dict[str, Any]]:
    """Get all audit entries, chronologically ordered (limit 1000)."""
    entries = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.asc())
        .limit(1000)
        .all()
    )
    return [_entry_to_dict(e) for e in entries]


def _entry_to_dict(entry: AuditLog) -> dict[str, Any]:
    """Convert an AuditLog ORM instance to a dict."""
    return {
        "id": entry.id,
        "timestamp": str(entry.timestamp),
        "entity_type": entry.entity_type,
        "entity_id": entry.entity_id,
        "action": entry.action,
        "sha256_input": entry.sha256_input,
        "sha256_output": entry.sha256_output,
        "model_version": entry.model_version,
        "officer_id": entry.officer_id,
        "confidence": entry.confidence,
        "verdict": entry.verdict,
        "details_json": entry.details_json,
    }
