from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Onboarding(Base):
    __tablename__ = "onboardings"

    id = Column(Integer, primary_key=True, index=True)
    cin = Column(String, index=True, nullable=False)
    pan = Column(String, index=True, nullable=False)
    sector = Column(String, nullable=False)
    turnover = Column(String, nullable=False)
    loan_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    tenure = Column(Integer, nullable=False)
    interest = Column(Float, nullable=False)
