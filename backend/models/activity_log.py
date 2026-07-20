from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database.base_class import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    activity_type = Column(String, index=True, nullable=False) # onboarding, analysis_run, download
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
