from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from backend.database.base_class import Base

class PromptHistory(Base):
    __tablename__ = "prompt_history"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String, index=True, nullable=False) # e.g. "Ratio Analysis Agent"
    model_name = Column(String, nullable=False) # e.g. "llama-3.3-70b-versatile"
    
    prompt_text = Column(String, nullable=False)
    response_text = Column(String, nullable=False)
    
    tokens_used = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
