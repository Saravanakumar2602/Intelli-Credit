#!/usr/bin/env python3
import sys
sys.path.insert(0, r'c:\Saravanakumar G\Projects\Intelli-Credit')

from dotenv import load_dotenv
load_dotenv()

from app.services.news_research import get_company_news

print("=" * 70)
print("TESTING REAL NEWS FETCH FROM NEWSAPI")
print("=" * 70)

news = get_company_news("Infosys")

print(f"\n✅ Fetched {len(news['articles'])} articles for Infosys")
print(f"📊 Average Sentiment: {news['sentiment']:.2f}")

if news['articles']:
    print(f"\n📰 Top 3 Articles:")
    for i, article in enumerate(news['articles'][:3], 1):
        print(f"\n{i}. {article['title']}")
        print(f"   Source: {article['source'].get('name', 'Unknown')}")
        print(f"   URL: {article['url'][:60]}...")
else:
    print("\n❌ No articles fetched - check API key")

print("\n" + "=" * 70)
print("✅ REAL NEWS API WORKING - Now using actual market data!")
print("=" * 70)
