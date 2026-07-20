import os
import json
import httpx
import re

def get_smart_summary_context(text, max_chars=18000):
    """Filter and rank paragraphs/pages in a document by relevance to financial metrics"""
    if len(text) <= max_chars:
        return text
    
    # Split by paragraph/page separator
    chunks = text.split("\n\n")
    if len(chunks) <= 1:
        chunks = text.split("\n")
        
    keywords = [
        "balance sheet", "income statement", "profit and loss", "profit & loss",
        "total revenue", "net profit", "total debt", "total assets", "total liabilities",
        "current assets", "current liabilities", "borrowing", "shareholding", "portfolio",
        "cash flow", "equity", "pat", "ebitda", "operating income", "sales"
    ]
    
    chunk_scores = []
    for chunk in chunks:
        score = 0
        chunk_lower = chunk.lower()
        
        # Word matches count
        for kw in keywords:
            score += chunk_lower.count(kw) * 8
            
        # Number density (financial statements contain mostly numbers)
        numbers = len(re.findall(r'\b\d+[\d,.]*\b', chunk))
        score += numbers * 1.5
        
        chunk_scores.append((score, chunk))
        
    # Sort by relevance score desc
    chunk_scores.sort(key=lambda x: x[0], reverse=True)
    
    selected_chunks = []
    current_len = 0
    for score, chunk in chunk_scores:
        if current_len + len(chunk) + 2 > max_chars:
            # If we don't have enough content yet, take a prefix of the next best chunk
            if current_len < max_chars // 2:
                selected_chunks.append(chunk[:max_chars - current_len])
            break
        selected_chunks.append(chunk)
        current_len += len(chunk) + 2
        
    return "\n\n".join(selected_chunks)

async def extract_financials(text, custom_schema=None):
    """Extract financial metrics asynchronously using Groq API with dynamic schema support"""
    print(f"[DEBUG] PDF TEXT LENGTH: {len(text)}")
    
    # Define schema fields
    if custom_schema:
        fields = {item["name"]: item["type"] for item in custom_schema}
    else:
        fields = {
            "revenue": "number",
            "net_profit": "number",
            "total_debt": "number",
            "total_assets": "number",
            "total_liabilities": "number",
            "current_assets": "number",
            "current_liabilities": "number"
        }
        
    # Standard format default dict
    default_values = {}
    for name, dtype in fields.items():
        if dtype == "number":
            default_values[name] = 0
        elif dtype == "date":
            default_values[name] = ""
        else:
            default_values[name] = ""

    # Smart filtering for context
    smart_text = get_smart_summary_context(text, max_chars=18000)
    print(f"[DEBUG] Smart chunking reduced text to {len(smart_text)} chars")
    
    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    
    if not groq_api_key:
        print("[ERROR] GROQ_API_KEY is not set. Cannot run LLM extraction. Returning fallback values.")
        # Attempt fallback for default schema using regex
        if not custom_schema:
            return _regex_extract_financials(text)
        return default_values
        
    schema_desc = "\n".join([f"- {name} ({dtype})" for name, dtype in fields.items()])
    
    prompt = f"""You are a financial extraction expert. Extract the following fields from the financial document text:
{schema_desc}

CRITICAL RULES:
1. Extract numerical values exactly as they appear in the document.
2. Scale the values to base units:
   - If the document specifies values are in "Lakhs" or "L", multiply by 100,000.
   - If in "Crores" or "Cr", multiply by 10,000,000.
   - If in "Millions" or "M", multiply by 1,000,000.
   - If in "Thousands" or "K", multiply by 1,000.
3. Output a valid JSON object containing exactly the requested keys: {list(fields.keys())}.
4. All value types must match the requested schema (e.g., numbers for 'number', strings for 'string').
5. If a field is not found in the text, return 0 for number fields and "" for string fields. Do not make up numbers.
6. Output ONLY the raw JSON object. Do not wrap it in markdown formatting or add any conversational text.

DOCUMENT TEXT:
{smart_text}

RESPOND WITH ONLY THIS JSON FORMAT:
{json.dumps(default_values)}
"""
    
    try:
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0,
            "response_format": {"type": "json_object"}
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()
            
        result = response.json()["choices"][0]["message"]["content"].strip()
        print(f"[DEBUG] LLM raw response: {result}")
        
        # Clean markdown wrappers if any
        if result.startswith("```"):
            result = re.sub(r'^```[a-z]*\n?', '', result)
            result = re.sub(r'\n?```$', '', result)
            result = result.strip()
            
        parsed = json.loads(result)
        
        # Enforce schemas & types
        sanitized = {}
        for name, dtype in fields.items():
            val = parsed.get(name, default_values[name])
            if dtype == "number":
                try:
                    # Clean punctuation
                    if isinstance(val, str):
                        val = val.replace(",", "").replace(" ", "")
                    sanitized[name] = int(float(val))
                except (ValueError, TypeError):
                    sanitized[name] = 0
            else:
                sanitized[name] = str(val)
                
        return sanitized
        
    except Exception as e:
        print(f"[ERROR] LLM extraction failed: {e}. Falling back to regex.")
        if not custom_schema:
            return _regex_extract_financials(text)
        return default_values

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
                    # Match standard unit keywords for scaling in regex too
                    scale = 1
                    snippet = text[max(0, match.start() - 100):min(len(text), match.end() + 100)].lower()
                    if "crore" in snippet or "cr" in snippet:
                        scale = 10000000
                    elif "lakh" in snippet or " l " in snippet or "lakhs" in snippet:
                        scale = 100000
                        
                    extracted[key] = int(float(value) * scale)
                    print(f"[DEBUG] Regex fallback found {key}: {extracted[key]}")
                    break
                except (ValueError, AttributeError):
                    continue
                    
    return extracted

async def generate_risk_summary(financials, ratios, news):
    """Generate risk assessment summary asynchronously using Groq LLM"""
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

    Output ONLY the summary text. Do NOT include any explanations, markdown wrappers, or extra formatting.
    """
    
    try:
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=60.0
            )
            response.raise_for_status()
            
        result = response.json()["choices"][0]["message"]["content"].strip()
        
        if result.startswith("```"):
            result = result.lstrip("`json").strip('`\n ')
            
        return result
        
    except Exception as e:
        print(f"[ERROR] Risk summary generation failed: {e}")
        return f"Risk summary generation failed: {str(e)}"

