"""AuditLog ORM model — append-only, immutable."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from backend.core.database import Base


class AuditLog(Base):
    """
    Cryptographic audit record.
    Append-only: INSERT only — no UPDATE, no DELETE.
    """

    __tablename__ = "audit_log"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    timestamp: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    entity_type: str = Column(String, nullable=False, index=True)
    entity_id: str = Column(String, nullable=False, index=True)
    action: str = Column(String, nullable=False)
    sha256_input: str = Column(String, nullable=False)
    sha256_output: str = Column(String, nullable=False)
    model_version: str | None = Column(String, nullable=True)
    officer_id: str | None = Column(String, nullable=True)
    confidence: float | None = Column(Float, nullable=True)
    verdict: str | None = Column(String, nullable=True)
    details_json: str | None = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.id} {self.action} entity={self.entity_id}>"
