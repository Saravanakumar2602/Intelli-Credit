from pydantic import BaseModel
from typing import Dict, List, Optional

class SchemaField(BaseModel):
    name: str
    type: str

class AnalyzeBody(BaseModel):
    file_paths: Dict[str, str]
    company: str
    schema_config: Optional[List[SchemaField]] = None

class JobStatusResponse(BaseModel):
    job_id: str
    loan_application_id: int
    status: str
    progress: float
    current_step: Optional[str] = None
    error_message: Optional[str] = None

class AnalysisResultResponse(BaseModel):
    financials: dict
    ratios: dict
    news: dict
    risk: dict
    risk_summary: str
    secondary_research: dict
    triangulation: dict
    swot: dict
    recommendation: dict
    cam_report: str
