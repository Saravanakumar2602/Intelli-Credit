from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
import asyncio
from app.auth import get_current_user
from app.models.user import User
from app.services.document_parser import extract_text_from_file
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

class SchemaField(BaseModel):
    name: str
    type: str

class AnalyzeBody(BaseModel):
    file_paths: Dict[str, str]
    company: str
    schema_config: Optional[List[SchemaField]] = None

@router.post("/")
async def analyze_company(
    body: Optional[AnalyzeBody] = None,
    file_path: Optional[str] = None,
    company: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    try:
        # 1. Parse request parameters (handle body payload OR query param fallbacks)
        if not body:
            if not file_path or not company:
                raise HTTPException(status_code=400, detail="Missing company name or file paths.")
            try:
                parsed_file_paths = json.loads(file_path)
            except Exception:
                parsed_file_paths = {"primary": file_path}
            company_name = company
            custom_schema = None
        else:
            parsed_file_paths = body.file_paths
            company_name = body.company
            custom_schema = [item.model_dump() for item in body.schema_config] if body.schema_config else None

        print(f"[ANALYZE] Starting analysis for company: {company_name}")
        print(f"[ANALYZE] Received file_paths: {parsed_file_paths}")

        # 2. Local File Inclusion (LFI) & Path Traversal Protection
        sanitized_paths = {}
        abs_upload_dir = os.path.abspath("uploads")
        
        for k, v in parsed_file_paths.items():
            abs_v = os.path.abspath(v)
            if not abs_v.startswith(abs_upload_dir):
                raise HTTPException(status_code=403, detail=f"Access denied: path traversal attempt detected for file: {v}")
            if not os.path.exists(abs_v):
                raise HTTPException(status_code=404, detail=f"File not found: {v}")
            sanitized_paths[k] = abs_v

        # 3. Extract text from ALL documents concurrently (non-blocking executor)
        loop = asyncio.get_running_loop()
        
        async def extract_text_async(fp):
            # Run the synchronous file parser inside standard thread pool executor
            return await loop.run_in_executor(None, extract_text_from_file, fp)

        text_tasks = []
        # Process files in a prioritized logical order
        file_priority_order = ["annual", "annual_reports", "alm", "shareholding", "borrowing", "portfolio"]
        processed_keys = set()
        
        for key in file_priority_order:
            if key in sanitized_paths:
                text_tasks.append((key, extract_text_async(sanitized_paths[key])))
                processed_keys.add(key)
                
        for key, fp in sanitized_paths.items():
            if key not in processed_keys:
                text_tasks.append((key, extract_text_async(fp)))

        # Gather file text extractions
        extractions = await asyncio.gather(*(t[1] for t in text_tasks))
        
        all_text = ""
        for (key, _), text in zip(text_tasks, extractions):
            all_text += f"\n\n--- Document Category: {key} ---\n\n" + text

        print(f"[ANALYZE] Total combined text length parsed: {len(all_text)} characters")

        # 4. Gather primary financial extraction and secondary news concurrently
        financials_task = extract_financials(all_text, custom_schema)
        news_task = get_company_news(company_name)
        secondary_task = generate_secondary_research(company_name, sector=None, financial_data=None)
        
        financials, news, secondary_research = await asyncio.gather(
            financials_task, news_task, secondary_task
        )
        
        # Inject standard equity if missing and assets/liabilities are parsed
        if not custom_schema:
            assets = financials.get("total_assets", 0) or 0
            liabilities = financials.get("total_liabilities", 0) or 0
            financials["equity"] = assets - liabilities

        # 5. Financial ratios & risk scoring
        ratios = calculate_ratios(financials)
        risk = calculate_risk_score(ratios, news.get("sentiment", 0.0))
        
        # 6. Gather remaining async analysis outputs (Risk summary, SWOT, and Triangulation)
        risk_summary_task = generate_risk_summary(financials, ratios, news)
        
        # Re-run secondary research with financial context for superior LLM synthesis fallback
        secondary_research_full = await generate_secondary_research(company_name, sector=None, financial_data=financials)
        triangulation = triangulate_data(company_name, financials, ratios, secondary_research_full, risk)
        
        swot_task = generate_swot_analysis(
            company_name, sector=None, financials=financials,
            ratios=ratios, secondary_research=secondary_research_full,
            triangulation=triangulation
        )
        
        risk_summary, swot = await asyncio.gather(risk_summary_task, swot_task)
        
        # 7. Recommendation decision
        recommendation = generate_recommendation(
            company_name, financials, ratios, risk,
            secondary_research_full, triangulation, swot
        )
        
        # 8. Render comprehensive PDF Memo
        cam_report = generate_cam(
            company_name, financials, ratios, risk,
            secondary_research_full, triangulation, swot, recommendation
        )

        return {
            "financials": financials,
            "ratios": ratios,
            "news": news,
            "risk": risk,
            "risk_summary": risk_summary,
            "secondary_research": secondary_research_full,
            "triangulation": triangulation,
            "swot": swot,
            "recommendation": recommendation,
            "cam_report": cam_report
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        print(f"[ANALYZE ERROR] Details:\n{traceback.format_exc()}")
        # Sanitize exception message to hide server details in production
        return JSONResponse(
            status_code=500,
            content={"error": "An unexpected error occurred during document appraisal. Please check file formatting."}
        )

