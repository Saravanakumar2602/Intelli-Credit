import os
import json
import httpx
import re
from typing import Type, TypeVar, Optional, Dict
from pydantic import BaseModel, ValidationError
from backend.core.config import settings

T = TypeVar("T", bound=BaseModel)

def clean_json_string(text: str) -> str:
    """Strip markdown code block tags and clean up string surrounding JSON"""
    text = text.strip()
    # Strip ```json ... ``` or ``` ... ```
    if text.startswith("```"):
        text = re.sub(r'^```[a-z]*\n?', '', text)
        text = re.sub(r'\n?```$', '', text)
    text = text.strip()
    return text

def repair_json_simple(text: str) -> str:
    """Simple regex attempts to repair trailing commas or missing closing braces"""
    # Remove trailing commas inside lists/objects
    text = re.sub(r',\s*([\]}])', r'\1', text)
    return text

async def call_llm_with_validation(
    prompt: str,
    response_schema: Type[T],
    system_prompt: str = "You are a financial expert. Respond ONLY with a valid JSON object.",
    temperature: float = 0.0,
    max_retries: int = 3
) -> T:
    """
    Call the LLM (Groq API) and validate its output against a Pydantic schema.
    Retries up to `max_retries` times on failure to parse or validate, feeding
    the parser errors back to the model for correction.
    """
    model = settings.GROQ_MODEL
    api_key = settings.GROQ_API_KEY
    
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    current_prompt = prompt
    last_error = ""

    for attempt in range(max_retries):
        if last_error:
            # Append error feedback to prompt for self-correction
            current_prompt = f"""{prompt}
            
            WARNING: Your previous attempt failed validation with error: {last_error}
            Please correct the JSON format and structure to comply exactly with the required schema.
            """
            
        data = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": current_prompt}
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=data,
                    timeout=45.0
                )
                response.raise_for_status()
                
            content = response.json()["choices"][0]["message"]["content"]
            cleaned = clean_json_string(content)
            
            try:
                parsed_json = json.loads(cleaned)
            except json.JSONDecodeError as je:
                # Try simple repair
                repaired = repair_json_simple(cleaned)
                try:
                    parsed_json = json.loads(repaired)
                except json.JSONDecodeError:
                    last_error = f"JSON parsing failed: {str(je)}"
                    continue
            
            # Validate with Pydantic
            try:
                validated_model = response_schema.model_validate(parsed_json)
                
                # Log prompt history
                from backend.database.connection import SessionLocal
                from backend.models.prompt_history import PromptHistory
                db = SessionLocal()
                try:
                    db_hist = PromptHistory(
                        agent_name=response_schema.__name__,
                        model_name=model,
                        prompt_text=current_prompt[:5000],
                        response_text=json.dumps(parsed_json)[:5000],
                        latency_ms=0.0
                    )
                    db.add(db_hist)
                    db.commit()
                except Exception:
                    pass
                finally:
                    db.close()
                    
                return validated_model
            except ValidationError as ve:
                last_error = f"Pydantic Validation failed: {str(ve)}"
                continue
                
        except Exception as e:
            last_error = f"API network or parse failure: {str(e)}"
            continue
            
    # If all retries failed, raise exception
    raise ValueError(f"Failed to obtain valid structured response for schema {response_schema.__name__}. Last Error: {last_error}")
