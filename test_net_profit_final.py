#!/usr/bin/env python3
import sys
sys.path.insert(0, r'c:\Saravanakumar G\Projects\Intelli-Credit')

from app.services.llm_extractor import extract_financials

# Test with actual text format from PDF
test_text = """
Revenue from Operations:           ₹25,00,000 Lakhs
Cost of Materials Consumed:        ₹12,00,000 Lakhs
Gross Profit:                      ₹13,00,000 Lakhs
Operating Expenses:                ₹9,00,000 Lakhs
EBITDA:                            ₹4,00,000 Lakhs
Depreciation & Amortization:       ₹80,000 Lakhs
EBIT (Operating Profit):           ₹3,20,000 Lakhs
Finance Costs:                     ₹50,000 Lakhs
Profit Before Tax:                 ₹2,70,000 Lakhs
Tax Expense:                       ₹54,000 Lakhs
NET PROFIT:                        ₹2,16,000 Lakhs

BALANCE SHEET ASSETS:
Current Assets:                    ₹14,70,000 Lakhs
Non-Current Assets:               ₹5,30,000 Lakhs
TOTAL ASSETS:                      ₹20,00,000 Lakhs

BALANCE SHEET LIABILITIES:
Current Liabilities:               ₹8,00,000 Lakhs
Non-Current Liabilities:           ₹1,10,000 Lakhs
TOTAL LIABILITIES:                 ₹9,10,000 Lakhs

TOTAL DEBT:                        ₹1,30,000 Lakhs
"""

print("Testing NET PROFIT extraction with actual PDF text format...")
result = extract_financials(test_text)

print(f"\nExtraction Results:")
print(f"  Revenue: {result['revenue']}")
print(f"  Net Profit: {result['net_profit']} ← CRITICAL")
print(f"  Total Debt: {result['total_debt']}")
print(f"  Total Assets: {result['total_assets']}")
print(f"  Total Liabilities: {result['total_liabilities']}")

# Check if NET PROFIT is correct
if result['net_profit'] == 216000:
    print("\n✅ SUCCESS: NET PROFIT extracted correctly!")
else:
    print(f"\n❌ FAILED: NET PROFIT = {result['net_profit']}, expected 216000")
