"""
Comprehensive Secondary Research Service
Scrapes news, sentiment, market trends from multiple sources
"""
import os
import requests
from textblob import TextBlob
from datetime import datetime, timedelta
import re

NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
REDDIT_API = os.getenv("REDDIT_API_KEY", "")

def analyze_sentiment(text):
    """Analyze sentiment of text using TextBlob"""
    if not text:
        return {"score": 0, "label": "neutral"}
    
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"
    
    return {"score": polarity, "label": label}

def get_news_api_articles(company, category=None):
    """Fetch articles from NewsAPI"""
    if not NEWS_API_KEY:
        return []
    
    try:
        query = f"{company}"
        if category:
            query += f" {category}"
        
        url = f"https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "apiKey": NEWS_API_KEY,
            "sortBy": "publishedAt",
            "language": "en",
            "pageSize": 10
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        articles = response.json().get("articles", [])
        processed = []
        
        for article in articles:
            sentiment = analyze_sentiment(article.get("title", ""))
            processed.append({
                "title": article.get("title", ""),
                "description": article.get("description", ""),
                "url": article.get("url", ""),
                "source": article.get("source", {}).get("name", ""),
                "published_at": article.get("publishedAt", ""),
                "sentiment": sentiment,
                "category": category or "general"
            })
        
        return processed
    except Exception as e:
        print(f"NewsAPI error: {e}")
        return []

def get_regulatory_news(company):
    """Fetch regulatory and compliance related news"""
    regulatory_keywords = [
        "RBI", "SEBI", "regulatory", "compliance", "audit",
        "credit rating", "default", "fraud", "investigation"
    ]
    
    articles = []
    for keyword in regulatory_keywords:
        articles.extend(get_news_api_articles(company, keyword))
    
    return articles[:15]

def get_market_news(company):
    """Fetch market and financial news"""
    market_keywords = [
        "stock", "earnings", "revenue", "market cap",
        "IPO", "acquisition", "merger", "expansion"
    ]
    
    articles = []
    for keyword in market_keywords:
        articles.extend(get_news_api_articles(company, keyword))
    
    return articles[:15]

def get_competitive_news(company, sector=None):
    """Fetch competitive landscape news"""
    if sector:
        articles = get_news_api_articles(f"{company} {sector} competitor", "competitive")
    else:
        articles = get_news_api_articles(company, "competitive")
    
    return articles[:10]

def get_industry_trends(sector):
    """Get industry trends and benchmarks"""
    if not sector:
        return {}
    
    try:
        articles = get_news_api_articles(sector, "market trends")
        
        sentiments = [a["sentiment"]["score"] for a in articles]
        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
        
        return {
            "sector": sector,
            "trend_sentiment": avg_sentiment,
            "recent_articles": articles[:5],
            "trend_label": "positive" if avg_sentiment > 0.1 else "negative" if avg_sentiment < -0.1 else "neutral"
        }
    except Exception as e:
        print(f"Industry trends error: {e}")
        return {}

def get_media_mentions(company):
    """Get media coverage frequency and sentiment"""
    try:
        articles = get_news_api_articles(company)
        
        if not articles:
            return {
                "mentions_count": 0,
                "sentiment_score": 0,
                "coverage_level": "low"
            }
        
        sentiments = [a["sentiment"]["score"] for a in articles]
        avg_sentiment = sum(sentiments) / len(sentiments)
        
        coverage_level = "high" if len(articles) >= 10 else "medium" if len(articles) >= 5 else "low"
        
        return {
            "mentions_count": len(articles),
            "sentiment_score": avg_sentiment,
            "coverage_level": coverage_level,
            "top_articles": articles[:3]
        }
    except Exception as e:
        print(f"Media mentions error: {e}")
        return {}

def generate_secondary_research(company, sector=None, financial_data=None):
    """
    Comprehensive secondary research analysis
    Returns: news sentiment, regulatory status, market position, industry trends
    """
    
    research = {
        "company": company,
        "sector": sector,
        "research_date": datetime.now().isoformat(),
        "components": {}
    }
    
    # Get news from different categories
    print(f"Fetching secondary research for {company}...")
    
    regulatory_articles = get_regulatory_news(company)
    market_articles = get_market_news(company)
    competitive_articles = get_competitive_news(company, sector)
    media_mentions = get_media_mentions(company)
    
    research["components"]["regulatory"] = {
        "articles": regulatory_articles,
        "count": len(regulatory_articles),
        "sentiment": sum([a["sentiment"]["score"] for a in regulatory_articles]) / len(regulatory_articles) if regulatory_articles else 0
    }
    
    research["components"]["market"] = {
        "articles": market_articles,
        "count": len(market_articles),
        "sentiment": sum([a["sentiment"]["score"] for a in market_articles]) / len(market_articles) if market_articles else 0
    }
    
    research["components"]["competitive"] = {
        "articles": competitive_articles,
        "count": len(competitive_articles),
        "sentiment": sum([a["sentiment"]["score"] for a in competitive_articles]) / len(competitive_articles) if competitive_articles else 0
    }
    
    research["components"]["media_coverage"] = media_mentions
    
    if sector:
        research["components"]["industry_trends"] = get_industry_trends(sector)
    
    # Overall sentiment calculation
    all_sentiments = (
        [a["sentiment"]["score"] for a in regulatory_articles] +
        [a["sentiment"]["score"] for a in market_articles] +
        [a["sentiment"]["score"] for a in competitive_articles]
    )
    
    overall_sentiment = sum(all_sentiments) / len(all_sentiments) if all_sentiments else 0
    
    research["overall_sentiment"] = {
        "score": overall_sentiment,
        "label": "positive" if overall_sentiment > 0.1 else "negative" if overall_sentiment < -0.1 else "neutral"
    }
    
    # Risk flags from secondary research
    risk_flags = []
    
    if research["components"]["regulatory"]["sentiment"] < -0.2:
        risk_flags.append("Negative regulatory sentiment detected")
    
    if research["components"]["market"]["sentiment"] < -0.2:
        risk_flags.append("Negative market sentiment detected")
    
    if regulatory_articles:
        for article in regulatory_articles:
            if "default" in article["title"].lower() or "fraud" in article["title"].lower():
                risk_flags.append(f"Alert: {article['title']}")
    
    research["risk_flags"] = risk_flags
    
    return research
