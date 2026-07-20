"""
Data Triangulation Service
Cross-verify extracted financial data with secondary research
Identify anomalies, validate claims, flag red flags
"""
from datetime import datetime

def calculate_financial_health_score(financials, ratios):
    """Calculate overall financial health (0-100)"""
    score = 50  # baseline
    
    # Revenue positive trend
    if financials.get("revenue", 0) > 0:
        score += 10
    
    # Profitability
    if financials.get("net_profit", 0) > 0:
        score += 15
    
    # Leverage check
    if ratios.get("leverage", 0) < 2:
        score += 10
    
    # Debt ratio
    if ratios.get("debt_ratio", 0) < 0.6:
        score += 10
    
    # Liquidity
    if ratios.get("current_ratio", 0) >= 1.5:
        score += 10
    
    return min(100, max(0, score))

def triangulate_data(company, financials, ratios, secondary_research, risk_score):
    """
    Triangulate data from multiple sources
    Returns: validation report with anomalies and red flags
    """
    
    triangulation = {
        "company": company,
        "date": datetime.now().isoformat(),
        "data_sources": {
            "primary": "Document extraction (PDFs)",
            "secondary": "News, regulatory, market data",
            "quantitative": "Financial ratios"
        },
        "validation_results": [],
        "anomalies": [],
        "red_flags": [],
        "confidence_score": 0
    }
    
    # 1. Validate financial data quality
    financial_health = calculate_financial_health_score(financials, ratios)
    
    validation = {
        "aspect": "Financial Health",
        "score": financial_health,
        "status": "excellent" if financial_health >= 80 else "good" if financial_health >= 60 else "moderate" if financial_health >= 40 else "poor",
        "details": {
            "revenue": financials.get("revenue", 0),
            "net_profit": financials.get("net_profit", 0),
            "total_assets": financials.get("total_assets", 0),
            "debt_ratio": ratios.get("debt_ratio", 0)
        }
    }
    triangulation["validation_results"].append(validation)
    
    # 2. Cross-check with secondary research sentiment
    secondary_sentiment = secondary_research.get("overall_sentiment", {}).get("score", 0)
    financial_health_normalized = (financial_health / 100) * 2 - 1  # convert to -1 to 1 scale
    
    sentiment_mismatch = abs(secondary_sentiment - financial_health_normalized)
    
    if sentiment_mismatch > 0.5:
        anomaly = {
            "type": "Sentiment Mismatch",
            "severity": "high" if sentiment_mismatch > 0.7 else "medium",
            "description": "Financial data suggests different health than secondary research sentiment",
            "financial_indicator": financial_health_normalized,
            "research_sentiment": secondary_sentiment,
            "gap": sentiment_mismatch
        }
        triangulation["anomalies"].append(anomaly)
    
    # 3. Check for regulatory red flags
    if secondary_research.get("risk_flags"):
        for flag in secondary_research["risk_flags"]:
            triangulation["red_flags"].append({
                "source": "secondary_research",
                "flag": flag,
                "severity": "high" if "default" in flag.lower() or "fraud" in flag.lower() else "medium"
            })
    
    # 4. Validate against risk score
    risk_validation = {
        "aspect": "Risk Score Consistency",
        "risk_score": risk_score.get("score", 0),
        "risk_label": risk_score.get("risk_level", "unknown"),
        "is_consistent": True
    }
    
    r_score = risk_score.get("score", 100)
    
    # Inconsistent if risk is Low (score > 70) but financial health is Poor (< 40)
    if r_score > 70 and financial_health < 40:
        risk_validation["is_consistent"] = False
        triangulation["anomalies"].append({
            "type": "Risk-Health Inconsistency",
            "severity": "medium",
            "description": "Low risk rating (high risk score) despite poor financial health - investigate indicators",
            "risk_score": r_score,
            "financial_health": financial_health
        })
    # Inconsistent if risk is High (score < 40) but financial health is Good/Excellent (> 70)
    elif r_score < 40 and financial_health > 70:
        risk_validation["is_consistent"] = False
        triangulation["anomalies"].append({
            "type": "Risk-Health Inconsistency",
            "severity": "medium",
            "description": "High risk rating (low risk score) despite strong financial health - investigate indicators",
            "risk_score": r_score,
            "financial_health": financial_health
        })
    
    triangulation["validation_results"].append(risk_validation)
    
    # 5. Validate extracted data completeness
    required_fields = ["revenue", "net_profit", "total_assets", "total_liabilities"]
    missing_fields = [f for f in required_fields if not financials.get(f)]
    
    if missing_fields:
        triangulation["anomalies"].append({
            "type": "Incomplete Data",
            "severity": "medium",
            "description": "Some financial fields are missing",
            "missing_fields": missing_fields
        })
    
    # 6. Industry sentiment comparison
    if secondary_research.get("components", {}).get("industry_trends"):
        industry_sentiment = secondary_research["components"]["industry_trends"].get("trend_sentiment", 0)
        company_sentiment = secondary_research.get("overall_sentiment", {}).get("score", 0)
        
        if company_sentiment < industry_sentiment - 0.3:
            triangulation["red_flags"].append({
                "source": "market_comparison",
                "flag": "Company sentiment underperforming vs industry trends",
                "severity": "medium",
                "company_sentiment": company_sentiment,
                "industry_sentiment": industry_sentiment
            })
    
    # 7. Calculate overall confidence score
    confidence = 100
    
    # Deduct for anomalies
    confidence -= len(triangulation["anomalies"]) * 15
    
    # Deduct for red flags
    confidence -= len([f for f in triangulation["red_flags"] if f.get("severity") == "high"]) * 20
    confidence -= len([f for f in triangulation["red_flags"] if f.get("severity") == "medium"]) * 10
    
    # Add for complete data
    if not missing_fields:
        confidence += 10
    
    # Add for sentiment match
    if sentiment_mismatch <= 0.3:
        confidence += 10
    
    triangulation["confidence_score"] = max(0, min(100, confidence))
    
    # 8. Summary recommendations
    triangulation["summary"] = {
        "data_quality": "high" if triangulation["confidence_score"] >= 80 else "medium" if triangulation["confidence_score"] >= 60 else "low",
        "validation_status": "pass" if len(triangulation["red_flags"]) == 0 else "caution" if len([f for f in triangulation["red_flags"] if f.get("severity") == "high"]) == 0 else "fail",
        "requires_manual_review": len(triangulation["anomalies"]) > 2 or any(f.get("severity") == "high" for f in triangulation["red_flags"]),
        "confidence_level": triangulation["confidence_score"]
    }
    
    return triangulation
