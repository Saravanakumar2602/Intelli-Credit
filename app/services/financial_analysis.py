def calculate_ratios(financials):
    revenue = financials.get("revenue", 0) or 0
    profit = financials.get("net_profit", 0) or 0
    debt = financials.get("total_debt", 0) or 0
    assets = financials.get("total_assets", 0) or 0
    liabilities = financials.get("total_liabilities", 0) or 0
    equity = financials.get("equity", 0) or 0
    
    ratios = {}
    
    if revenue > 0:
        ratios["profit_margin"] = profit / revenue
    else:
        ratios["profit_margin"] = 0
    
    if assets > 0:
        ratios["debt_ratio"] = debt / assets
    else:
        ratios["debt_ratio"] = 0
    
    if liabilities > 0:
        ratios["leverage"] = debt / liabilities
    else:
        ratios["leverage"] = 0
    
    if equity > 0:
        ratios["debt_equity"] = debt / equity
        ratios["roe"] = profit / equity
    else:
        ratios["debt_equity"] = 0
        ratios["roe"] = 0
    
    if assets > 0:
        ratios["roa"] = profit / assets
    else:
        ratios["roa"] = 0
    
    return ratios
