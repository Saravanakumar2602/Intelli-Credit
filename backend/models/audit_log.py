from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True) # ID of user performing the action
    username = Column(String, nullable=True)
    
    action = Column(String, index=True, nullable=False) # e.g. "UPLOAD_FILE", "GENERATE_CAM", "LOGIN_SUCCESS"
    details = Column(String, nullable=True) # Text details/JSON
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
