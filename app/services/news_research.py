import os
import requests
from textblob import TextBlob

NEWS_API = os.getenv("NEWS_API_KEY", "")


def get_company_news(company):
    # If no API key configured, return neutral news signal
    if not NEWS_API:
        return {"sentiment": 0, "articles": []}

    url = f"https://newsapi.org/v2/everything?q={company}&apiKey={NEWS_API}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        articles = response.json().get("articles", [])[:5]
    except Exception:
        # On any network/API error, fall back to neutral
        return {"sentiment": 0, "articles": []}

    sentiments = []
    for a in articles:
        title = a.get("title") or ""
        if title:
            score = TextBlob(title).sentiment.polarity
            sentiments.append(score)

    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

    return {
        "sentiment": avg_sentiment,
        "articles": [a.get("title", "") for a in articles]
    }
