from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json
from app.services.document_parser import extract_text_from_pdf
from app.services.llm_extractor import extract_financials, generate_risk_summary
from app.services.financial_analysis import calculate_ratios
from app.services.news_research import get_company_news
from app.services.risk_scoring import calculate_risk_score
from app.services.cam_generator import generate_cam
from app.services.secondary_research import generate_secondary_research
from app.services.triangulation_service import triangulate_data
from app.services.swot_analysis import generate_swot_analysis
from app.services.recommendation_engine import generate_recommendation

router = APIRouter(prefix="/analyze")

@router.post("/")
def analyze_company(file_path: str, company: str):
    try:
        file_paths = {}
        
        try:
            file_paths = json.loads(file_path)
        except:
            file_paths = {"primary": file_path}
        
        print(f"[ANALYZE] Received file_paths: {file_paths}")
        print(f"[ANALYZE] Company: {company}")
        
        # 1. Extract financial data from ALL documents
        # Combine text from all uploaded PDFs
        all_text = ""
        processed_files = []
        
        # Try to process files in logical order (annual report first for financial data)
        file_priority_order = ["annual", "annual_reports", "alm", "shareholding", "borrowing", "portfolio"]
        
        for priority_key in file_priority_order:
            if priority_key in file_paths:
                file_path_item = file_paths[priority_key]
                try:
                    text = extract_text_from_pdf(file_path_item)
                    all_text += text + "\n\n"
                    processed_files.append(priority_key)
                    print(f"[ANALYZE] ✓ Processed {priority_key}: {len(text)} chars")
                except Exception as e:
                    print(f"[ANALYZE] ✗ Error processing {priority_key}: {e}")
        
        # Also process any remaining files not in priority order
        for key, file_path_item in file_paths.items():
            if key not in processed_files:
                try:
                    text = extract_text_from_pdf(file_path_item)
                    all_text += text + "\n\n"
                    processed_files.append(key)
                    print(f"[ANALYZE] ✓ Processed {key}: {len(text)} chars")
                except Exception as e:
                    print(f"[ANALYZE] ✗ Error processing {key}: {e}")
        
        print(f"[ANALYZE] Total combined text length: {len(all_text)} chars")
        print(f"[ANALYZE] Processed files: {processed_files}")
        
        # Extract financials from combined text
        financials = extract_financials(all_text)
        
        assets = financials.get("total_assets", 0)
        liabilities = financials.get("total_liabilities", 0)
        financials["equity"] = assets - liabilities
        
        # 2. Calculate ratios
        ratios = calculate_ratios(financials)
        
        # 3. Get news sentiment (original)
        news = get_company_news(company)
        
        # 4. Calculate risk score
        risk = calculate_risk_score(ratios, news["sentiment"])
        risk_summary = generate_risk_summary(financials, ratios, news)
        
        # 5. Generate comprehensive secondary research
        print("Generating secondary research...")
        secondary_research = generate_secondary_research(company, sector=None, financial_data=financials)
        
        # 6. Triangulate data from multiple sources
        print("Triangulating data...")
        triangulation = triangulate_data(company, financials, ratios, secondary_research, risk)
        
        # 7. Generate SWOT analysis
        print("Generating SWOT analysis...")
        swot = generate_swot_analysis(company, sector=None, financials=financials, 
                                      ratios=ratios, secondary_research=secondary_research,
                                      triangulation=triangulation)
        
        # 8. Generate loan recommendation
        print("Generating recommendation...")
        recommendation = generate_recommendation(company, financials, ratios, risk,
                                               secondary_research, triangulation, swot)
        
        # 9. Generate CAM
        cam = generate_cam(company, financials, ratios, risk)
        
        return {
            "financials": financials,
            "ratios": ratios,
            "news": news,
            "risk": risk,
            "risk_summary": risk_summary,
            "secondary_research": secondary_research,
            "triangulation": triangulation,
            "swot": swot,
            "recommendation": recommendation,
            "cam_report": cam
        }
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={
            "error": str(e),
            "traceback": traceback.format_exc()
        })
