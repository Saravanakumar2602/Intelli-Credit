def calculate_ratios(financials):
    revenue = financials.get("revenue", 0)
    profit = financials.get("net_profit", 0)
    debt = financials.get("total_debt", 0)
    assets = financials.get("total_assets", 0)
    liabilities = financials.get("total_liabilities", 0)
    equity = financials.get("equity", 0)
    ratios = {}
    if revenue:
        ratios["profit_margin"] = profit / revenue
    if assets:
        ratios["debt_ratio"] = debt / assets
    if liabilities:
        ratios["leverage"] = debt / liabilities
    if equity:
        ratios["debt_equity"] = debt / equity
        ratios["roe"] = profit / equity
    if assets:
        ratios["roa"] = profit / assets
    return ratios
