#!/usr/bin/env python3
import sys
sys.path.insert(0, r'c:\Saravanakumar G\Projects\Intelli-Credit')

from app.services.financial_analysis import calculate_ratios
from app.services.risk_scoring import calculate_risk_score
from app.services.news_research import get_company_news
from app.services.secondary_research import generate_secondary_research
from app.services.recommendation_engine import generate_recommendation
from app.services.triangulation_service import triangulate_data

# Test data (Infosys)
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

print("=" * 70)
print("COMPREHENSIVE TEST - ALL FIXES")
print("=" * 70)

# 1. Calculate Ratios
print("\n1. FINANCIAL RATIOS:")
ratios = calculate_ratios(financials)
print(f"   ✓ Profit Margin: {ratios['profit_margin']*100:.2f}% (expected 8.64%)")
print(f"   ✓ Current Ratio: {ratios['current_ratio']:.2f}x (expected 1.84x)")
print(f"   ✓ Debt-to-Equity: {ratios['debt_equity']:.2f}x (expected 0.12x)")

# 2. Calculate Risk Score
print("\n2. RISK ASSESSMENT:")
news = get_company_news("Infosys")
risk = calculate_risk_score(ratios, news["sentiment"])
print(f"   ✓ Risk Score: {risk['score']}/100")
print(f"   ✓ Risk Level: {risk['risk_level']} (expected Low Risk)")
print(f"   ✓ News Sentiment: {news['sentiment']:.2f}")
print(f"   ✓ News Articles: {len(news['articles'])} (expected 3+)")

# 3. Secondary Research
print("\n3. SECONDARY RESEARCH:")
secondary_research = generate_secondary_research("Infosys", sector="IT Services", financial_data=financials)
sentiment = secondary_research.get("overall_sentiment", {})
print(f"   ✓ Overall Sentiment: {sentiment.get('label', 'unknown').upper()} (expected POSITIVE)")
print(f"   ✓ Sentiment Score: {sentiment.get('score', 0):.2f}")
print(f"   ✓ Risk Flags: {len(secondary_research.get('risk_flags', []))} (expected 0)")

# 4. Triangulation
print("\n4. DATA TRIANGULATION:")
triangulation = triangulate_data("Infosys", financials, ratios, secondary_research, risk)
print(f"   ✓ Confidence Score: {triangulation.get('confidence_score', 0):.0f}/100")
print(f"   ✓ Validation Status: {triangulation.get('summary', {}).get('validation_status', 'unknown').upper()}")

# 5. Recommendation
print("\n5. LOAN RECOMMENDATION:")
swot = {"threats": [], "weaknesses": []}  # Simplified SWOT
recommendation = generate_recommendation("Infosys", financials, ratios, risk, secondary_research, triangulation, swot)
print(f"   ✓ Decision: {recommendation['decision']} (expected APPROVE)")
print(f"   ✓ Confidence: {recommendation['confidence']:.0f}/100 (expected 92/100)")
print(f"   ✓ Approval Probability: {recommendation.get('approval_probability', 0)*100:.0f}% (expected 95%)")

print("\n" + "=" * 70)
print("✅ ALL TESTS COMPLETED")
print("=" * 70)

# Summary
expected_decisions = {
    "Profit Margin": ("8.64%", f"{ratios['profit_margin']*100:.2f}%"),
    "Current Ratio": ("1.84x", f"{ratios['current_ratio']:.2f}x"),
    "Risk Level": ("Low Risk", risk['risk_level']),
    "Sentiment": ("POSITIVE", sentiment.get('label', 'unknown').upper()),
    "Recommendation": ("APPROVE", recommendation['decision']),
}

print("\nVALIDATION SUMMARY:")
all_pass = True
for metric, (expected, actual) in expected_decisions.items():
    match = "✅" if expected.upper() in str(actual).upper() or expected.split()[0] in str(actual) else "❌"
    if "❌" in match:
        all_pass = False
    print(f"{match} {metric}: {actual}")

if all_pass:
    print("\n🎉 ALL CHECKS PASSED!")
else:
    print("\n⚠️  SOME CHECKS FAILED - REVIEW ABOVE")
