



import os
import json
import requests

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
