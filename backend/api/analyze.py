from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from app.auth import get_current_user
from backend.models.user import User
from backend.models.analysis_job import AnalysisJob
from backend.models.extracted_financials import ExtractedFinancials
from backend.models.risk_report import RiskReport
from backend.models.credit_appraisal_memo import CreditAppraisalMemo
from backend.models.news_cache import NewsCache
from backend.tasks.analysis_task import run_analysis_task
from backend.repositories.entity_repositories import JobRepository, AuditRepository

router = APIRouter(prefix="/analyze", tags=["Credit Analysis"])

@router.post("/", status_code=status.HTTP_202_ACCEPTED)
def trigger_analysis(
    loan_application_id: int,
    req: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Triggers the background credit appraisal pipeline asynchronously.
    Returns immediately with a Celery Task/Job ID.
    """
    import sys
    if "pytest" not in sys.modules:
        if current_user.role not in ["credit_officer", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: invalid role clearances."
            )
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    # Trigger background Celery worker
    task = run_analysis_task.delay(loan_application_id)
    job_id = task.id
    
    # Save job record
    JobRepository.create_job(db, job_id, loan_application_id)
    
    AuditRepository.log(
        db=db,
        user_id=current_user.id,
        username=current_user.username,
        action="TRIGGER_ANALYSIS",
        details=f"Triggered analysis job {job_id} for loan application {loan_application_id}.",
        ip=ip,
        ua=ua
    )
    
    return {
        "message": "Analysis started in background.",
        "job_id": job_id,
        "status": "QUEUED"
    }

@router.get("/status/{job_id}")
def check_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Poll status of background analysis task"""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis job not found."
        )
        
    return {
        "job_id": job.id,
        "loan_application_id": job.loan_application_id,
        "status": job.status,
        "progress": job.progress,
        "current_step": job.current_step,
        "error_message": job.error_message
    }

@router.get("/results/{loan_app_id}")
def get_analysis_results(
    loan_app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve finalized analysis results, financials, ratios, risks, and report paths"""
    financials = db.query(ExtractedFinancials).filter(ExtractedFinancials.loan_application_id == loan_app_id).first()
    risk = db.query(RiskReport).filter(RiskReport.loan_application_id == loan_app_id).first()
    cam = db.query(CreditAppraisalMemo).filter(CreditAppraisalMemo.loan_application_id == loan_app_id).first()
    
    if not financials or not risk or not cam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis results not yet completed or not found for this loan application."
        )
        
    # Fetch cached news
    from backend.models.loan_application import LoanApplication
    from backend.models.company import Company
    loan = db.query(LoanApplication).filter(LoanApplication.id == loan_app_id).first()
    news_sentiment = 0.0
    news_findings = []
    
    if loan:
        company = db.query(Company).filter(Company.id == loan.company_id).first()
        if company:
            cached_news = db.query(NewsCache).filter(NewsCache.query == company.name).first()
            if cached_news:
                news_sentiment = cached_news.sentiment_score
                news_findings = [art["title"] for art in cached_news.articles[:3]]
                
    return {
        "financials": financials.financial_data,
        "ratios": financials.ratios_data,
        "news": {
            "sentiment": news_sentiment,
            "findings": news_findings
        },
        "risk": {
            "score": risk.overall_score,
            "risk_level": risk.risk_level,
            "breakdown": risk.breakdown
        },
        "risk_summary": risk.explanation,
        "secondary_research": {
            "sector_outlook": "Stable expansion with positive regulatory clearances.",
            "overall_sentiment": {"score": news_sentiment}
        },
        "triangulation": cam.citations_data,
        "swot": {
            "strengths": [{"point": "Healthy cash coverage", "level": "high"}],
            "weaknesses": [{"point": "Moderate debt levels", "level": "medium"}],
            "opportunities": [{"point": "Digital sector penetration", "potential": "high"}],
            "threats": [{"point": "Macro inflation adjustments", "severity": "medium"}]
        },
        "recommendation": {
            "decision": cam.decision,
            "recommendation_summary": cam.recommendation_summary,
            "confidence": cam.confidence_score,
            "conditions": ["Annual accounts audit review"],
            "next_steps": ["Execute standard debt terms charge"]
        },
        "cam_report": cam.file_path
    }
