"""
Web Scraping Tool for Research Agent
Uses BeautifulSoup4 and requests for web scraping
"""

import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
import time
import re
from urllib.parse import urlparse

class WebScraper:
    """Web scraping tool for research"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    def scrape_url(self, url: str, timeout: int = 10) -> Dict[str, any]:
        """
        Scrape content from a URL
        
        Args:
            url: URL to scrape
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with scraped data
        """
        try:
            response = self.session.get(url, timeout=timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract text
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)
            
            # Get metadata
            title = soup.find('title')
            title_text = title.string if title else ''
            
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            description = meta_desc['content'] if meta_desc and meta_desc.get('content') else ''
            
            # Get all headings
            headings = [h.get_text().strip() for h in soup.find_all(['h1', 'h2', 'h3'])]
            
            # Get all links
            links = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                if href.startswith('http'):
                    links.append({
                        'url': href,
                        'text': link.get_text().strip()
                    })
            
            return {
                'url': url,
                'title': title_text,
                'description': description,
                'headings': headings[:10],  # Limit to first 10
                'text': text[:5000],  # Limit text length
                'links': links[:20],  # Limit to first 20 links
                'status': 'success'
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'url': url,
                'status': 'error',
                'error': str(e)
            }
        except Exception as e:
            return {
                'url': url,
                'status': 'error',
                'error': f'Parsing error: {str(e)}'
            }
    
    def scrape_multiple(self, urls: List[str], delay: float = 1.0) -> List[Dict]:
        """
        Scrape multiple URLs with delay between requests
        
        Args:
            urls: List of URLs to scrape
            delay: Delay between requests in seconds
            
        Returns:
            List of scraped data dictionaries
        """
        results = []
        for url in urls:
            result = self.scrape_url(url)
            results.append(result)
            if len(urls) > 1:
                time.sleep(delay)  # Be polite to servers
        return results
    
    def extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return list(set(re.findall(email_pattern, text)))
    
    def extract_phone_numbers(self, text: str) -> List[str]:
        """Extract phone numbers from text"""
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        return list(set(re.findall(phone_pattern, text)))
    
    def is_valid_url(self, url: str) -> bool:
        """Check if URL is valid"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
