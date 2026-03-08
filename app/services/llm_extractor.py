



import os
import json
import requests


def extract_financials(text):
    prompt = f"""
You are a financial analyst. Your ONLY job is to extract the following financial values as NUMBERS from the provided document text:
- revenue
- net_profit
- total_debt
- total_assets
- total_liabilities

STRICT RULES:
- Output ONLY a valid JSON object, with NO explanation, NO markdown, NO extra text.
- If a value is missing, unclear, or not found, set it to 0.
- All values must be numbers (no strings, no commas, no currency symbols).
- Do NOT output anything except the JSON object.

EXAMPLES:
If all values are found:
{{
    "revenue": 1234567,
    "net_profit": 89012,
    "total_debt": 34567,
    "total_assets": 456789,
    "total_liabilities": 12345
}}
If some values are missing:
{{
    "revenue": 0,
    "net_profit": 0,
    "total_debt": 0,
    "total_assets": 456789,
    "total_liabilities": 0
}}

WARNING: If you output anything except the JSON object, your answer will be rejected.

Document:
{text[:6000]}
"""
    # Use Ollama's local API (default model: qwen3:4b)
    data = {
        "model": os.getenv("OLLAMA_MODEL", "qwen3:4b"),
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    response = requests.post("http://localhost:11434/v1/chat/completions", json=data)
    response.raise_for_status()
    result = response.json()["choices"][0]["message"]["content"]
    try:
        return json.loads(result)
    except Exception:
        import re
        match = re.search(r'\{.*\}', result, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError(f"Ollama response not valid JSON: {result}")
