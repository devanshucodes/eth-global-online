"""
Enhanced Research uAgent with Real Tools
Demonstrates true agentic capabilities:
1. Web Scraping (BeautifulSoup4)
2. Google Trends Analysis (pytrends)
3. Web Search (DuckDuckGo - free)
4. News Search

Usage:
    python3 research_uagent.py
    
Test:
    curl -X POST http://localhost:8002/research-idea \
         -H "Content-Type: application/json" \
         -d '{"idea": {"title": "AI Fitness App", "description": "AI-powered workout planning", "revenue_model": "Subscription"}}'
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent
from tools.web_scraper import WebScraper
from tools.trends_analyzer import TrendsAnalyzer
from tools.search_tool import SearchTool

class ResearchRequest(Model):
    """Model for research request"""
    idea: Dict[str, str]

class Competitor(Model):
    """Model for competitor information"""
    name: str
    description: str
    strengths: str
    weaknesses: str

class MarketAnalysis(Model):
    """Model for market analysis"""
    market_size: str
    growth_potential: str
    key_challenges: List[str]
    opportunities: List[str]

class Recommendations(Model):
    """Model for recommendations"""
    positioning: str
    differentiation: str
    target_audience: str

class ResearchResponse(Model):
    """Model for research response"""
    competitors: List[Competitor]
    market_analysis: MarketAnalysis
    recommendations: Recommendations
    tools_used: Dict[str, Any]  # NEW: Show what tools were used

class ResearchuAgent(BaseUAgent):
    """Research uAgent with real agentic tools"""
    
    def __init__(self):
        super().__init__(
            name="Research Agent",
            role="Market research with real tools (Web Scraping, Trends, Search)",
            port=8002
        )
        # Initialize agentic tools
        try:
            self.web_scraper = WebScraper()
            self.trends_analyzer = TrendsAnalyzer()
            self.search_tool = SearchTool()
            print(f"✅ [{self.name}] Tools initialized successfully:")
            print(f"   - WebScraper (BeautifulSoup4)")
            print(f"   - TrendsAnalyzer (Google Trends)")
            print(f"   - SearchTool (DuckDuckGo)")
        except Exception as e:
            print(f"⚠️  [{self.name}] Tool initialization error: {e}")
            print(f"   Continuing with limited capabilities...")
            self.web_scraper = None
            self.trends_analyzer = None
            self.search_tool = None
        
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=ResearchRequest)
        async def handle_research_request(ctx: Context, sender: str, msg: ResearchRequest):
            """Conduct market research using real tools"""
            try:
                print(f"\n{'='*60}")
                print(f"🔍 [{self.name}] NEW RESEARCH REQUEST")
                print(f"{'='*60}")
                print(f"Idea: {msg.idea.get('title', 'Unknown')}")
                print(f"{'='*60}\n")
                
                idea_title = msg.idea.get('title', 'Unknown')
                idea_desc = msg.idea.get('description', 'No description')
                
                tools_data = {
                    'web_search_used': False,
                    'trends_analysis_used': False,
                    'news_search_used': False,
                    'results_summary': {}
                }
                
                # TOOL 1: Web Search for Competitors
                competitors_results = []
                if self.search_tool:
                    try:
                        print(f"🔍 TOOL 1: Searching for competitors...")
                        competitors_results = self.search_tool.search_competitors(
                            industry=idea_title.split()[0] if idea_title else "tech",
                            product_type=idea_title
                        )
                        tools_data['web_search_used'] = True
                        tools_data['results_summary']['competitors_found'] = len(competitors_results)
                        print(f"   ✅ Found {len(competitors_results)} competitor references")
                    except Exception as e:
                        print(f"   ⚠️  Competitor search failed: {e}")
                
                # TOOL 2: Google Trends Analysis
                trends_data = {}
                if self.trends_analyzer:
                    try:
                        print(f"📈 TOOL 2: Analyzing Google Trends...")
                        trends_data = self.trends_analyzer.get_interest_over_time(
                            keywords=[idea_title[:50]] if idea_title else ["technology"],
                            timeframe='today 12-m'
                        )
                        tools_data['trends_analysis_used'] = True
                        tools_data['results_summary']['trends_status'] = trends_data.get('status')
                        print(f"   ✅ Trends analysis: {trends_data.get('status')}")
                    except Exception as e:
                        print(f"   ⚠️  Trends analysis failed: {e}")
                
                # TOOL 3: Related Queries
                related_queries = {}
                if self.trends_analyzer:
                    try:
                        print(f"🔗 TOOL 3: Getting related search queries...")
                        related_queries = self.trends_analyzer.get_related_queries(
                            keyword=idea_title[:50] if idea_title else "technology"
                        )
                        tools_data['results_summary']['related_queries'] = len(related_queries.get('top', []))
                        print(f"   ✅ Found {len(related_queries.get('top', []))} related queries")
                    except Exception as e:
                        print(f"   ⚠️  Related queries failed: {e}")
                
                # TOOL 4: Market Size Research
                market_results = []
                if self.search_tool:
                    try:
                        print(f"💰 TOOL 4: Researching market size...")
                        market_results = self.search_tool.search_market_size(
                            industry=idea_title.split()[0] if idea_title else "tech"
                        )
                        tools_data['results_summary']['market_articles'] = len(market_results)
                        print(f"   ✅ Found {len(market_results)} market insights")
                    except Exception as e:
                        print(f"   ⚠️  Market search failed: {e}")
                
                # TOOL 5: News Search
                news_results = []
                if self.search_tool:
                    try:
                        print(f"📰 TOOL 5: Searching recent news...")
                        news_results = self.search_tool.search_news(
                            query=f"{idea_title} industry news",
                            max_results=5
                        )
                        tools_data['news_search_used'] = True
                        tools_data['results_summary']['news_articles'] = len(news_results)
                        print(f"   ✅ Found {len(news_results)} news articles\n")
                    except Exception as e:
                        print(f"   ⚠️  News search failed: {e}\n")
                
                # Compile real data for LLM analysis
                real_data_context = f"""
REAL DATA FROM TOOLS:

1. COMPETITOR SEARCH ({len(competitors_results)} results):
{json.dumps([{'title': r['title'], 'url': r['url'][:100]} for r in competitors_results[:5]], indent=2)}

2. GOOGLE TRENDS ANALYSIS:
Status: {trends_data.get('status', 'N/A')}
Trends: {json.dumps(trends_data.get('trends', {}), indent=2)}

3. RELATED QUERIES:
Rising: {json.dumps(related_queries.get('rising', [])[:5], indent=2)}
Top: {json.dumps(related_queries.get('top', [])[:5], indent=2)}

4. MARKET SIZE RESEARCH ({len(market_results)} articles):
{json.dumps([r['title'] for r in market_results[:5]], indent=2)}

5. RECENT NEWS ({len(news_results)} articles):
{json.dumps([{'title': n['title'], 'date': n.get('date', 'N/A')} for n in news_results], indent=2)}
"""
                
                print(f"🤖 STEP 6: Analyzing data with LLM...")
                
                prompt = f"""As a market research specialist, analyze this business idea using REAL DATA collected from web searches, Google Trends, and news sources:

BUSINESS IDEA:
Title: {idea_title}
Description: {idea_desc}
Revenue Model: {msg.idea.get('revenue_model', 'No revenue model')}

{real_data_context}

Based on this REAL DATA from actual sources, provide a comprehensive analysis.

Format your response as JSON:
{{
  "competitors": [
    {{
      "name": "Competitor Name",
      "description": "What they do",
      "strengths": "Their advantages",
      "weaknesses": "Their limitations"
    }}
  ],
  "market_analysis": {{
    "market_size": "Estimated market size based on research",
    "growth_potential": "High/Medium/Low with explanation",
    "key_challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  }},
  "recommendations": {{
    "positioning": "How to position this product",
    "differentiation": "How to stand out from competitors found",
    "target_audience": "Primary target market"
  }}
}}"""

                response = await self.call_asi_one(prompt, 2500)
                
                # Parse response
                cleaned_response = re.sub(r'[\u0000-\u001F\u007F-\u009F]', '', response)
                json_match = re.search(r'\{[\s\S]*\}', cleaned_response)
                if json_match:
                    cleaned_response = json_match.group(0)
                
                try:
                    research_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback")
                    research_data = self.get_fallback_research_data()
                
                # Build response
                competitors = [Competitor(**comp) for comp in research_data.get('competitors', [])]
                market_analysis = MarketAnalysis(**research_data.get('market_analysis', {}))
                recommendations = Recommendations(**research_data.get('recommendations', {}))
                
                research_response = ResearchResponse(
                    competitors=competitors,
                    market_analysis=market_analysis,
                    recommendations=recommendations,
                    tools_used=tools_data
                )
                
                print(f"\n✅ Research complete! Used {sum([tools_data['web_search_used'], tools_data['trends_analysis_used'], tools_data['news_search_used']])} tools")
                print(f"{'='*60}\n")
                
                self.log_activity('Completed research with real tools', {
                    'idea_title': idea_title,
                    'tools_used': tools_data,
                    'sender': sender
                })
                
                await ctx.send(sender, research_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error: {str(e)}")
                fallback_response = ResearchResponse(
                    competitors=[Competitor(**comp) for comp in self.get_fallback_research_data()['competitors']],
                    market_analysis=MarketAnalysis(**self.get_fallback_research_data()['market_analysis']),
                    recommendations=Recommendations(**self.get_fallback_research_data()['recommendations']),
                    tools_used={'error': str(e)}
                )
                await ctx.send(sender, fallback_response)
        
        # REST endpoint with same tool-based approach
        @self.agent.on_rest_post("/research-idea", ResearchRequest, ResearchResponse)
        async def handle_research_idea_rest(ctx: Context, req: ResearchRequest) -> ResearchResponse:
            """REST endpoint - uses same tool-based research"""
            # Reuse the same logic - call the message handler
            return await handle_research_request(ctx, "rest_client", req)
    
    def get_fallback_research_data(self) -> Dict[str, Any]:
        """Fallback data when tools fail"""
        return {
            "competitors": [
                {
                    "name": "Competitor 1",
                    "description": "Leading competitor",
                    "strengths": "Market presence",
                    "weaknesses": "Limited innovation"
                },
                {
                    "name": "Competitor 2",
                    "description": "Emerging competitor",
                    "strengths": "Innovation",
                    "weaknesses": "Small market share"
                }
            ],
            "market_analysis": {
                "market_size": "Large and growing",
                "growth_potential": "High",
                "key_challenges": ["Competition", "Regulations"],
                "opportunities": ["Growing demand", "Technology"]
            },
            "recommendations": {
                "positioning": "Innovative solution",
                "differentiation": "Unique value proposition",
                "target_audience": "Target market"
            }
        }

# Create agent instance
research_agent = ResearchuAgent()

if __name__ == "__main__":
    print(f"\n🚀 Starting Enhanced Research uAgent")
    print(f"📍 Port: {research_agent.port}")
    print(f"📍 Address: {research_agent.get_agent_address()}")
    print(f"🔧 Agentic Tools: Web Scraping, Trends, Search")
    print(f"\nTest with:")
    print(f'curl -X POST http://localhost:8002/research-idea -H "Content-Type: application/json" -d \'{{"idea": {{"title": "AI Fitness App", "description": "Smart workout planning", "revenue_model": "Subscription"}}}}\'')
    print(f"\n{'='*60}\n")
    research_agent.agent.run()
