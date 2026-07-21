from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from datetime import datetime
from backend.database.base_class import Base

class ApplicationComment(Base):
    __tablename__ = "application_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_application_id = Column(Integer, ForeignKey("loan_applications.id"), nullable=False)
    author = Column(String, nullable=False)
    body = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
