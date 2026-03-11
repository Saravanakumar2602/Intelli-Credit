import re

# Test text from the new PDFs
test_text = """
INFOSYS LIMITED
Annual Report 2025-2026

FINANCIAL SUMMARY (INR in Lakhs)

Revenue from Operations: 2500000 Lakhs
Cost of Materials Consumed: 1200000 Lakhs
Gross Profit: 1300000 Lakhs
Operating Expenses: 900000 Lakhs
EBITDA: 400000 Lakhs
Depreciation: 80000 Lakhs
EBIT: 320000 Lakhs
Finance Costs: 50000 Lakhs
Profit Before Tax: 270000 Lakhs
Tax Expense: 54000 Lakhs
NET PROFIT FOR THE YEAR: 216000 Lakhs

BALANCE SHEET DATA (INR in Lakhs)

Cash and Cash Equivalents: 500000 Lakhs
Trade Receivables: 600000 Lakhs
Inventory: 100000 Lakhs
Other Current Assets: 270000 Lakhs
TOTAL CURRENT ASSETS: 1470000 Lakhs

TOTAL ASSETS: 2000000 Lakhs

TOTAL LIABILITIES: 910000 Lakhs

TOTAL EQUITY: 1090000 Lakhs

Trade Payables: 300000 Lakhs
Other Current Liabilities: 400000 Lakhs
Current Portion of Debt: 100000 Lakhs
TOTAL CURRENT LIABILITIES: 800000 Lakhs

Long-term Borrowings: 100000 Lakhs
Deferred Tax Liability: 10000 Lakhs
TOTAL NON-CURRENT LIABILITIES: 110000 Lakhs

TOTAL LIABILITIES: 910000 Lakhs
"""

patterns = {
    "revenue": [
        r"(?:Revenue from Operations|Revenue|Total Revenue|Net Sales|Sales)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
        r"Revenue\s*:\s*([\d,]+)",
        r"REVENUE\s+([\d,]+)"
    ],
    "net_profit": [
        r"(?:Net Profit|Net Income|Bottom Line|PAT|NET PROFIT FOR THE YEAR)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
        r"NET PROFIT\s+([\d,]+)",
        r"Net Profit\s*:\s*([\d,]+)"
    ],
    "total_debt": [
        r"(?:Total Debt|Total Outstanding Debt|Total Borrowing|Long-term Borrowings)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
        r"TOTAL.*DEBT\s+([\d,]+)",
        r"Total Debt\s*:\s*([\d,]+)"
    ],
    "total_assets": [
        r"(?:TOTAL ASSETS|Total Assets)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
        r"TOTAL ASSETS\s+([\d,]+)",
        r"Total Assets\s*:\s*([\d,]+)"
    ],
    "total_liabilities": [
        r"(?:TOTAL LIABILITIES|Total Liabilities)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
        r"TOTAL LIABILITIES\s+([\d,]+)",
        r"Total Liabilities\s*:\s*([\d,]+)"
    ]
}

print("="*70)
print("REGEX PATTERN TEST")
print("="*70)

extracted = {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0}

for key, pattern_list in patterns.items():
    print(f"\n[{key}]")
    for i, pattern in enumerate(pattern_list):
        match = re.search(pattern, test_text, re.IGNORECASE)
        if match:
            print(f"  ✓ Pattern {i}: MATCHED")
            print(f"    Full match: {match.group(0)}")
            print(f"    Captured value: {match.group(1)}")
            try:
                value = match.group(1).replace(",", "").replace(" ", "")
                extracted[key] = int(float(value))
                print(f"    Extracted number: {extracted[key]}")
                break
            except (ValueError, AttributeError) as e:
                print(f"    ✗ Parse error: {e}")
        else:
            print(f"  ✗ Pattern {i}: NO MATCH")

print("\n" + "="*70)
print("FINAL EXTRACTED VALUES:")
print("="*70)
for key, value in extracted.items():
    print(f"{key:20} = {value:>10}")
