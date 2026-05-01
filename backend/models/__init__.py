"""
Nyayadarsi ORM Models
Import all models so Base.metadata registers them for table creation.
"""
from backend.models.user import User
from backend.models.tender import Tender
from backend.models.builder_upload import BuilderUpload
from backend.models.audit_log import AuditLog
from backend.models.bidder_evaluation import BidderEvaluation
from backend.models.milestone import Milestone
from backend.models.collusion_report import CollusionReport

__all__ = [
    "User",
    "Tender",
    "BuilderUpload",
    "AuditLog",
    "BidderEvaluation",
    "Milestone",
    "CollusionReport",
]
