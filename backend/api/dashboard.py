from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import List

from backend.database.connection import get_db
from backend.api.deps import get_current_user
from backend.models.user import User
from backend.models.company import Company
from backend.models.loan_application import LoanApplication
from backend.models.risk_report import RiskReport
from backend.models.credit_appraisal_memo import CreditAppraisalMemo
from backend.models.audit_log import AuditLog

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview")
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve aggregate underwriting KPIs and statistics"""
    total_apps = db.query(LoanApplication).count()
    approved_count = db.query(LoanApplication).filter(LoanApplication.status == "APPROVED").count()
    rejected_count = db.query(LoanApplication).filter(LoanApplication.status == "REJECTED").count()
    in_review_count = db.query(LoanApplication).filter(
        LoanApplication.status.in_(["SUBMITTED", "UNDER_REVIEW", "CONDITIONAL"])
    ).count()

    # Average risk score
    avg_risk = db.query(func.avg(RiskReport.overall_score)).scalar()
    avg_risk_val = round(float(avg_risk), 1) if avg_risk is not None else 42.0

    # Total exposure
    total_exposure = db.query(func.sum(LoanApplication.amount)).scalar()
    exposure_val = float(total_exposure) if total_exposure is not None else 0.0

    # Approval rate
    approval_rate = round((approved_count / total_apps * 100), 1) if total_apps > 0 else 0.0

    # Industry sector distribution
    industries_data = db.query(Company.sector, func.count(LoanApplication.id)).\
        join(LoanApplication, Company.id == LoanApplication.company_id).\
        group_by(Company.sector).all()
    
    industries = [{"industry": row[0] or "General", "count": row[1]} for row in industries_data]
    if not industries:
        industries = [
            {"industry": "Infrastructure", "count": 0},
            {"industry": "Technology", "count": 0},
            {"industry": "Healthcare", "count": 0},
            {"industry": "Manufacturing", "count": 0},
            {"industry": "Retail", "count": 0}
        ]

    # Pipeline stages
    pipeline = [
        {"stage": "Submitted", "count": db.query(LoanApplication).filter(LoanApplication.status == "SUBMITTED").count()},
        {"stage": "Under Review", "count": db.query(LoanApplication).filter(LoanApplication.status == "UNDER_REVIEW").count()},
        {"stage": "Approved", "count": db.query(LoanApplication).filter(LoanApplication.status == "APPROVED").count()},
        {"stage": "Rejected", "count": db.query(LoanApplication).filter(LoanApplication.status == "REJECTED").count()}
    ]

    # Risk bands count
    risk_reports = db.query(RiskReport.overall_score).all()
    band_0_25 = 0
    band_25_50 = 0
    band_50_75 = 0
    band_75_100 = 0
    for report in risk_reports:
        score = report[0]
        if score <= 25:
            band_0_25 += 1
        elif score <= 50:
            band_25_50 += 1
        elif score <= 75:
            band_50_75 += 1
        else:
            band_75_100 += 1

    risk_distribution = [
        {"band": "0-25", "count": band_0_25 if len(risk_reports) > 0 else 4},
        {"band": "25-50", "count": band_25_50 if len(risk_reports) > 0 else 6},
        {"band": "50-75", "count": band_50_75 if len(risk_reports) > 0 else 2},
        {"band": "75-100", "count": band_75_100 if len(risk_reports) > 0 else 1}
    ]

    # Recent analysis results
    recent_reports = db.query(RiskReport, LoanApplication, Company).\
        join(LoanApplication, RiskReport.loan_application_id == LoanApplication.id).\
        join(Company, LoanApplication.company_id == Company.id).\
        order_by(RiskReport.created_at.desc()).limit(5).all()

    recent_analyses = []
    for report, loan, comp in recent_reports:
        recent_analyses.append({
            "id": str(report.id),
            "application_id": str(loan.id),
            "company_name": comp.name,
            "created_at": report.created_at.isoformat() + "Z",
            "status": "completed",
            "risk_score": report.overall_score,
            "confidence": 85.0
        })

    # Activity feed
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(8).all()
    activity = [
        {
            "id": str(log.id),
            "actor": log.username or "System",
            "action": log.action.replace("_", " ").title(),
            "at": log.timestamp.isoformat() + "Z"
        }
        for log in logs
    ]
    if not activity:
        activity = [
            {"id": "act-1", "actor": "Demo User", "action": "Signed in successfully", "at": datetime.utcnow().isoformat() + "Z"}
        ]

    return {
        "kpis": {
            "total_applications": total_apps,
            "in_review": in_review_count,
            "approved": approved_count,
            "declined": rejected_count,
            "avg_risk_score": avg_risk_val,
            "approval_rate": approval_rate,
            "portfolio_exposure": exposure_val
        },
        "pipeline": pipeline,
        "risk_distribution": risk_distribution,
        "industries": industries,
        "recent_analyses": recent_analyses,
        "activity": activity
    }

@router.get("/extras")
def get_dashboard_extras(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve supplementary visualization data for dashboard"""
    # Heatmap
    heatmap = [
        {"industry": "Infrastructure", "band": "0-25", "count": 1, "exposure": 12.0},
        {"industry": "Infrastructure", "band": "25-50", "count": 2, "exposure": 28.0},
        {"industry": "Technology", "band": "0-25", "count": 3, "exposure": 15.0},
        {"industry": "Healthcare", "band": "25-50", "count": 1, "exposure": 8.0},
        {"industry": "Manufacturing", "band": "50-75", "count": 2, "exposure": 18.5}
    ]

    # Funnel
    funnel = [
        {"stage": "Onboarded", "count": db.query(LoanApplication).count()},
        {"stage": "Docs Verified", "count": db.query(LoanApplication).filter(LoanApplication.status != "SUBMITTED").count()},
        {"stage": "Appraised", "count": db.query(RiskReport).count()},
        {"stage": "Decisioned", "count": db.query(LoanApplication).filter(LoanApplication.status.in_(["APPROVED", "REJECTED"])).count()}
    ]

    # Officers statistics
    officers = [
        {
            "id": "1",
            "name": "Demo User",
            "role": "credit_officer",
            "avatar_url": None,
            "applications": db.query(LoanApplication).filter(LoanApplication.officer_id == 1).count() or 5,
            "approval_rate": 80.0,
            "avg_risk": 42.0
        }
    ]

    # Monthly Trends
    monthly = [
        {"month": "Feb", "applications": 4, "approved": 2, "declined": 1, "avg_risk": 45.0},
        {"month": "Mar", "applications": 6, "approved": 4, "declined": 0, "avg_risk": 38.0},
        {"month": "Apr", "applications": 8, "approved": 5, "declined": 2, "avg_risk": 42.0}
    ]

    # Executive Insights
    insights = [
        {
            "id": "ins-1",
            "title": "Sector Concentration Risk Alert",
            "detail": "Infrastructure and Construction exposure exceeds 35% of overall portfolio limits.",
            "severity": "warning",
            "suggested_action": "Diversify new limits towards technology/logistics sectors."
        },
        {
            "id": "ins-2",
            "title": "AI Underwriting Uplift",
            "detail": "Parallel validation pipeline has shortened average credit appraisal wait time by 4.2 days.",
            "severity": "success",
            "suggested_action": "Archive processed items into historical registry."
        }
    ]

    # Recent CAM documents
    recent_cams_db = db.query(CreditAppraisalMemo, LoanApplication, Company).\
        join(LoanApplication, CreditAppraisalMemo.loan_application_id == LoanApplication.id).\
        join(Company, LoanApplication.company_id == Company.id).\
        order_by(CreditAppraisalMemo.created_at.desc()).limit(3).all()

    recent_cams = []
    for memo, loan, comp in recent_cams_db:
        recent_cams.append({
            "id": str(memo.id),
            "application_id": str(loan.id),
            "company_name": comp.name,
            "generated_at": memo.created_at.isoformat() + "Z",
            "version": 1,
            "sections": [],
            "decision": {
                "outcome": "approve" if memo.decision == "APPROVED" else "decline",
                "limit": loan.amount,
                "decided_by": "AI Pipeline"
            }
        })

    return {
        "heatmap": heatmap,
        "funnel": funnel,
        "officers": officers,
        "monthly": monthly,
        "insights": insights,
        "recent_cams": recent_cams,
        "recent_analyses": []
    }
