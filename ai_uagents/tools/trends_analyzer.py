"""
Trends Analysis Tool for Research Agent
Uses pytrends (Google Trends) - completely free
"""

from pytrends.request import TrendReq
from typing import List, Dict, Optional
import pandas as pd
from datetime import datetime, timedelta

class TrendsAnalyzer:
    """Google Trends analysis tool"""
    
    def __init__(self):
        # Initialize pytrends
        self.pytrends = TrendReq(hl='en-US', tz=360)
    
    def get_interest_over_time(self, keywords: List[str], timeframe: str = 'today 12-m') -> Dict:
        """
        Get interest over time for keywords
        
        Args:
            keywords: List of keywords to analyze (max 5)
            timeframe: Time period (e.g., 'today 12-m', 'today 3-m', 'now 7-d')
            
        Returns:
            Dictionary with trend data
        """
        try:
            # Limit to 5 keywords (Google Trends limitation)
            keywords = keywords[:5]
            
            self.pytrends.build_payload(keywords, timeframe=timeframe)
            interest_over_time_df = self.pytrends.interest_over_time()
            
            if interest_over_time_df.empty:
                return {
                    'status': 'no_data',
                    'message': 'No data available for these keywords'
                }
            
            # Drop 'isPartial' column if exists
            if 'isPartial' in interest_over_time_df.columns:
                interest_over_time_df = interest_over_time_df.drop(columns=['isPartial'])
            
            # Convert to dict format
            trends_data = {}
            for keyword in keywords:
                if keyword in interest_over_time_df.columns:
                    trends_data[keyword] = {
                        'current_value': int(interest_over_time_df[keyword].iloc[-1]),
                        'average': float(interest_over_time_df[keyword].mean()),
                        'max': int(interest_over_time_df[keyword].max()),
                        'min': int(interest_over_time_df[keyword].min()),
                        'trend': 'rising' if interest_over_time_df[keyword].iloc[-1] > interest_over_time_df[keyword].mean() else 'falling'
                    }
            
            return {
                'status': 'success',
                'keywords': keywords,
                'timeframe': timeframe,
                'trends': trends_data
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def get_related_queries(self, keyword: str) -> Dict:
        """
        Get related queries for a keyword
        
        Args:
            keyword: Keyword to analyze
            
        Returns:
            Dictionary with related queries
        """
        try:
            self.pytrends.build_payload([keyword])
            related_queries = self.pytrends.related_queries()
            
            result = {
                'status': 'success',
                'keyword': keyword,
                'rising': [],
                'top': []
            }
            
            if keyword in related_queries:
                # Rising queries
                if related_queries[keyword]['rising'] is not None:
                    rising_df = related_queries[keyword]['rising']
                    result['rising'] = rising_df.head(10).to_dict('records') if not rising_df.empty else []
                
                # Top queries
                if related_queries[keyword]['top'] is not None:
                    top_df = related_queries[keyword]['top']
                    result['top'] = top_df.head(10).to_dict('records') if not top_df.empty else []
            
            return result
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def get_trending_searches(self, country: str = 'united_states') -> Dict:
        """
        Get current trending searches
        
        Args:
            country: Country code (e.g., 'united_states', 'united_kingdom')
            
        Returns:
            Dictionary with trending searches
        """
        try:
            trending_df = self.pytrends.trending_searches(pn=country)
            
            if trending_df.empty:
                return {
                    'status': 'no_data',
                    'message': f'No trending data for {country}'
                }
            
            return {
                'status': 'success',
                'country': country,
                'trending': trending_df[0].head(20).tolist()
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def get_regional_interest(self, keyword: str) -> Dict:
        """
        Get interest by region for a keyword
        
        Args:
            keyword: Keyword to analyze
            
        Returns:
            Dictionary with regional interest data
        """
        try:
            self.pytrends.build_payload([keyword])
            regional_df = self.pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True)
            
            if regional_df.empty:
                return {
                    'status': 'no_data',
                    'message': 'No regional data available'
                }
            
            # Sort by interest and get top regions
            regional_df = regional_df.sort_values(by=keyword, ascending=False)
            top_regions = regional_df.head(10)
            
            regions = []
            for region, value in top_regions[keyword].items():
                regions.append({
                    'region': region,
                    'interest': int(value)
                })
            
            return {
                'status': 'success',
                'keyword': keyword,
                'top_regions': regions
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
    
    def compare_keywords(self, keywords: List[str], timeframe: str = 'today 3-m') -> Dict:
        """
        Compare multiple keywords
        
        Args:
            keywords: List of keywords to compare (max 5)
            timeframe: Time period
            
        Returns:
            Comparison data
        """
        try:
            keywords = keywords[:5]
            self.pytrends.build_payload(keywords, timeframe=timeframe)
            interest_df = self.pytrends.interest_over_time()
            
            if interest_df.empty:
                return {
                    'status': 'no_data',
                    'message': 'No data for comparison'
                }
            
            # Drop 'isPartial' column if exists
            if 'isPartial' in interest_df.columns:
                interest_df = interest_df.drop(columns=['isPartial'])
            
            comparison = {}
            for keyword in keywords:
                if keyword in interest_df.columns:
                    avg = float(interest_df[keyword].mean())
                    comparison[keyword] = {
                        'average_interest': avg,
                        'current': int(interest_df[keyword].iloc[-1]),
                        'peak': int(interest_df[keyword].max())
                    }
            
            # Rank by average interest
            ranked = sorted(comparison.items(), key=lambda x: x[1]['average_interest'], reverse=True)
            
            return {
                'status': 'success',
                'keywords': keywords,
                'timeframe': timeframe,
                'comparison': dict(ranked),
                'winner': ranked[0][0] if ranked else None
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e)
            }
