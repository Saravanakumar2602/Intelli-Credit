import os
import json
import requests
import re

def extract_financials(text):
    """Extract financial data from text using Ollama with enhanced extraction logic"""
    print(f"[DEBUG] PDF TEXT LENGTH: {len(text)}")
    print(f"[DEBUG] FIRST 1000 CHARS:\n{text[:1000]}")
    
    # First try regex extraction for common patterns
    extracted = _regex_extract_financials(text)
    print(f"[DEBUG] Regex extraction result: {extracted}")
    
    if extracted and any(extracted.values()):
        print("[DEBUG] ✓ Successfully extracted via regex patterns")
        return extracted
    
    # If regex fails (all zeros), use LLM
    print("[DEBUG] ⚠ Regex extraction all zeros, falling back to LLM")
    limited_text = text[:4000]  # Increased limit for better context
    print("[DEBUG] Extracted PDF text (first 500 chars):\n", limited_text[:500])
    print(f"[DEBUG] Total extracted text length: {len(text)} (sending {len(limited_text)} chars to LLM)")
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    print(f"[DEBUG] Using Groq model: {model}")
    
    if not groq_api_key:
        print("[ERROR] GROQ_API_KEY is not set. Cannot run LLM extraction. Returning default values.")
        return {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0, "current_assets": 0, "current_liabilities": 0}
    
    prompt = f"""You are a financial extraction expert. Extract EXACT numerical values from this document.

FIND AND EXTRACT:
1. REVENUE - Look for: "Revenue from Operations", "Total Revenue", "Sales", "Net Sales"
2. NET PROFIT - Look for: "Net Profit", "Net Income", "Bottom Line", "PAT"
3. TOTAL DEBT - Look for: "Total Debt", "Total Borrowing", "Total Outstanding Debt"
4. TOTAL ASSETS - Look for: "Total Assets", "TOTAL ASSETS"
5. TOTAL LIABILITIES - Look for: "Total Liabilities", "TOTAL LIABILITIES"
6. CURRENT ASSETS - Look for: "Current Assets"
7. CURRENT LIABILITIES - Look for: "Current Liabilities"

CRITICAL RULES:
- Extract numbers exactly as they appear in the document
- Numbers may be in Lakhs (L), Crores (C), or thousands
- Numbers may have commas or spaces as separators
- Multiply by 1 if in base units, by 100000 if in Lakhs, by 10000000 if in Crores
- ALWAYS output valid JSON with 7 keys: revenue, net_profit, total_debt, total_assets, total_liabilities, current_assets, current_liabilities
- ALL values MUST be numbers (integers), no strings or text
- If you cannot find a value, set it to 0
- Output NOTHING except the JSON object

DOCUMENT TEXT:
{limited_text}

RESPOND WITH ONLY THIS JSON FORMAT:
{{"revenue": NUMBER, "net_profit": NUMBER, "total_debt": NUMBER, "total_assets": NUMBER, "total_liabilities": NUMBER, "current_assets": NUMBER, "current_liabilities": NUMBER}}
"""
    
    try:
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1  # Low temperature for consistent extraction
        }
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=90)
        response.raise_for_status()
        result = response.json()["choices"][0]["message"]["content"]
        print("[DEBUG] LLM Output:\n", result)

        # Clean up common LLM output issues
        result = result.strip()
        # Remove markdown code block if present
        if result.startswith("```"):
            result = re.sub(r'^```[a-z]*\n?', '', result)
            result = re.sub(r'\n?```$', '', result)
        
        # Try to parse JSON
        try:
            parsed = json.loads(result)
            # Ensure all values are integers
            for key in ["revenue", "net_profit", "total_debt", "total_assets", "total_liabilities", "current_assets", "current_liabilities"]:
                if key in parsed:
                    parsed[key] = int(float(str(parsed[key]).replace(",", "")))
                else:
                    parsed[key] = 0
            return parsed
        except Exception as e:
            # Try to find JSON in the result
            match = re.search(r'\{[^{}]*"revenue"[^{}]*\}', result, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                    for key in ["revenue", "net_profit", "total_debt", "total_assets", "total_liabilities", "current_assets", "current_liabilities"]:
                        if key in parsed:
                            parsed[key] = int(float(str(parsed[key]).replace(",", "")))
                        else:
                            parsed[key] = 0
                    return parsed
                except Exception:
                    pass
            
            print(f"[ERROR] Could not parse LLM output as JSON: {result}")
            # Return zeros instead of error
            return {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0, "current_assets": 0, "current_liabilities": 0}
    except requests.Timeout:
        print("[ERROR] LLM extraction timed out.")
        return {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0, "current_assets": 0, "current_liabilities": 0}
    except requests.RequestException as e:
        print(f"[ERROR] LLM extraction failed: {e}")
        return {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0, "current_assets": 0, "current_liabilities": 0}
    except Exception as e:
        print(f"[ERROR] Unexpected error in LLM extraction: {e}")
        return {"revenue": 0, "net_profit": 0, "total_debt": 0, "total_assets": 0, "total_liabilities": 0, "current_assets": 0, "current_liabilities": 0}

def _regex_extract_financials(text):
    """Extract financials using regex patterns for common formats"""
    extracted = {
        "revenue": 0, 
        "net_profit": 0, 
        "total_debt": 0, 
        "total_assets": 0, 
        "total_liabilities": 0,
        "current_assets": 0,
        "current_liabilities": 0
    }
    
    # Pattern to find financial values (handles formats like "15,000" or "15000" followed by optional "Lakhs" or "L")
    patterns = {
        "revenue": [
            r"(?:Revenue from Operations|Revenue|Total Revenue|Net Sales|Sales)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"Revenue\s*:\s*([\d,]+)",
            r"REVENUE\s+([\d,]+)"
        ],
        "net_profit": [
            r"NET PROFIT FOR THE YEAR\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"(?:Net Income|Bottom Line|PAT)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"NET PROFIT\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"Net Profit\s*:\s*([\d,]+)"
        ],
        "total_debt": [
            r"(?:Total Debt|Total Outstanding Debt|Total Borrowing)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"TOTAL.*DEBT\s+([\d,]+)",
            r"Total Debt\s*:\s*([\d,]+)"
        ],
        "total_assets": [
            r"(?:TOTAL ASSETS|Total Assets)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"TOTAL ASSETS\s+([\d,]+)",
            r"Total Assets\s*:\s*([\d,]+)"
        ],
        "total_liabilities": [
            r"(?:TOTAL LIABILITIES|Total Liabilities)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"TOTAL LIABILITIES\s+([\d,]+)",
            r"Total Liabilities\s*:\s*([\d,]+)"
        ],
        "current_assets": [
            r"(?:CURRENT ASSETS|Current Assets)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"Current Assets\s*:\s*([\d,]+)"
        ],
        "current_liabilities": [
            r"(?:CURRENT LIABILITIES|Current Liabilities)\s*[:\-]?\s*[₹$]?\s*([\d,]+(?:\.\d+)?)\s*(?:Lakhs?|L|Cr)?",
            r"Current Liabilities\s*:\s*([\d,]+)"
        ]
    }
    
    for key, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    value = match.group(1).replace(",", "").replace(" ", "")
                    extracted[key] = int(float(value))
                    print(f"[DEBUG] Regex found {key}: {extracted[key]}")
                    break
                except (ValueError, AttributeError):
                    continue
    
    return extracted

def generate_risk_summary(financials, ratios, news):
    """Generate risk assessment summary using LLM"""
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    if not groq_api_key:
        print("[ERROR] GROQ_API_KEY is not set. Cannot run risk summary generation.")
        return "GROQ_API_KEY is not set. Risk summary cannot be generated."

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
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=data, timeout=90)
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
    except requests.RequestException as e:
        print(f"[ERROR] Risk summary generation failed: {e}")
        return f"Risk summary generation failed: {str(e)}"
    except Exception as e:
        print(f"[ERROR] Unexpected error in risk summary generation: {e}")
        return f"Unexpected error in risk summary generation: {str(e)}"
