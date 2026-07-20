from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class Citation(BaseModel):
    page: str = Field(..., description="Page number of the source text")
    quote: str = Field(..., description="Source paragraph or sentence quote")

# 1. Financial Extraction Agent Schema
class FinancialsExtractionSchema(BaseModel):
    revenue: int = Field(0, description="Annual total revenue")
    net_profit: int = Field(0, description="Net profit after tax (PAT)")
    total_debt: int = Field(0, description="Total outstanding debt/borrowings")
    total_assets: int = Field(0, description="Total asset base")
    total_liabilities: int = Field(0, description="Total liabilities base")
    current_assets: int = Field(0, description="Total current assets")
    current_liabilities: int = Field(0, description="Total current liabilities")
    ebitda: int = Field(0, description="Earnings Before Interest, Tax, Depreciation, and Amortization")
    interest_expense: int = Field(0, description="Total annual interest payment expense")
    depreciation: int = Field(0, description="Depreciation and amortization expense")
    inventory: int = Field(0, description="Total inventory value")
    accounts_receivable: int = Field(0, description="Trade receivables value")
    accounts_payable: int = Field(0, description="Trade payables value")
    equity: int = Field(0, description="Total shareholders equity")
    confidence_score: float = Field(..., description="Extraction confidence score (0 to 100)")
    citations: List[Citation] = Field(default=[], description="Source citations tracking extracted numbers")

# 2. Ratio Analysis Agent Schema
class RatioAnalysisSchema(BaseModel):
    mathematical_verification: bool = Field(True, description="Are the computed ratios consistent with extracted data?")
    anomalies: List[str] = Field(default=[], description="Anomalies detected in calculations")
    trend_analysis: str = Field(..., description="Qualitative evaluation of financial trends")

# 3. Industry Research Agent Schema
class IndustryResearchSchema(BaseModel):
    sector_outlook: str = Field(..., description="Overview of the sector outlook")
    competitor_benchmarks: Dict[str, str] = Field(default={}, description="Competitor ratio benchmarks")
    regulatory_warnings: List[str] = Field(default=[], description="RBI or regulatory guidelines on the sector")

# 4. News Intelligence Agent Schema
class NewsIntelligenceSchema(BaseModel):
    news_sentiment: float = Field(..., description="Aggregated news sentiment polarity (-1 to 1)")
    credibility_rating: str = Field(..., description="Overall credibility of news sources (e.g. HIGH, MEDIUM, LOW)")
    key_findings: List[str] = Field(..., description="Main news highlights about the company")

# 5. SWOT Agent Schema
class SWOTPoint(BaseModel):
    point: str = Field(..., description="SWOT observation")
    evidence: str = Field(..., description="Financial or textual evidence supporting the observation")
    level: str = Field("medium", description="high, medium, or low impact")

class SWOTSchema(BaseModel):
    strengths: List[SWOTPoint] = Field(default=[])
    weaknesses: List[SWOTPoint] = Field(default=[])
    opportunities: List[SWOTPoint] = Field(default=[])
    threats: List[SWOTPoint] = Field(default=[])
    strategic_position_summary: str = Field(..., description="Brief strategic summary")

# 6. Risk Assessment Agent Schema
class RiskFactor(BaseModel):
    score: float = Field(..., description="Risk score out of 100 (higher score means lower risk)")
    rationale: str = Field(..., description="Explanation of the risk evaluation")

class RiskAssessmentSchema(BaseModel):
    financial_risk: RiskFactor
    industry_risk: RiskFactor
    operational_risk: RiskFactor
    legal_risk: RiskFactor
    esg_risk: RiskFactor
    news_risk: RiskFactor
    management_risk: RiskFactor
    liquidity_risk: RiskFactor
    explainable_risk_summary: str = Field(..., description="Comprehensive explainability risk summary")

# 7. Compliance Agent Schema
class ComplianceSchema(BaseModel):
    is_compliant: bool = Field(True, description="Does the loan pass regulatory checklist?")
    policy_deviations: List[str] = Field(default=[], description="List of policy deviations")
    remedial_measures: List[str] = Field(default=[], description="Recommended measures to satisfy compliance")

# 8. Recommendation Agent Schema
class RecommendationSchema(BaseModel):
    decision: str = Field(..., description="APPROVE, CONDITIONAL_APPROVE, or REJECT")
    recommendation_summary: str = Field(..., description="Detailed loan appraisal rationale")
    conditions: List[str] = Field(default=[], description="Approval covenants and conditions")
    next_steps: List[str] = Field(default=[], description="Steps required for disbursement")
    confidence: float = Field(..., description="Final approval decision confidence score (0 to 100)")
    citations: List[Citation] = Field(default=[], description="Citations backing the recommendations")

# 9. CAM Report Agent Schema
class CAMReportSchema(BaseModel):
    executive_summary_format: str = Field(..., description="Formatted executive summary text block")
    appendix_details: str = Field(..., description="Technical note and formula details for report appendix")
