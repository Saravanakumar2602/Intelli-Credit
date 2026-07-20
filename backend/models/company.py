from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from backend.database.base_class import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    cin = Column(String, unique=True, index=True, nullable=False)
    pan = Column(String, unique=True, index=True, nullable=False)
    sector = Column(String, index=True, nullable=False)
    turnover = Column(String, nullable=False) # e.g. "10-50 Cr"
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
