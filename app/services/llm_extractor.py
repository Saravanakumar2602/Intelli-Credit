
import os
import openai
import json

openai.api_key = os.getenv("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")

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
