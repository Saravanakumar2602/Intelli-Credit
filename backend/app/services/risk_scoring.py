def calculate_risk_score(ratios, sentiment):
    score = 100
    
    debt_ratio = ratios.get("debt_ratio", 0) or 0
    profit_margin = ratios.get("profit_margin", 0) or 0
    
    if debt_ratio > 0.6:
        score -= 20
    elif debt_ratio > 0.4:
        score -= 10
    
    if profit_margin < 0.05:
        score -= 15
    elif profit_margin < 0.1:
        score -= 8
    
    if sentiment < -0.3:
        score -= 15
    elif sentiment < 0:
        score -= 5
    elif sentiment > 0.3:
        score += 5
    
    score = max(0, min(100, score))
    
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
