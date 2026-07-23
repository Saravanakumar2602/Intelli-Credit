"""
Configurable Risk Engine Service
Evaluates risk profiles across 8 categories with database weights support.
"""
from sqlalchemy.orm import Session

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

def run_risk_scoring(db: Session, ratios: dict, news_sentiment: float, llm_scores: dict = None) -> dict:
    """
    Computes overall risk score (0 to 100) and compiles explainable reasonings.
    High score = Lower risk. Low score = Higher risk.
    llm_scores: optional dict from AI pipeline risk_assessment agent output.
    """
    weights = DEFAULT_WEIGHTS.copy()

    # Financial Risk — always computed from ratios
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

    # Liquidity Risk — always computed from ratios
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

    # News Risk — computed from sentiment
    news_score = 50.0 + (news_sentiment * 50.0)
    news_score = max(0, min(100, news_score))

    def _llm(key: str, default: float) -> float:
        """Extract score from LLM output dict or fall back to default."""
        if llm_scores and key in llm_scores:
            val = llm_scores[key]
            if isinstance(val, dict):
                return float(val.get("score", default))
            return float(val)
        return default

    industry_score   = _llm("industry_risk",   75.0)
    operational_score = _llm("operational_risk", 80.0)
    legal_score      = _llm("legal_risk",       85.0)
    esg_score        = _llm("esg_risk",         70.0)
    management_score = _llm("management_risk",  80.0)

    scores = {
        "financial":   financial_score,
        "industry":    industry_score,
        "operational": operational_score,
        "legal":       legal_score,
        "esg":         esg_score,
        "news":        news_score,
        "management":  management_score,
        "liquidity":   liquidity_score,
    }

    total_score = 0.0
    breakdown_details = {}
    for cat, score in scores.items():
        weight = weights.get(cat, 0.125)
        total_score += score * weight
        breakdown_details[cat] = {"score": score, "weight": weight}

    total_score = round(max(0.0, min(100.0, total_score)), 1)

    if total_score >= 75.0:
        risk_level = "Low Risk"
    elif total_score >= 50.0:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"

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
        "explanation": explanation,
    }
