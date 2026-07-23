from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    
    original_filename = Column(String, nullable=False)
    filename = Column(String, unique=True, nullable=False) # UUID filename
    filepath = Column(String, nullable=False)
    file_category = Column(String, nullable=False) # alm, shareholding, borrowing, annual, portfolio
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    
    # Encrypted storage details
    is_encrypted = Column(Boolean, default=False, nullable=False)
    encryption_key_hash = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
