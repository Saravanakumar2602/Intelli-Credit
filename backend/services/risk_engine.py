"""
Configurable Risk Engine Service
Evaluates risk profiles across 8 categories with database weights support.
"""
from sqlalchemy.orm import Session

# Default weights if not configured in database
DEFAULT_WEIGHTS = {
    "financial": 0.25,
    "industry": 0.15,
    "operational": 0.15,
    "legal": 0.10,
    "esg": 0.05,
    "news": 0.10,
    "management": 0.10,
    "liquidity": 0.10
}

def run_risk_scoring(db: Session, ratios: dict, news_sentiment: float) -> dict:
    """
    Computes overall risk score (0 to 100) and compiles explainable reasonings.
    High score = Lower risk. Low score = Higher risk.
    """
    # 1. Gather Weights (can query DB or use defaults)
    # Placeholder for database weights query:
    # db_weights = db.query(RiskWeights).first() ...
    weights = DEFAULT_WEIGHTS.copy()
    
    # 2. Evaluate Categories (0 to 100)
    
    # Category A: Financial Risk (Leverage, Altman Z)
    debt_equity = ratios.get("debt_equity", 1.0)
    altman_z = ratios.get("altman_z", 1.5)
    financial_score = 100.0
    if debt_equity > 2.0:
        financial_score -= 30
    elif debt_equity > 1.0:
        financial_score -= 15
    if altman_z < 1.23:
        financial_score -= 40
    elif altman_z < 2.9:
        financial_score -= 20
    financial_score = max(10, financial_score)
    
    # Category B: Liquidity Risk (Current & Quick ratio)
    current_ratio = ratios.get("current_ratio", 1.0)
    quick_ratio = ratios.get("quick_ratio", 1.0)
    liquidity_score = 100.0
    if current_ratio < 1.0:
        liquidity_score -= 40
    elif current_ratio < 1.5:
        liquidity_score -= 20
    if quick_ratio < 0.8:
        liquidity_score -= 20
    liquidity_score = max(10, liquidity_score)
    
    # Category C: News Risk (Sentiment)
    news_score = 50.0 + (news_sentiment * 50.0) # Map -1..1 to 0..100
    news_score = max(0, min(100, news_score))
    
    # Category D-H: Defaults or LLM parsed indicators
    industry_score = 75.0  # Default sector score
    operational_score = 80.0 # Default operations score
    legal_score = 85.0       # Default compliance/litigation score
    esg_score = 70.0         # Default environment score
    management_score = 80.0  # Default management grade
    
    # Compile breakdown
    scores = {
        "financial": financial_score,
        "industry": industry_score,
        "operational": operational_score,
        "legal": legal_score,
        "esg": esg_score,
        "news": news_score,
        "management": management_score,
        "liquidity": liquidity_score
    }
    
    # 3. Calculate Weighted Sum
    total_score = 0.0
    breakdown_details = {}
    for cat, score in scores.items():
        weight = weights.get(cat, 0.125)
        total_score += score * weight
        breakdown_details[cat] = {
            "score": score,
            "weight": weight
        }
        
    total_score = round(max(0.0, min(100.0, total_score)), 1)
    
    # 4. Determine Risk Level
    if total_score >= 75.0:
        risk_level = "Low Risk"
    elif total_score >= 50.0:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"
        
    # 5. Generate Explanations (Explainable AI)
    reasons = []
    if debt_equity > 1.5:
        reasons.append("High leverage (Debt/Equity > 1.5x)")
    if altman_z < 1.23:
        reasons.append("Financial distress indicators present (Altman Z < 1.23)")
    elif altman_z < 2.9:
        reasons.append("Moderate financial solvency indicators (Altman Z in grey zone)")
    if current_ratio < 1.2:
        reasons.append("Low short-term liquidity buffer (Current Ratio < 1.2x)")
    if news_sentiment < -0.1:
        reasons.append("Negative press sentiment clippings detected")
        
    explanation = "; ".join(reasons) if reasons else "Company exhibits stable performance indicators across evaluated metrics."
    
    return {
        "score": total_score,
        "risk_level": risk_level,
        "breakdown": breakdown_details,
        "explanation": explanation
    }
