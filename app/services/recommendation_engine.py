"""
Loan Approval Recommendation Engine
Explainable decision logic based on comprehensive analysis
"""
from datetime import datetime

def generate_recommendation(company, financials, ratios, risk_score, secondary_research, triangulation, swot):
    """
    Generate loan approval recommendation with detailed reasoning
    Returns: Approve / Conditional / Reject with full reasoning
    """
    
    recommendation = {
        "company": company,
        "date": datetime.now().isoformat(),
        "decision": None,
        "confidence": 0,
        "reasoning": {},
        "conditions": [],
        "risk_factors": [],
        "positive_factors": [],
        "recommendation_summary": ""
    }
    
    # 1. Financial Health Analysis
    financial_score = 0
    financial_reasoning = []
    
    # Revenue analysis
    if financials.get("revenue", 0) > 0:
        financial_score += 20
        financial_reasoning.append("✓ Positive revenue generation")
    else:
        financial_reasoning.append("✗ No revenue reported")
    
    # Profitability analysis
    profit_margin = ratios.get("profit_margin", 0)
    if profit_margin > 0.15:
        financial_score += 20
        financial_reasoning.append(f"✓ Strong profitability ({profit_margin:.2%} margin)")
    elif profit_margin > 0.05:
        financial_score += 10
        financial_reasoning.append(f"⚠ Moderate profitability ({profit_margin:.2%} margin)")
    else:
        financial_reasoning.append(f"✗ Low/negative profitability ({profit_margin:.2%})")
    
    # Leverage analysis
    leverage = ratios.get("leverage", 0)
    if leverage < 1.5:
        financial_score += 20
        financial_reasoning.append(f"✓ Conservative leverage ({leverage:.2f}x)")
    elif leverage < 2.5:
        financial_score += 10
        financial_reasoning.append(f"⚠ Moderate leverage ({leverage:.2f}x)")
    else:
        financial_reasoning.append(f"✗ High leverage ({leverage:.2f}x) - debt burden concern")
    
    # Debt ratio analysis
    debt_ratio = ratios.get("debt_ratio", 0)
    if debt_ratio < 0.4:
        financial_score += 20
        financial_reasoning.append(f"✓ Low debt ratio ({debt_ratio:.2%})")
    elif debt_ratio < 0.6:
        financial_score += 10
        financial_reasoning.append(f"⚠ Moderate debt ratio ({debt_ratio:.2%})")
    else:
        financial_reasoning.append(f"✗ High debt ratio ({debt_ratio:.2%})")
    
    # Liquidity analysis
    current_ratio = ratios.get("current_ratio", 0)
    if current_ratio >= 1.5:
        financial_score += 20
        financial_reasoning.append(f"✓ Healthy liquidity ({current_ratio:.2f}x)")
    elif current_ratio >= 1.0:
        financial_score += 10
        financial_reasoning.append(f"⚠ Adequate liquidity ({current_ratio:.2f}x)")
    else:
        financial_reasoning.append(f"✗ Liquidity concerns ({current_ratio:.2f}x)")
    
    recommendation["reasoning"]["financial"] = {
        "score": financial_score,
        "max_score": 100,
        "analysis": financial_reasoning
    }
    
    # 2. Risk Assessment
    risk_label = risk_score.get("risk_level", risk_score.get("label", "unknown")).upper()
    risk_value = risk_score.get("score", 50)
    
    # Note: Higher score = Lower risk (score > 70 = Low Risk, score < 40 = High Risk)
    # For decision logic, invert it: lower_risk_value = 100 - risk_value
    lower_is_better_risk = 100 - risk_value  # Now higher numbers mean higher risk
    
    recommendation["reasoning"]["risk"] = {
        "score": risk_value,
        "label": risk_label,
        "assessment": f"Risk Score: {risk_value}/100 ({risk_label})"
    }
    
    if lower_is_better_risk > 30:  # risk > 30 means high risk
        recommendation["risk_factors"].append("High overall risk profile")
    elif lower_is_better_risk > 15:  # risk > 15 means medium risk
        recommendation["risk_factors"].append("Moderate risk profile")
    else:
        recommendation["positive_factors"].append("Low risk profile")
    
    # 3. Secondary Research Analysis
    secondary_sentiment = secondary_research.get("overall_sentiment", {}).get("score", 0)
    secondary_label = secondary_research.get("overall_sentiment", {}).get("label", "neutral")
    
    recommendation["reasoning"]["secondary_research"] = {
        "sentiment_score": secondary_sentiment,
        "sentiment_label": secondary_label,
        "analysis": f"Market and regulatory sentiment: {secondary_label.upper()}"
    }
    
    if secondary_sentiment > 0.1:
        recommendation["positive_factors"].append(f"Positive market sentiment ({secondary_sentiment:.2f})")
    elif secondary_sentiment < -0.2:
        recommendation["risk_factors"].append(f"Negative market sentiment ({secondary_sentiment:.2f})")
    
    # Red flags from secondary research
    red_flags = secondary_research.get("risk_flags", [])
    if red_flags:
        for flag in red_flags:
            recommendation["risk_factors"].append(flag)
    
    # 4. Data Triangulation & Validation
    confidence_score = triangulation.get("confidence_score", 60)
    validation_status = triangulation.get("summary", {}).get("validation_status", "unknown")
    
    recommendation["reasoning"]["data_quality"] = {
        "confidence": confidence_score,
        "status": validation_status,
        "analysis": f"Data validation: {validation_status.upper()} (Confidence: {confidence_score:.0f}/100)"
    }
    
    if validation_status == "fail":
        recommendation["risk_factors"].append("Data validation issues - requires manual review")
    elif validation_status == "caution":
        recommendation["conditions"].append("Recommend additional due diligence")
    
    # 5. SWOT Analysis - Extract key risks and opportunities
    if swot:
        threats = swot.get("threats", [])
        if threats:
            critical_threats = [t for t in threats if t.get("severity") == "high"]
            for threat in critical_threats[:2]:
                recommendation["risk_factors"].append(f"Threat: {threat.get('point')}")
        
        weaknesses = swot.get("weaknesses", [])
        if weaknesses:
            critical_weaknesses = [w for w in weaknesses if w.get("impact") == "high"]
            for weakness in critical_weaknesses[:2]:
                recommendation["risk_factors"].append(f"Weakness: {weakness.get('point')}")
    
    # 6. Final Decision Logic
    # Score components:
    # - financial_score: 0-100 (higher is better)
    # - lower_is_better_risk: 0-100 (lower is better, so invert for weighting)
    # - confidence_score: 0-100 (higher is better)
    total_score = (financial_score * 0.4) + ((100 - lower_is_better_risk) * 0.4) + (confidence_score * 0.2)
    
    # Adjust for secondary research
    if secondary_sentiment < -0.3:
        total_score -= 15
    elif secondary_sentiment > 0.3:
        total_score += 10
    
    # Adjust for red flags
    total_score -= len(recommendation["risk_factors"]) * 5
    
    total_score = max(0, min(100, total_score))
    recommendation["confidence"] = total_score
    
    # Decision making
    # Approve if: good financial score AND low risk (inverted) AND data is valid
    if total_score >= 75 and lower_is_better_risk <= 30 and validation_status != "fail":
        recommendation["decision"] = "APPROVE"
        recommendation["recommendation_summary"] = (
            f"Strong recommendation to APPROVE loan. "
            f"{company} demonstrates solid financial health, "
            f"acceptable risk profile, and positive market positioning."
        )
    
    elif total_score >= 60 and lower_is_better_risk <= 50 and validation_status != "fail":
        recommendation["decision"] = "CONDITIONAL_APPROVE"
        recommendation["recommendation_summary"] = (
            f"Recommend CONDITIONAL APPROVAL. {company} shows potential but "
            f"requires additional conditions or ongoing monitoring."
        )
        
        if lower_is_better_risk > 30:
            recommendation["conditions"].append("Enhanced monitoring of risk indicators")
        if financial_score < 50:
            recommendation["conditions"].append("Quarterly financial reporting requirement")
        if secondary_sentiment < 0:
            recommendation["conditions"].append("Review market developments quarterly")
    
    else:
        recommendation["decision"] = "REJECT"
        recommendation["recommendation_summary"] = (
            f"Recommendation to REJECT or escalate for senior review. "
            f"Multiple risk factors and data quality concerns require resolution."
        )
    
    # Approval probability
    if recommendation["decision"] == "APPROVE":
        recommendation["approval_probability"] = 0.95
    elif recommendation["decision"] == "CONDITIONAL_APPROVE":
        recommendation["approval_probability"] = 0.65
    else:
        recommendation["approval_probability"] = 0.20
    
    # Additional guidance
    recommendation["next_steps"] = []
    
    if recommendation["decision"] == "CONDITIONAL_APPROVE":
        recommendation["next_steps"].extend(recommendation["conditions"])
    
    if validation_status == "caution" or validation_status == "fail":
        recommendation["next_steps"].append("Conduct manual document review")
    
    if red_flags:
        recommendation["next_steps"].append("Investigate identified red flags")
    
    if not recommendation["next_steps"]:
        if recommendation["decision"] == "APPROVE":
            recommendation["next_steps"].append("Proceed with loan documentation")
        else:
            recommendation["next_steps"].append("Schedule senior management review")
    
    return recommendation
