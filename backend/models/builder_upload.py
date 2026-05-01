"""BuilderUpload ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from backend.core.database import Base


class BuilderUpload(Base):
    """GPS-verified builder progress upload."""

    __tablename__ = "builder_upload"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    contract_id: str = Column(String, nullable=False, index=True)
    upload_lat: float = Column(Float, nullable=False)
    upload_lon: float = Column(Float, nullable=False)
    distance_meters: float = Column(Float, nullable=False)
    accepted: int = Column(Integer, nullable=False)
    rejection_reason: str | None = Column(Text, nullable=True)
    photo_paths: str | None = Column(Text, nullable=True)
    video_path: str | None = Column(String, nullable=True)
    timestamp: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    audit_hash: str | None = Column(String, nullable=True)
    verified_by: str | None = Column(String, nullable=True)
    progress_percent: float | None = Column(Float, nullable=True)

    def __repr__(self) -> str:
        return f"<BuilderUpload {self.id} contract={self.contract_id}>"
