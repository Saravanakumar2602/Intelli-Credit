from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from datetime import datetime, timezone
from backend.database.base_class import Base

def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)

class NewsCache(Base):
    __tablename__ = "news_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, index=True, nullable=False)
    articles = Column(JSON, nullable=False)
    sentiment_score = Column(Float, default=0.0, nullable=False)
    cached_at = Column(DateTime, default=_utcnow, nullable=False)
