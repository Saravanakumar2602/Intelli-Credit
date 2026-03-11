#!/usr/bin/env python3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if NEWS_API_KEY is loaded
news_api_key = os.getenv("NEWS_API_KEY", "NOT SET")
ollama_model = os.getenv("OLLAMA_MODEL", "NOT SET")

print("=" * 60)
print("ENVIRONMENT VARIABLES CHECK")
print("=" * 60)
print(f"NEWS_API_KEY: {news_api_key[:20]}..." if news_api_key != "NOT SET" else f"NEWS_API_KEY: {news_api_key}")
print(f"OLLAMA_MODEL: {ollama_model}")
print("=" * 60)

if news_api_key != "NOT SET" and news_api_key != "":
    print("✅ NEWS_API_KEY is configured!")
    print("✅ The application will now fetch REAL news from NewsAPI instead of synthetic data")
else:
    print("❌ NEWS_API_KEY not found")

print("\nNext: Start the backend and frontend servers to test the full application!")
