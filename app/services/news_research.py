import requests
from textblob import TextBlob

NEWS_API = "YOUR_NEWSAPI_KEY"

def get_company_news(company):
    url = f"https://newsapi.org/v2/everything?q={company}&apiKey={NEWS_API}"
    response = requests.get(url)
    articles = response.json().get("articles", [])[:5]
    sentiments = []
    for a in articles:
        text = a["title"]
        score = TextBlob(text).sentiment.polarity
        sentiments.append(score)
    avg_sentiment = sum(sentiments)/len(sentiments) if sentiments else 0
    return {
        "sentiment": avg_sentiment,
        "articles": [a["title"] for a in articles]
    }
