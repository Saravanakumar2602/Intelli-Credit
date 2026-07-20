from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from backend.database.base_class import Base

class ModelVersion(Base):
    __tablename__ = "model_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, index=True, nullable=False) # e.g. "llama-3.3-70b-versatile"
    agent_name = Column(String, index=True, nullable=False) # e.g. "Ratio Analysis Agent"
    version_tag = Column(String, nullable=False) # e.g. "v1.2"
    prompt_template = Column(String, nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
