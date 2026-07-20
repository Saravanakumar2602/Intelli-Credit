import asyncio
import traceback
from celery import shared_task
from backend.database.connection import SessionLocal
from backend.models.analysis_job import AnalysisJob
from backend.models.loan_application import LoanApplication
from backend.models.uploaded_document import UploadedDocument
from backend.models.extracted_financials import ExtractedFinancials
from backend.models.risk_report import RiskReport
from backend.models.credit_appraisal_memo import CreditAppraisalMemo

# Import the services that we'll define/refactor
from backend.services.document_parser import extract_text_from_file
from backend.services.llm_pipeline import run_multi_agent_pipeline
from backend.services.financial_analysis import calculate_ratios
from backend.services.risk_engine import run_risk_scoring
from backend.services.news_engine import get_company_news
from backend.services.cam_generator import generate_cam

def update_job_progress(db, job_id: str, status: str, progress: float, step: str = None, error: str = None):
    """Helper to update analysis job progression in DB"""
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    if job:
        job.status = status
        job.progress = progress
        if step:
            job.current_step = step
        if error:
            job.error_message = error
        db.commit()

async def async_analysis_pipeline(job_id: str, loan_app_id: int):
    """Asynchronous implementation of the underwriting analysis pipeline"""
    db = SessionLocal()
    try:
        update_job_progress(db, job_id, "RUNNING", 10.0, "Loading loan application and files")
        
        # 1. Fetch loan application and associated documents
        loan_app = db.query(LoanApplication).filter(LoanApplication.id == loan_app_id).first()
        if not loan_app:
            raise ValueError(f"Loan Application with ID {loan_app_id} not found.")
            
        company = loan_app.company_id
        from backend.models.company import Company
        company_model = db.query(Company).filter(Company.id == company).first()
        if not company_model:
            raise ValueError(f"Company for Loan Application {loan_app_id} not found.")
            
        company_name = company_model.name
        
        docs = db.query(UploadedDocument).filter(UploadedDocument.loan_application_id == loan_app_id).all()
        if not docs:
            raise ValueError(f"No uploaded files found for Loan Application ID {loan_app_id}.")
            
        # 2. Extract text from files in parallel or sequence
        update_job_progress(db, job_id, "RUNNING", 20.0, "Parsing documents and extracting text")
        
        all_text = ""
        for doc in docs:
            filepath = doc.filepath
            file_category = doc.file_category
            text = extract_text_from_file(filepath)
            all_text += f"\n\n--- Document Category: {file_category} ---\n\n" + text
            
        if not all_text.strip():
            raise ValueError("Parsed document texts are completely empty.")

        # 3. Trigger Multi-Agent AI Pipeline
        update_job_progress(db, job_id, "RUNNING", 40.0, "Running multi-agent AI pipeline extraction")
        
        # We pass the extracted document text, company profile, and loan criteria
        ai_pipeline_results = await run_multi_agent_pipeline(
            company_name=company_name,
            sector=company_model.sector,
            text=all_text,
            loan_details={
                "amount": loan_app.amount,
                "tenure": loan_app.tenure,
                "interest": loan_app.interest_rate,
                "type": loan_app.loan_type
            }
        )
        
        # Extract financial variables from AI output
        financials = ai_pipeline_results.get("financials", {})
        
        # 4. Financial ratio calculation (20+ ratios)
        update_job_progress(db, job_id, "RUNNING", 60.0, "Computing financial ratios and indicators")
        ratios = calculate_ratios(financials)
        
        # Save financials and ratios to database
        db_financials = ExtractedFinancials(
            loan_application_id=loan_app_id,
            financial_data=financials,
            ratios_data=ratios,
            extracted_by="AI_AGENT"
        )
        db.add(db_financials)
        db.commit()

        # 5. Fetch News Aggregation & Calculate Sentiment
        update_job_progress(db, job_id, "RUNNING", 70.0, "Retrieving news intelligence and market data")
        news = await get_company_news(company_name, db)
        
        # 6. Configurable Risk Engine execution
        update_job_progress(db, job_id, "RUNNING", 80.0, "Evaluating risk engine metrics")
        risk_result = run_risk_scoring(db, ratios, news.get("sentiment", 0.0))
        
        db_risk = RiskReport(
            loan_application_id=loan_app_id,
            overall_score=risk_result["score"],
            risk_level=risk_result["risk_level"],
            breakdown=risk_result["breakdown"],
            explanation=risk_result["explanation"]
        )
        db.add(db_risk)
        db.commit()

        # 7. Generate final Credit Appraisal Memo (CAM) Report
        update_job_progress(db, job_id, "RUNNING", 90.0, "Compiling enterprise Credit Appraisal Memo")
        
        # Collate elements for CAM generator
        secondary_research = ai_pipeline_results.get("secondary_research", {})
        triangulation = ai_pipeline_results.get("triangulation", {})
        swot = ai_pipeline_results.get("swot", {})
        recommendation = ai_pipeline_results.get("recommendation", {})
        
        cam_filepath = generate_cam(
            company=company_name,
            financials=financials,
            ratios=ratios,
            risk=risk_result,
            secondary_research=secondary_research,
            triangulation=triangulation,
            swot=swot,
            recommendation=recommendation
        )
        
        db_cam = CreditAppraisalMemo(
            loan_application_id=loan_app_id,
            file_path=cam_filepath,
            decision=recommendation.get("decision", "REJECT"),
            confidence_score=recommendation.get("confidence", 0.0),
            recommendation_summary=recommendation.get("recommendation_summary", ""),
            citations_data={
                "citations": recommendation.get("citations", []),
                "confidence_score": ai_pipeline_results.get("extraction_confidence", 100)
            }
        )
        db.add(db_cam)
        
        # Update loan application status to match recommendation decision
        loan_app.status = recommendation.get("decision", "REJECT")
        
        db.commit()
        
        # Completed successfully
        update_job_progress(db, job_id, "COMPLETED", 100.0, "Analysis completed successfully")
        
    except Exception as e:
        trace = traceback.format_exc()
        print(f"[BACKGROUND JOB ERROR]: {e}\n{trace}")
        update_job_progress(db, job_id, "FAILED", 100.0, error=str(e))
    finally:
        db.close()

@shared_task(bind=True)
def run_analysis_task(self, loan_app_id: int):
    """Celery task entrypoint running the async pipeline synchronously"""
    job_id = self.request.id
    db = SessionLocal()
    try:
        # Create the analysis job record in QUEUED state
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if not job:
            job = AnalysisJob(id=job_id, loan_application_id=loan_app_id, status="QUEUED")
            db.add(job)
            db.commit()
    finally:
        db.close()
        
    # Start the async execution loop
    asyncio.run(async_analysis_pipeline(job_id, loan_app_id))
    return {"job_id": job_id, "status": "finished"}
