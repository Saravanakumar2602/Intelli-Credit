from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"
    
    id = Column(String, primary_key=True, index=True) # Will use uuid or Celery task ID
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    status = Column(String, default="QUEUED", nullable=False) # QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    progress = Column(Float, default=0.0, nullable=False) # 0.0 to 100.0
    current_step = Column(String, nullable=True) # e.g. "Extracting text", "RAG query"
    
    error_message = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)
