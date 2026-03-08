


import os
import json
import google.generativeai as genai

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

def extract_financials(text):
    prompt = f"""
    Extract financial values from this document.
    Return JSON format:
    revenue
    net_profit
    total_debt
    total_assets
    total_liabilities
    Document:
    {text[:6000]}
    """
    model = genai.GenerativeModel('models/gemini-pro-latest')
    response = model.generate_content(prompt)
    result = response.text
    try:
        return json.loads(result)
    except Exception:
        # If Gemini returns non-JSON, try to extract JSON substring
        import re
        match = re.search(r'\{.*\}', result, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError(f"Gemini response not valid JSON: {result}")
