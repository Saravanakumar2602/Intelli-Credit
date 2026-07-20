"""
SWOT Analysis Service
Generates comprehensive SWOT analysis using LLM
Based on: financial data, ratios, news, market analysis
"""
import httpx
import os
import json
from datetime import datetime

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

async def generate_swot_analysis(company, sector, financials, ratios, secondary_research, triangulation):
    """
    Generate SWOT analysis using LLM asynchronously
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

    if not GROQ_API_KEY:
        print("[ERROR] GROQ_API_KEY is not set. Cannot run SWOT analysis.")
        return create_default_swot(company, sector, financials, ratios)

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": MODEL_NAME,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.5,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"}
                },
                timeout=60.0
            )
            
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            
            # Clean markdown formatting if any
            if content.startswith("```"):
                content = re.sub(r'^```[a-z]*\n?', '', content)
                content = re.sub(r'\n?```$', '', content)
                content = content.strip()
                
            return json.loads(content)
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

