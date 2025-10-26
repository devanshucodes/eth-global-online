"""
Test the Enhanced Research Agent Tools
Shows real agentic capabilities
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.web_scraper import WebScraper
from tools.trends_analyzer import TrendsAnalyzer
from tools.search_tool import SearchTool
import json

def test_search_tool():
    """Test DuckDuckGo search"""
    print("\n" + "="*60)
    print("🔍 TESTING SEARCH TOOL (DuckDuckGo)")
    print("="*60)
    
    search = SearchTool()
    
    # Test competitor search
    print("\n1. Searching for AI Fitness App competitors...")
    results = search.search_competitors("fitness", "AI workout app")
    print(f"   Found {len(results)} results")
    for i, result in enumerate(results[:3], 1):
        print(f"   {i}. {result['title'][:60]}...")
        print(f"      URL: {result['url'][:70]}")
    
    # Test news search
    print("\n2. Searching for fitness tech news...")
    news = search.search_news("AI fitness technology", max_results=5)
    print(f"   Found {len(news)} news articles")
    for i, article in enumerate(news[:3], 1):
        print(f"   {i}. {article['title'][:60]}...")
        print(f"      Date: {article.get('date', 'N/A')}")

def test_trends_analyzer():
    """Test Google Trends"""
    print("\n" + "="*60)
    print("📈 TESTING TRENDS ANALYZER (Google Trends)")
    print("="*60)
    
    trends = TrendsAnalyzer()
    
    # Test interest over time
    print("\n1. Analyzing 'AI fitness' trends over 12 months...")
    interest = trends.get_interest_over_time(['AI fitness', 'workout app'], timeframe='today 12-m')
    if interest['status'] == 'success':
        print(f"   Status: ✅ {interest['status']}")
        for keyword, data in interest['trends'].items():
            print(f"   {keyword}:")
            print(f"     - Current: {data['current_value']}")
            print(f"     - Average: {data['average']:.1f}")
            print(f"     - Trend: {data['trend']}")
    else:
        print(f"   Status: {interest['status']}")
    
    # Test related queries
    print("\n2. Getting related queries for 'fitness app'...")
    related = trends.get_related_queries('fitness app')
    if related['status'] == 'success':
        print(f"   Status: ✅ {related['status']}")
        if related['rising']:
            print(f"   Rising queries ({len(related['rising'])}):")
            for q in related['rising'][:3]:
                print(f"     - {q.get('query', 'N/A')}")
        if related['top']:
            print(f"   Top queries ({len(related['top'])}):")
            for q in related['top'][:3]:
                print(f"     - {q.get('query', 'N/A')}")

def test_web_scraper():
    """Test web scraping"""
    print("\n" + "="*60)
    print("🌐 TESTING WEB SCRAPER (BeautifulSoup4)")
    print("="*60)
    
    scraper = WebScraper()
    
    # Test scraping a known URL
    print("\n1. Scraping example.com...")
    result = scraper.scrape_url('https://example.com')
    if result['status'] == 'success':
        print(f"   Status: ✅ {result['status']}")
        print(f"   Title: {result['title']}")
        print(f"   Description: {result['description'][:100]}..." if result['description'] else "   No description")
        print(f"   Text length: {len(result['text'])} characters")
        print(f"   Links found: {len(result['links'])}")
    else:
        print(f"   Status: ❌ {result['status']}")
        print(f"   Error: {result.get('error', 'Unknown')}")

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🧪 TESTING AGENTIC TOOLS FOR RESEARCH AGENT")
    print("="*60)
    print("These are REAL tools that make the agent truly agentic!")
    print("="*60)
    
    try:
        test_search_tool()
    except Exception as e:
        print(f"\n❌ Search Tool Error: {e}")
    
    try:
        test_trends_analyzer()
    except Exception as e:
        print(f"\n❌ Trends Analyzer Error: {e}")
    
    try:
        test_web_scraper()
    except Exception as e:
        print(f"\n❌ Web Scraper Error: {e}")
    
    print("\n" + "="*60)
    print("✅ TOOL TESTING COMPLETE")
    print("="*60)
    print("\nThese tools give the Research Agent real capabilities:")
    print("  • Live web search (not just LLM knowledge)")
    print("  • Real Google Trends data")
    print("  • Actual news articles")
    print("  • Web scraping for competitor analysis")
    print("\nThis is what makes it AGENTIC, not just an LLM wrapper!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
