from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    activity_type = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=_utcnow, nullable=False)
