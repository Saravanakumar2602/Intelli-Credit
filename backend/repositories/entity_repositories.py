from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from backend.models.user import User
from backend.models.company import Company
from backend.models.loan_application import LoanApplication
from backend.models.analysis_job import AnalysisJob
from backend.models.audit_log import AuditLog
from backend.models.uploaded_document import UploadedDocument
from backend.models.extracted_financials import ExtractedFinancials
from backend.models.risk_report import RiskReport
from backend.models.credit_appraisal_memo import CreditAppraisalMemo
from backend.middleware.observability import METRICS

class UserRepository:
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        METRICS["db_queries_total"] += 1
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        METRICS["db_queries_total"] += 1
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        METRICS["db_queries_total"] += 1
        return db.query(User).filter(User.username == username).first()

class CompanyRepository:
    @staticmethod
    def get_by_cin(db: Session, cin: str) -> Optional[Company]:
        METRICS["db_queries_total"] += 1
        return db.query(Company).filter(Company.cin == cin).first()

    @staticmethod
    def get_by_pan(db: Session, pan: str) -> Optional[Company]:
        METRICS["db_queries_total"] += 1
        return db.query(Company).filter(Company.pan == pan).first()

    @staticmethod
    def create(db: Session, name: str, cin: str, pan: str, sector: str, turnover: str) -> Company:
        METRICS["db_queries_total"] += 1
        company = Company(name=name, cin=cin, pan=pan, sector=sector, turnover=turnover)
        db.add(company)
        db.commit()
        db.refresh(company)
        return company

class LoanRepository:
    @staticmethod
    def get_by_id(db: Session, loan_id: int) -> Optional[LoanApplication]:
        METRICS["db_queries_total"] += 1
        return db.query(LoanApplication).filter(LoanApplication.id == loan_id).first()

    @staticmethod
    def create(db: Session, company_id: int, amount: float, tenure: int, interest_rate: float, loan_type: str, status: str = "SUBMITTED") -> LoanApplication:
        METRICS["db_queries_total"] += 1
        loan = LoanApplication(
            company_id=company_id,
            amount=amount,
            tenure=tenure,
            interest_rate=interest_rate,
            loan_type=loan_type,
            status=status
        )
        db.add(loan)
        db.commit()
        db.refresh(loan)
        return loan

    @staticmethod
    def list_applications(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        status: Optional[str] = None,
        sector: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[LoanApplication], int]:
        METRICS["db_queries_total"] += 1
        query = db.query(LoanApplication).join(Company)
        
        if status:
            query = query.filter(LoanApplication.status == status)
        if sector:
            query = query.filter(Company.sector == sector)
        if search:
            query = query.filter(Company.name.ilike(f"%{search}%") | Company.cin.ilike(f"%{search}%"))
            
        total = query.count()
        results = query.order_by(LoanApplication.created_at.desc()).offset(skip).limit(limit).all()
        return results, total

class JobRepository:
    @staticmethod
    def get_by_id(db: Session, job_id: str) -> Optional[AnalysisJob]:
        METRICS["db_queries_total"] += 1
        return db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()

    @staticmethod
    def create_job(db: Session, job_id: str, loan_application_id: int) -> AnalysisJob:
        METRICS["db_queries_total"] += 1
        job = AnalysisJob(id=job_id, loan_application_id=loan_application_id, status="QUEUED")
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

class AuditRepository:
    @staticmethod
    def log(db: Session, user_id: Optional[int], username: Optional[str], action: str, details: str, ip: str, ua: str) -> AuditLog:
        METRICS["db_queries_total"] += 1
        log_item = AuditLog(
            user_id=user_id,
            username=username,
            action=action,
            details=details,
            ip_address=ip,
            user_agent=ua
        )
        db.add(log_item)
        db.commit()
        return log_item
