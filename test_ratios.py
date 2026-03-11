#!/usr/bin/env python3
import sys
sys.path.insert(0, r'c:\Saravanakumar G\Projects\Intelli-Credit')

from app.services.financial_analysis import calculate_ratios

# Test with correct financial data
financials = {
    "revenue": 2500000,
    "net_profit": 216000,
    "total_debt": 130000,
    "total_assets": 2000000,
    "total_liabilities": 910000,
    "current_assets": 1470000,
    "current_liabilities": 800000,
    "equity": 1090000
}

ratios = calculate_ratios(financials)

print("Financial Ratios Calculated:")
print(f"  Profit Margin: {ratios.get('profit_margin', 0) * 100:.2f}%")
print(f"  Current Ratio: {ratios.get('current_ratio', 0):.2f}x")
print(f"  Debt-to-Equity: {ratios.get('debt_equity', 0):.2f}x")
print(f"  ROE: {ratios.get('roe', 0) * 100:.2f}%")
print(f"  ROA: {ratios.get('roa', 0) * 100:.2f}%")

# Verify expected values
expected = {
    "profit_margin": 0.0864,  # 216000/2500000
    "current_ratio": 1.8375,  # 1470000/800000
    "debt_equity": 0.1193,    # 130000/1090000
    "roe": 0.1982,            # 216000/1090000
    "roa": 0.108               # 216000/2000000
}

print("\n✅ Verification:")
for key, expected_val in expected.items():
    actual_val = ratios.get(key, 0)
    match = "✓" if abs(actual_val - expected_val) < 0.001 else "✗"
    print(f"  {match} {key}: {actual_val:.4f} (expected {expected_val:.4f})")
