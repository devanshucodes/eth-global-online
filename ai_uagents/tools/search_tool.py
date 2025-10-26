"""
Search Tool for Research Agent
Uses DuckDuckGo Search (completely free, no API key needed)
"""

from duckduckgo_search import DDGS
from typing import List, Dict, Optional
import time

class SearchTool:
    """Free web search tool using DuckDuckGo"""
    
    def __init__(self):
        self.ddgs = DDGS()
    
    def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search the web using DuckDuckGo
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of search results
        """
        try:
            results = []
            search_results = self.ddgs.text(query, max_results=max_results)
            
            for result in search_results:
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('href', ''),
                    'description': result.get('body', ''),
                    'source': 'duckduckgo'
                })
            
            return results
            
        except Exception as e:
            print(f"Search error: {str(e)}")
            return []
    
    def search_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """
        Search for news articles
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of news results
        """
        try:
            results = []
            news_results = self.ddgs.news(query, max_results=max_results)
            
            for result in news_results:
                results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'description': result.get('body', ''),
                    'date': result.get('date', ''),
                    'source': result.get('source', ''),
                    'type': 'news'
                })
            
            return results
            
        except Exception as e:
            print(f"News search error: {str(e)}")
            return []
    
    def search_competitors(self, industry: str, product_type: str) -> List[Dict]:
        """
        Search for competitors in an industry
        
        Args:
            industry: Industry name
            product_type: Type of product/service
            
        Returns:
            List of competitor information
        """
        queries = [
            f"{product_type} {industry} companies",
            f"top {product_type} platforms",
            f"best {industry} {product_type} alternatives"
        ]
        
        all_results = []
        for query in queries:
            results = self.search(query, max_results=5)
            all_results.extend(results)
            time.sleep(1)  # Be polite
        
        # Remove duplicates by URL
        seen_urls = set()
        unique_results = []
        for result in all_results:
            if result['url'] not in seen_urls:
                seen_urls.add(result['url'])
                unique_results.append(result)
        
        return unique_results[:15]
    
    def search_market_size(self, industry: str, year: int = 2024) -> List[Dict]:
        """
        Search for market size information
        
        Args:
            industry: Industry name
            year: Year for market data
            
        Returns:
            List of market size results
        """
        queries = [
            f"{industry} market size {year}",
            f"{industry} market forecast",
            f"{industry} industry analysis"
        ]
        
        all_results = []
        for query in queries:
            results = self.search(query, max_results=5)
            all_results.extend(results)
            time.sleep(1)
        
        return all_results[:10]
    
    def search_trends(self, topic: str) -> List[Dict]:
        """
        Search for trends and insights
        
        Args:
            topic: Topic to search trends for
            
        Returns:
            List of trend articles
        """
        queries = [
            f"{topic} trends 2024",
            f"{topic} future predictions",
            f"emerging {topic} technologies"
        ]
        
        all_results = []
        for query in queries:
            results = self.search(query, max_results=5)
            all_results.extend(results)
            time.sleep(1)
        
        return all_results[:10]
