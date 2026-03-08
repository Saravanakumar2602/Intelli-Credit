def calculate_risk_score(ratios, sentiment):
    score = 100
    if ratios.get("debt_ratio",0) > 0.6:
        score -= 20
    if ratios.get("profit_margin",0) < 0.05:
        score -= 15
    if sentiment < 0:
        score -= 10
    if score > 70:
        level = "Low Risk"
    elif score > 40:
        level = "Medium Risk"
    else:
        level = "High Risk"
    return {
        "score": score,
        "risk_level": level
    }
