from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime
from backend.database.base_class import Base

class NewsCache(Base):
    __tablename__ = "news_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True, nullable=False) # Company name or Sector name
    
    articles = Column(JSON, nullable=False) # List of processed articles
    sentiment_score = Column(Float, default=0.0, nullable=False) # Average sentiment
    
    cached_at = Column(DateTime, default=datetime.utcnow, nullable=False)
