"""
SWOT Analysis Service
Generates comprehensive SWOT analysis using LLM
Based on: financial data, ratios, news, market analysis
"""
import requests
import os
from datetime import datetime

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("LLM_MODEL", "qwen3:8b")

def generate_swot_analysis(company, sector, financials, ratios, secondary_research, triangulation):
    """
    Generate SWOT analysis using LLM
    """
    
    # Prepare context for LLM
    context = f"""
Company: {company}
Sector: {sector}
Analysis Date: {datetime.now().strftime('%Y-%m-%d')}

FINANCIAL SNAPSHOT:
- Revenue: ₹{financials.get('revenue', 0):,}
- Net Profit: ₹{financials.get('net_profit', 0):,}
- Total Assets: ₹{financials.get('total_assets', 0):,}
- Total Liabilities: ₹{financials.get('total_liabilities', 0):,}

KEY RATIOS:
- Profit Margin: {ratios.get('profit_margin', 0):.2%}
- Debt Ratio: {ratios.get('debt_ratio', 0):.2%}
- Leverage: {ratios.get('leverage', 0):.2f}x
- Current Ratio: {ratios.get('current_ratio', 0):.2f}

MARKET SENTIMENT: {secondary_research.get('overall_sentiment', {}).get('label', 'neutral')}
Regulatory News Sentiment: {secondary_research.get('components', {}).get('regulatory', {}).get('sentiment', 0):.2f}
Market News Sentiment: {secondary_research.get('components', {}).get('market', {}).get('sentiment', 0):.2f}

VALIDATION STATUS: {triangulation.get('summary', {}).get('validation_status', 'unknown')}
Data Quality Score: {triangulation.get('confidence_score', 0):.0f}/100
"""

    prompt = f"""{context}

Based on the above financial data and market research, generate a SWOT analysis for {company} in JSON format with this exact structure:

{{
    "company": "{company}",
    "sector": "{sector}",
    "date": "{datetime.now().isoformat()}",
    "strengths": [
        {{"point": "...", "evidence": "...", "impact": "high/medium/low"}}
    ],
    "weaknesses": [
        {{"point": "...", "evidence": "...", "impact": "high/medium/low"}}
    ],
    "opportunities": [
        {{"point": "...", "evidence": "...", "potential": "high/medium/low"}}
    ],
    "threats": [
        {{"point": "...", "evidence": "...", "severity": "high/medium/low"}}
    ],
    "overall_assessment": "Brief summary of strategic position",
    "key_focus_areas": ["area1", "area2", "area3"]
}}

Generate 3-4 items for each category. Keep evidence concise and data-backed."""

    try:
        # Call Ollama
        response = requests.post(
            f"{OLLAMA_URL}/v1/chat/completions",
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 2000
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # Extract JSON from response
            import json
            try:
                # Try direct JSON parse
                swot = json.loads(content)
            except:
                # Try extracting JSON from text
                start = content.find("{")
                end = content.rfind("}") + 1
                if start != -1 and end > start:
                    swot = json.loads(content[start:end])
                else:
                    swot = create_default_swot(company, sector, financials, ratios)
            
            return swot
        else:
            return create_default_swot(company, sector, financials, ratios)
    
    except Exception as e:
        print(f"SWOT generation error: {e}")
        return create_default_swot(company, sector, financials, ratios)

def create_default_swot(company, sector, financials, ratios):
    """Fallback SWOT if LLM fails"""
    return {
        "company": company,
        "sector": sector,
        "date": datetime.now().isoformat(),
        "strengths": [
            {
                "point": "Established business operations",
                "evidence": f"Revenue: ₹{financials.get('revenue', 0):,}",
                "impact": "high"
            },
            {
                "point": "Asset base",
                "evidence": f"Total Assets: ₹{financials.get('total_assets', 0):,}",
                "impact": "high"
            }
        ],
        "weaknesses": [
            {
                "point": "Debt burden",
                "evidence": f"Debt Ratio: {ratios.get('debt_ratio', 0):.2%}",
                "impact": "medium"
            }
        ],
        "opportunities": [
            {
                "point": "Market expansion",
                "evidence": "Growing sector demand",
                "potential": "high"
            },
            {
                "point": "Digital transformation",
                "evidence": "Industry trend towards automation",
                "potential": "high"
            }
        ],
        "threats": [
            {
                "point": "Economic volatility",
                "evidence": "Macro uncertainties",
                "severity": "medium"
            },
            {
                "point": "Regulatory changes",
                "evidence": "Evolving compliance requirements",
                "severity": "medium"
            }
        ],
        "overall_assessment": f"{company} shows mixed financial health with adequate asset base but requires focus on debt reduction and profitability improvement.",
        "key_focus_areas": ["Debt reduction", "Revenue growth", "Operational efficiency"]
    }
