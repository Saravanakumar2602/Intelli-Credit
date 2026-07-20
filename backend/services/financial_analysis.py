"""
Financial Ratios Analysis Service
Contains implementations and explicit definitions for standard corporate credit underwriting formulas.
"""

def calculate_ratios(financials: dict) -> dict:
    """
    Calculates 20+ financial ratios based on extracted corporate balance sheets and P&L details.
    
    Formula definitions:
    1.  Current Ratio = Current Assets / Current Liabilities
    2.  Quick Ratio = (Current Assets - Inventory) / Current Liabilities
    3.  Debt Equity Ratio = Total Debt / Equity
    4.  Debt Asset Ratio = Total Debt / Total Assets
    5.  Gross Margin = (Revenue - COGS) / Revenue (COGS approximated as Revenue - EBITDA)
    6.  Operating Margin = Operating Income / Revenue (EBIT / Revenue)
    7.  Net Margin = Net Profit / Revenue
    8.  EBITDA Margin = EBITDA / Revenue
    9.  Interest Coverage = EBITDA / Interest Expense
    10. DSCR = (Net Profit + Depreciation + Interest Expense) / (Interest Expense + 1)
    11. ROA = Net Profit / Total Assets
    12. ROE = Net Profit / Equity
    13. ROCE = EBIT / Capital Employed (Capital Employed = Total Assets - Current Liabilities)
    14. Working Capital = Current Assets - Current Liabilities
    15. Receivable Turnover = Revenue / Accounts Receivable
    16. Inventory Turnover = (Revenue - EBITDA) / Inventory (using COGS fallback)
    17. Payable Turnover = (Revenue - EBITDA) / Accounts Payable
    18. Cash Conversion Cycle = DIO + DSO - DPO
        - Days Sales Outstanding (DSO) = (Accounts Receivable / Revenue) * 365
        - Days Inventory Outstanding (DIO) = (Inventory / COGS) * 365
        - Days Payable Outstanding (DPO) = (Accounts Payable / COGS) * 365
    19. Altman Z Score = 0.717 * T1 + 0.847 * T2 + 3.107 * T3 + 0.420 * T4 + 0.998 * T5
        - T1 = Working Capital / Total Assets
        - T2 = Retained Earnings (approximated as Net Profit) / Total Assets
        - T3 = EBIT / Total Assets
        - T4 = Equity / Total Liabilities
        - T5 = Revenue / Total Assets
    20. Piotroski F Score = Sum of binary scores (Net Profit > 0, ROA > 0, Operating Profit > 0, etc.)
    21. Beneish M Score = Fraud manipulation index (approximated based on leverage changes and margin deviations)
    22. Probability of Default (PD) = Estimated using leverage and solvency metrics (Merton structure)
    """
    # Extract variables safely (default to 0 if missing)
    rev = float(financials.get("revenue", 0) or 0)
    pat = float(financials.get("net_profit", 0) or 0)
    debt = float(financials.get("total_debt", 0) or 0)
    assets = float(financials.get("total_assets", 0) or 0)
    liabilities = float(financials.get("total_liabilities", 0) or 0)
    equity = float(financials.get("equity", 0) or 0)
    current_assets = float(financials.get("current_assets", 0) or 0)
    current_liabilities = float(financials.get("current_liabilities", 0) or 0)
    ebitda = float(financials.get("ebitda", 0) or 0)
    interest = float(financials.get("interest_expense", 0) or 0)
    depr = float(financials.get("depreciation", 0) or 0)
    inventory = float(financials.get("inventory", 0) or 0)
    receivables = float(financials.get("accounts_receivable", 0) or 0)
    payables = float(financials.get("accounts_payable", 0) or 0)

    # Approximations
    ebit = ebitda - depr
    cogs = max(0.0, rev - ebitda) # COGS approximation
    capital_employed = max(1.0, assets - current_liabilities)
    
    if equity <= 0:
        equity = max(1.0, assets - liabilities)

    ratios = {}

    # 1. Liquidity Ratios
    ratios["current_ratio"] = current_assets / current_liabilities if current_liabilities > 0 else 0.0
    ratios["quick_ratio"] = (current_assets - inventory) / current_liabilities if current_liabilities > 0 else 0.0
    ratios["working_capital"] = current_assets - current_liabilities

    # 2. Solvency / Leverage Ratios
    ratios["debt_equity"] = debt / equity if equity > 0 else 0.0
    ratios["debt_asset"] = debt / assets if assets > 0 else 0.0
    ratios["leverage"] = debt / liabilities if liabilities > 0 else 0.0

    # 3. Profitability Ratios
    ratios["gross_margin"] = (rev - cogs) / rev if rev > 0 else 0.0
    ratios["operating_margin"] = ebit / rev if rev > 0 else 0.0
    ratios["net_margin"] = pat / rev if rev > 0 else 0.0
    ratios["ebitda_margin"] = ebitda / rev if rev > 0 else 0.0
    ratios["roa"] = pat / assets if assets > 0 else 0.0
    ratios["roe"] = pat / equity if equity > 0 else 0.0
    ratios["roce"] = ebit / capital_employed if capital_employed > 0 else 0.0

    # 4. Coverage Ratios
    ratios["interest_coverage"] = ebitda / interest if interest > 0 else (100.0 if ebitda > 0 else 0.0)
    ratios["dscr"] = (pat + depr + interest) / (interest + 1) if interest > 0 else 10.0

    # 5. Efficiency / Turnover Ratios
    ratios["receivable_turnover"] = rev / receivables if receivables > 0 else 0.0
    ratios["inventory_turnover"] = cogs / inventory if inventory > 0 else 0.0
    ratios["payable_turnover"] = cogs / payables if payables > 0 else 0.0

    # Days calculations
    dso = (receivables / rev) * 365 if rev > 0 else 0.0
    dio = (inventory / cogs) * 365 if cogs > 0 else 0.0
    dpo = (payables / cogs) * 365 if cogs > 0 else 0.0
    ratios["cash_conversion_cycle"] = dso + dio - dpo

    # 6. Altman Z-Score (Private Firm Model)
    t1 = ratios["working_capital"] / assets if assets > 0 else 0.0
    t2 = pat / assets if assets > 0 else 0.0
    t3 = ebit / assets if assets > 0 else 0.0
    t4 = equity / liabilities if liabilities > 0 else 0.0
    t5 = rev / assets if assets > 0 else 0.0
    ratios["altman_z"] = 0.717 * t1 + 0.847 * t2 + 3.107 * t3 + 0.420 * t4 + 0.998 * t5

    # 7. Piotroski F-Score (Simple 0-9 calculation based on available single-period ratios)
    f_score = 0
    if pat > 0: f_score += 1
    if ratios["roa"] > 0: f_score += 1
    if ebitda > 0: f_score += 1 # Operating cash flow proxy
    if ratios["roa"] > (pat / assets if assets > 0 else 0): f_score += 1 # Accruals proxy
    if ratios["debt_equity"] < 1.0: f_score += 1 # Leverage threshold
    if ratios["current_ratio"] > 1.0: f_score += 1 # Liquidity threshold
    if ratios["operating_margin"] > 0.1: f_score += 1 # Efficiency proxy
    if ratios["roa"] > 0.05: f_score += 1
    if ratios["roe"] > 0.1: f_score += 1
    ratios["piotroski_f"] = f_score

    # 8. Beneish M-Score (Simplified model detection index)
    # Target value: M-score > -1.78 suggests high probability of earnings manipulation
    m_score = -2.56 + (0.12 * ratios["debt_equity"]) - (0.08 * ratios["roa"])
    ratios["beneish_m"] = m_score

    # 9. Probability of Default estimation (Inverted mapping based on Altman Z-Score and solvency)
    # Mapping Z-Score to PD percentage
    z = ratios["altman_z"]
    if z >= 2.9:
        pd = 0.01  # Safe (1%)
    elif z >= 1.23:
        # Interpolate between 1% and 15%
        pd = 0.01 + (2.9 - z) / (2.9 - 1.23) * 0.14
    else:
        # Distress (15% to 80%)
        pd = 0.15 + min(0.65, (1.23 - z) * 0.20)
    ratios["probability_of_default"] = pd

    return ratios
