
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.services.document_parser import extract_text_from_pdf
from app.services.llm_extractor import extract_financials, generate_risk_summary
from app.services.financial_analysis import calculate_ratios
from app.services.news_research import get_company_news
from app.services.risk_scoring import calculate_risk_score
from app.services.cam_generator import generate_cam

router = APIRouter(prefix="/analyze")

@router.post("/")
def analyze_company(file_path: str, company: str):
    try:
        text = extract_text_from_pdf(file_path)
        financials = extract_financials(text)
        # Calculate equity (net worth) if assets and liabilities are present
        assets = financials.get("total_assets", 0)
        liabilities = financials.get("total_liabilities", 0)
        financials["equity"] = assets - liabilities
        ratios = calculate_ratios(financials)
        news = get_company_news(company)
        risk = calculate_risk_score(ratios, news["sentiment"])
        # Generate LLM-based risk summary
        risk_summary = generate_risk_summary(financials, ratios, news)
        cam = generate_cam(company, financials, ratios, risk)
        return {
            "financials": financials,
            "ratios": ratios,
            "news": news,
            "risk": risk,
            "risk_summary": risk_summary,
            "cam_report": cam
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={
            "error": str(e),
            "traceback": traceback.format_exc()
        })
