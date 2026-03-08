import openai
import json

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
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role":"user","content":prompt}]
    )
    result = response.choices[0].message.content
    return json.loads(result)
