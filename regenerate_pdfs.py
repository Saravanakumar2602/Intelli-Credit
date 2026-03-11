#!/usr/bin/env python3
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def create_annual_report():
    c = canvas.Canvas("frontend/public/sample-pdfs/01_annual_report_Infosys.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "INFOSYS LIMITED - ANNUAL REPORT")
    
    c.setFont("Helvetica", 11)
    y = 720
    
    # Income Statement
    lines = [
        "",
        "INCOME STATEMENT:",
        "Revenue from Operations:           25,00,000 Lakhs",
        "Cost of Materials Consumed:        12,00,000 Lakhs",
        "Gross Profit:                      13,00,000 Lakhs",
        "Operating Expenses:                9,00,000 Lakhs",
        "EBITDA:                            4,00,000 Lakhs",
        "Depreciation & Amortization:       80,000 Lakhs",
        "EBIT (Operating Profit):           3,20,000 Lakhs",
        "Finance Costs:                     50,000 Lakhs",
        "Profit Before Tax:                 2,70,000 Lakhs",
        "Tax Expense:                       54,000 Lakhs",
        "NET PROFIT:                        2,16,000 Lakhs",
        "",
        "BALANCE SHEET ASSETS:",
        "Current Assets:                    14,70,000 Lakhs",
        "Non-Current Assets:                5,30,000 Lakhs",
        "TOTAL ASSETS:                      20,00,000 Lakhs",
        "",
        "BALANCE SHEET LIABILITIES:",
        "Current Liabilities:               8,00,000 Lakhs",
        "Non-Current Liabilities:           1,10,000 Lakhs",
        "TOTAL LIABILITIES:                 9,10,000 Lakhs",
        "",
        "EQUITY:",
        "Share Capital:                     3,00,000 Lakhs",
        "Reserves and Surplus:              7,90,000 Lakhs",
        "TOTAL EQUITY:                      10,90,000 Lakhs",
    ]
    
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
    
    c.save()
    print("✓ Created 01_annual_report_Infosys.pdf")

def create_borrowing():
    c = canvas.Canvas("frontend/public/sample-pdfs/02_borrowing_Infosys.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "INFOSYS LIMITED - BORROWING PROFILE")
    
    c.setFont("Helvetica", 11)
    y = 720
    
    lines = [
        "",
        "DEBT PROFILE:",
        "Short-term Borrowings:             30,000 Lakhs",
        "Long-term Borrowings:              1,00,000 Lakhs",
        "TOTAL DEBT:                        1,30,000 Lakhs",
        "",
        "INTEREST SCHEDULE:",
        "Finance Costs (Annually):          50,000 Lakhs",
        "Interest Coverage Ratio:           6.4x",
        "",
        "REPAYMENT SCHEDULE:",
        "Year 1: 30,000 Lakhs",
        "Year 2: 35,000 Lakhs",
        "Year 3+: 65,000 Lakhs",
    ]
    
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
    
    c.save()
    print("✓ Created 02_borrowing_Infosys.pdf")

def create_shareholding():
    c = canvas.Canvas("frontend/public/sample-pdfs/03_shareholding_Infosys.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "INFOSYS LIMITED - SHAREHOLDING PATTERN")
    
    c.setFont("Helvetica", 11)
    y = 720
    
    lines = [
        "",
        "SHAREHOLDER STRUCTURE:",
        "Promoters:                         45%",
        "FIIs (Foreign Institutional):      35%",
        "DIIs (Domestic Institutional):     15%",
        "Retail Investors:                  5%",
        "",
        "MAJOR SHAREHOLDERS:",
        "Narayana Murthy:                   3.2%",
        "Life Insurance Corporation:        7.1%",
        "Other Institutions:                25.7%",
    ]
    
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
    
    c.save()
    print("✓ Created 03_shareholding_Infosys.pdf")

def create_aml():
    c = canvas.Canvas("frontend/public/sample-pdfs/04_aml_Infosys.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "INFOSYS LIMITED - AML & COMPLIANCE")
    
    c.setFont("Helvetica", 11)
    y = 720
    
    lines = [
        "",
        "COMPLIANCE STATUS:",
        "KYC Compliance:                    COMPLIANT",
        "AML Compliance:                    COMPLIANT",
        "GST Registration:                  COMPLIANT",
        "Income Tax:                        COMPLIANT",
        "",
        "AUDIT FINDINGS:",
        "Last Audit Date:                   2025-12-31",
        "Audit Opinion:                     CLEAN CHIT",
        "No Material Weaknesses:            YES",
        "",
        "REGULATORY STATUS:",
        "BSE Listing:                       Active",
        "NSE Listing:                       Active",
        "SEBI Status:                       Compliant",
    ]
    
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
    
    c.save()
    print("✓ Created 04_aml_Infosys.pdf")

def create_portfolio():
    c = canvas.Canvas("frontend/public/sample-pdfs/05_portfolio_Infosys.pdf", pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "INFOSYS LIMITED - INVESTMENT PORTFOLIO")
    
    c.setFont("Helvetica", 11)
    y = 720
    
    lines = [
        "",
        "PORTFOLIO BREAKDOWN:",
        "Liquid Investments:                3,00,000 Lakhs",
        "Fixed Assets:                      5,00,000 Lakhs",
        "Real Estate:                       2,00,000 Lakhs",
        "Technology Infrastructure:         3,00,000 Lakhs",
        "Other Assets:                      7,00,000 Lakhs",
        "TOTAL:                             20,00,000 Lakhs",
        "",
        "ASSET ALLOCATION:",
        "Technology & IT:                   40%",
        "Real Estate & Infrastructure:      30%",
        "Liquid Reserves:                   15%",
        "Other Strategic Assets:            15%",
        "",
        "INVESTMENT RETURNS:",
        "ROI on Investments:                12-15% annually",
    ]
    
    for line in lines:
        c.drawString(50, y, line)
        y -= 15
    
    c.save()
    print("✓ Created 05_portfolio_Infosys.pdf")

if __name__ == "__main__":
    create_annual_report()
    create_borrowing()
    create_shareholding()
    create_aml()
    create_portfolio()
    print("\n✅ All PDFs created successfully!")
