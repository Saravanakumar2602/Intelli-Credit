import re

# Simulate what's being extracted from the PDF
text = """
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

TOTAL ASSETS: 2000000 Lakhs
TOTAL LIABILITIES: 910000 Lakhs
TOTAL EQUITY: 1090000 Lakhs
"""

# Current regex patterns
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
        r"(?:Total Debt|Total Outstanding Debt|Total Borrowing|Long-term Borrowings|TOTAL OUTSTANDING DEBT)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
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
print("TESTING NET PROFIT EXTRACTION SPECIFICALLY")
print("="*70)

extracted = {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0}

# Test each key
for key in ["revenue", "net_profit", "total_assets", "total_liabilities"]:
    print(f"\n[{key.upper()}]")
    pattern_list = patterns[key]
    for i, pattern in enumerate(pattern_list):
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            print(f"  ✓ Pattern {i}: MATCHED")
            print(f"    Full match: '{match.group(0)}'")
            print(f"    Captured value: '{match.group(1)}'")
            try:
                value = match.group(1).replace(",", "").replace(" ", "")
                extracted[key] = int(float(value))
                print(f"    Extracted number: {extracted[key]}")
                break
            except (ValueError, AttributeError) as e:
                print(f"    ✗ Parse error: {e}")
        else:
            print(f"  ✗ Pattern {i}: NO MATCH - '{pattern[:50]}...'")

print("\n" + "="*70)
print("EXTRACTED VALUES:")
print("="*70)
for key, value in extracted.items():
    print(f"{key:20} = {value:>10}")

# Check what's happening with NET PROFIT specifically
print("\n" + "="*70)
print("DETAILED NET PROFIT ANALYSIS")
print("="*70)

# Find all lines with "profit" in them
profit_lines = [line for line in text.split('\n') if 'profit' in line.lower()]
print("\nAll lines containing 'profit':")
for line in profit_lines:
    print(f"  > {line}")

# Try specific pattern
pattern = r"NET PROFIT FOR THE YEAR:\s*([\d,]+)"
match = re.search(pattern, text, re.IGNORECASE)
if match:
    print(f"\n✓ Specific pattern matched: {match.group(0)}")
    print(f"  Value: {match.group(1)}")
else:
    print(f"\n✗ Specific pattern did NOT match")
