from fastapi import APIRouter
from app.services.document_parser import extract_text_from_pdf
from app.services.llm_extractor import extract_financials
from app.services.financial_analysis import calculate_ratios
from app.services.news_research import get_company_news
from app.services.risk_scoring import calculate_risk_score
from app.services.cam_generator import generate_cam

router = APIRouter(prefix="/analyze")

@router.post("/")
def analyze_company(file_path: str, company: str):
    text = extract_text_from_pdf(file_path)
    financials = extract_financials(text)
    ratios = calculate_ratios(financials)
    news = get_company_news(company)
    risk = calculate_risk_score(ratios, news["sentiment"])
    cam = generate_cam(company, financials, ratios, risk)
    return {
        "financials": financials,
        "ratios": ratios,
        "news": news,
        "risk": risk,
        "cam_report": cam
    }
