import os
import json
import requests
import re

def extract_financials(text):
    """Extract financial data from text using Ollama"""
    print("[DEBUG] Extracted PDF text (first 500 chars):\n", text[:500])
    model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
    print(f"[DEBUG] Using Ollama model: {model}")
    
    prompt = f"""
    You are a financial analyst AI. Extract the following financial values as NUMBERS ONLY from the provided document text:
    - revenue
    - net_profit
    - total_debt
    - total_assets
    - total_liabilities

    INSTRUCTIONS:
    - Search for numbers in all possible formats (digits, words, with or without commas, currency symbols, etc.).
    - If a value is missing, unclear, or not found, set it to 0.
    - Output ONLY a valid JSON object, with NO explanation, NO markdown, NO extra text.
    - All values must be numbers (no strings, no commas, no currency symbols in the output).
    - Do NOT output anything except the JSON object.

    EXAMPLES:
    If all values are found:
    {{"revenue": 1234567, "net_profit": 89012, "total_debt": 34567, "total_assets": 456789, "total_liabilities": 12345}}
    If some values are missing:
    {{"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 456789, "total_liabilities": 0}}

    WARNING: If you output anything except the JSON object, your answer will be rejected.

    Document:
    {text[:12000]}
    """
    
    try:
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post("http://localhost:11434/v1/chat/completions", json=data, timeout=30)
        response.raise_for_status()
        result = response.json()["choices"][0]["message"]["content"]
        print("[DEBUG] LLM Output:\n", result)

        # Clean up common LLM output issues
        result = result.strip()
        # Remove markdown code block if present
        if result.startswith("```json"):
            result = result.lstrip("`json").strip('`\n ')
        # Try to parse JSON
        try:
            return json.loads(result)
        except Exception:
            match = re.search(r'\{.*\}', result, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except Exception:
                    pass
            print(f"[ERROR] Could not parse LLM output as JSON: {result}")
            raise ValueError(f"Invalid JSON: {result}")
    except requests.Timeout:
        print("[ERROR] LLM extraction timed out.")
        raise
    except Exception as e:
        print(f"[ERROR] LLM extraction failed: {e}")
        return {
            "revenue": 0,
            "net_profit": 0,
            "total_debt": 0,
            "total_assets": 0,
            "total_liabilities": 0
        }

def generate_risk_summary(financials, ratios, news):
    """Generate risk assessment summary using LLM"""
    model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
    prompt = f"""
    You are a senior credit risk analyst AI. Given the following company financials, key ratios, and news sentiment, write a concise risk assessment summary (3-5 sentences) highlighting:
    - The company's financial strengths and weaknesses
    - Any red flags or positive indicators
    - The overall risk profile and rationale
    - Mention news sentiment if relevant

    FINANCIALS:
    {json.dumps(financials, indent=2)}

    RATIOS:
    {json.dumps(ratios, indent=2)}

    NEWS SENTIMENT:
    {json.dumps(news, indent=2)}

    Output ONLY the summary text. Do NOT include any explanations, markdown, or extra formatting.
    """
    
    try:
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post("http://localhost:11434/v1/chat/completions", json=data, timeout=30)
        response.raise_for_status()
        result = response.json()["choices"][0]["message"]["content"]
        print("[DEBUG] Risk Summary:\n", result)
        # Clean up common LLM output issues
        result = result.strip()
        if result.startswith("```"):
            result = result.lstrip("`json").strip('`\n ')
        return result
    except requests.Timeout:
        print("[ERROR] Risk summary generation timed out.")
        return "Risk summary generation timed out."
    except Exception as e:
        print(f"[ERROR] Risk summary generation failed: {e}")
        return "Unable to generate risk summary at this time."
