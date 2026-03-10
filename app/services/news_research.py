import os
import requests
from textblob import TextBlob

NEWS_API = os.getenv("NEWS_API_KEY", "")

def get_company_news(company):
    if not NEWS_API:
        return {"sentiment": 0, "articles": []}

    url = f"https://newsapi.org/v2/everything?q={company}&apiKey={NEWS_API}"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        articles = response.json().get("articles", [])[:5]
    except Exception:
        return {"sentiment": 0, "articles": []}

    sentiments = []
    processed_articles = []
    
    for article in articles:
        title = article.get("title") or ""
        if title:
            score = TextBlob(title).sentiment.polarity
            sentiments.append(score)
            processed_articles.append({
                "title": title,
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "source": article.get("source", {}),
                "publishedAt": article.get("publishedAt", "")
            })

    avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0

    return {
        "sentiment": avg_sentiment,
        "articles": processed_articles
    }
