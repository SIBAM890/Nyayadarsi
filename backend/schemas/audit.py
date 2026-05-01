"""Audit-related Pydantic schemas."""
from pydantic import BaseModel, ConfigDict
from typing import Any, Optional


class AuditEntryResponse(BaseModel):
    """Single audit trail entry."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: str
    entity_type: str
    entity_id: str
    action: str
    sha256_input: str
    sha256_output: str
    model_version: Optional[str] = None
    officer_id: Optional[str] = None
    confidence: Optional[float] = None
    verdict: Optional[str] = None
    details_json: Optional[str] = None


class AuditTrailResponse(BaseModel):
    """Audit trail for a specific entity."""
    entity_id: Optional[str] = None
    total_entries: int
    trail: list[dict[str, Any]]


class AuditLogRecord(BaseModel):
    """Internal audit log result from sha256_logger."""
    input_hash: str
    output_hash: str
    timestamp: str
    audit_id: int
