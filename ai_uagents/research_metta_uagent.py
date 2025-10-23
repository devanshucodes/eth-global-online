"""
Enhanced Research uAgent with MeTTa Knowledge Graphs
Conducts intelligent market research with structured reasoning
"""

import json
import re
from typing import List, Dict, Any
from datetime import datetime
from uagents import Context, Model
from base_uagent import BaseUAgent
from knowledge.business_knowledge import BusinessKnowledgeGraph
from knowledge.research_memory import ResearchMemorySystem

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

class SimilarResearchResponse(Model):
    """Response model for similar research endpoint"""
    similar_research: List[Dict[str, Any]]
    market_patterns: Dict[str, Any]
    business_context: Dict[str, str]

class MarketTrendResponse(Model):
    """Response model for market trend analysis endpoint"""
    industry_insights: Dict[str, str]
    market_patterns: Dict[str, Any]
    trends: str

class MettaResearchResponse(Model):
    """Enhanced research response with MeTTa insights"""
    competitors: List[Competitor]
    market_analysis: MarketAnalysis
    recommendations: Recommendations
    historical_context: str
    similar_research: List[Dict[str, Any]]
    market_patterns: Dict[str, Any]
    success_factors: List[str]

class ResearchMettauAgent(BaseUAgent):
    """Enhanced Research uAgent with MeTTa Knowledge Graphs"""
    
    def __init__(self):
        super().__init__(
            name="Research Agent (MeTTa)",
            role="Intelligent market research with structured reasoning",
            port=8009  # Different port to avoid conflict
        )
        
        # Initialize MeTTa knowledge systems
        self.business_knowledge = BusinessKnowledgeGraph()
        self.research_memory = ResearchMemorySystem()
        
        self.setup_handlers()
        print("🧠 [RESEARCH MeTTa] Enhanced Research Agent with MeTTa Knowledge Graphs initialized")
    
    def setup_handlers(self):
        """Setup message handlers for the enhanced agent"""
        
        @self.agent.on_message(model=ResearchRequest)
        async def handle_enhanced_research_request(ctx: Context, sender: str, msg: ResearchRequest):
            """Conduct enhanced market research with MeTTa knowledge"""
            try:
                print(f"🧠 [{self.name}] Starting MeTTa-enhanced research for: {msg.idea.get('title', 'Unknown')}")
                
                # Step 1: Extract business context from idea
                business_context = self.extract_business_context(msg.idea)
                
                # Step 2: Query MeTTa knowledge graphs
                industry_insights = self.get_industry_insights(business_context)
                historical_context = self.get_historical_context(business_context)
                similar_research = self.find_similar_research(business_context)
                
                # Step 3: Enhanced ASI:One analysis with MeTTa context
                enhanced_prompt = self.create_enhanced_prompt(msg.idea, industry_insights, historical_context)
                
                print(f"🧠 [{self.name}] Calling ASI:One with MeTTa context...")
                response = await self.call_asi_one(enhanced_prompt, 3000)
                
                # Step 4: Parse and enhance response
                research_data = self.parse_research_response(response)
                
                # Step 5: Add MeTTa insights
                research_data = self.enhance_with_metta_insights(research_data, business_context)
                
                # Step 6: Store new research in memory
                self.store_research_findings(msg.idea, research_data)
                
                # Step 7: Create enhanced response
                enhanced_response = MettaResearchResponse(
                    competitors=[Competitor(**comp) for comp in research_data.get('competitors', [])],
                    market_analysis=MarketAnalysis(**research_data.get('market_analysis', {})),
                    recommendations=Recommendations(**research_data.get('recommendations', {})),
                    historical_context=historical_context,
                    similar_research=similar_research,
                    market_patterns=self.analyze_market_patterns(business_context),
                    success_factors=self.get_success_factors(business_context)
                )
                
                self.log_activity('Conducted MeTTa-enhanced research', {
                    'idea_title': msg.idea.get('title', 'Unknown'),
                    'industry': business_context.get('industry', 'Unknown'),
                    'similar_research_found': len(similar_research),
                    'sender': sender
                })
                
                # Send enhanced response back
                await ctx.send(sender, enhanced_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error in MeTTa-enhanced research: {str(e)}")
                # Send fallback response
                fallback_response = self.create_fallback_response()
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/research-idea-metta", ResearchRequest, MettaResearchResponse)
        async def handle_research_idea_metta_rest(ctx: Context, req: ResearchRequest) -> MettaResearchResponse:
            """REST endpoint for MeTTa-enhanced research"""
            try:
                print(f"🧠 [{self.name}] REST: MeTTa-enhanced research for: {req.idea.get('title', 'Unknown')}")
                
                # Extract business context
                business_context = self.extract_business_context(req.idea)
                
                # Get MeTTa insights
                industry_insights = self.get_industry_insights(business_context)
                historical_context = self.get_historical_context(business_context)
                similar_research = self.find_similar_research(business_context)
                
                # Create enhanced prompt
                enhanced_prompt = self.create_enhanced_prompt(req.idea, industry_insights, historical_context)
                
                print(f"🧠 [{self.name}] REST: Calling ASI:One with MeTTa context...")
                response = await self.call_asi_one(enhanced_prompt, 3000)
                
                # Parse and enhance response
                research_data = self.parse_research_response(response)
                research_data = self.enhance_with_metta_insights(research_data, business_context)
                
                # Store research findings
                self.store_research_findings(req.idea, research_data)
                
                # Create enhanced response
                enhanced_response = MettaResearchResponse(
                    competitors=[Competitor(**comp) for comp in research_data.get('competitors', [])],
                    market_analysis=MarketAnalysis(**research_data.get('market_analysis', {})),
                    recommendations=Recommendations(**research_data.get('recommendations', {})),
                    historical_context=historical_context,
                    similar_research=similar_research,
                    market_patterns=self.analyze_market_patterns(business_context),
                    success_factors=self.get_success_factors(business_context)
                )
                
                self.log_activity('REST: MeTTa-enhanced research completed', {
                    'idea_title': req.idea.get('title', 'Unknown'),
                    'industry': business_context.get('industry', 'Unknown'),
                    'similar_research_found': len(similar_research)
                })
                
                return enhanced_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error in MeTTa-enhanced research: {str(e)}")
                return self.create_fallback_response()
        
        # Additional MeTTa-specific endpoints
        @self.agent.on_rest_post("/find-similar-research", ResearchRequest, SimilarResearchResponse)
        async def handle_find_similar_research_rest(ctx: Context, req: ResearchRequest) -> SimilarResearchResponse:
            """Find similar research using MeTTa knowledge"""
            try:
                business_context = self.extract_business_context(req.idea)
                similar_research = self.find_similar_research(business_context)
                market_patterns = self.analyze_market_patterns(business_context)
                
                return SimilarResearchResponse(
                    similar_research=similar_research,
                    market_patterns=market_patterns,
                    business_context=business_context
                )
            except Exception as e:
                print(f"❌ [{self.name}] Error finding similar research: {e}")
                return SimilarResearchResponse(
                    similar_research=[],
                    market_patterns={"error": str(e)},
                    business_context={}
                )
        
        @self.agent.on_rest_post("/market-trend-analysis", ResearchRequest, MarketTrendResponse)
        async def handle_market_trend_analysis_rest(ctx: Context, req: ResearchRequest) -> MarketTrendResponse:
            """Analyze market trends using MeTTa knowledge"""
            try:
                business_context = self.extract_business_context(req.idea)
                industry_insights = self.get_industry_insights(business_context)
                market_patterns = self.analyze_market_patterns(business_context)
                
                return MarketTrendResponse(
                    industry_insights=industry_insights,
                    market_patterns=market_patterns,
                    trends=self.business_knowledge.get_market_trends(business_context.get('industry', 'Unknown'))
                )
            except Exception as e:
                print(f"❌ [{self.name}] Error analyzing market trends: {e}")
                return MarketTrendResponse(
                    industry_insights={},
                    market_patterns={"error": str(e)},
                    trends="Error retrieving trends"
                )
    
    def extract_business_context(self, idea: Dict[str, str]) -> Dict[str, str]:
        """Extract business context from idea for MeTTa queries"""
        title = idea.get('title', '').lower()
        description = idea.get('description', '').lower()
        
        # Determine industry
        industry = 'Unknown'
        if any(word in title + description for word in ['ai', 'artificial intelligence', 'machine learning', 'llm', 'agent']):
            industry = 'AI'
        elif any(word in title + description for word in ['fintech', 'finance', 'payment', 'blockchain', 'crypto']):
            industry = 'Fintech'
        elif any(word in title + description for word in ['saas', 'software', 'platform', 'api']):
            industry = 'SaaS'
        elif any(word in title + description for word in ['education', 'learning', 'tutoring', 'course']):
            industry = 'EdTech'
        
        # Determine business model
        business_model = 'Unknown'
        if any(word in title + description for word in ['subscription', 'saas', 'monthly', 'annual']):
            business_model = 'SaaS'
        elif any(word in title + description for word in ['marketplace', 'platform', 'commission']):
            business_model = 'Marketplace'
        elif any(word in title + description for word in ['freemium', 'free', 'premium']):
            business_model = 'Freemium'
        
        # Determine market segment
        market_segment = 'B2B'  # Default
        if any(word in title + description for word in ['consumer', 'individual', 'personal', 'b2c']):
            market_segment = 'B2C'
        elif any(word in title + description for word in ['enterprise', 'business', 'b2b', 'company']):
            market_segment = 'B2B'
        
        return {
            'industry': industry,
            'business_model': business_model,
            'market_segment': market_segment,
            'title': idea.get('title', 'Unknown'),
            'description': idea.get('description', 'Unknown')
        }
    
    def get_industry_insights(self, business_context: Dict[str, str]) -> Dict[str, str]:
        """Get industry insights from MeTTa knowledge graph"""
        industry = business_context.get('industry', 'Unknown')
        return self.business_knowledge.get_industry_insights(industry)
    
    def get_historical_context(self, business_context: Dict[str, str]) -> str:
        """Get historical context from research memory"""
        industry = business_context.get('industry', 'Unknown')
        business_model = business_context.get('business_model', 'Unknown')
        return self.research_memory.get_historical_context(industry, business_model)
    
    def find_similar_research(self, business_context: Dict[str, str]) -> List[Dict[str, Any]]:
        """Find similar research using MeTTa memory system"""
        industry = business_context.get('industry', 'Unknown')
        business_model = business_context.get('business_model', 'Unknown')
        return self.research_memory.find_similar_research(industry, business_model)
    
    def analyze_market_patterns(self, business_context: Dict[str, str]) -> Dict[str, Any]:
        """Analyze market patterns using MeTTa knowledge"""
        industry = business_context.get('industry', 'Unknown')
        return self.research_memory.analyze_market_patterns(industry)
    
    def get_success_factors(self, business_context: Dict[str, str]) -> List[str]:
        """Get success factors from MeTTa knowledge"""
        industry = business_context.get('industry', 'Unknown')
        return self.business_knowledge.query_success_factors(f"{industry}_company")
    
    def create_enhanced_prompt(self, idea: Dict[str, str], industry_insights: Dict[str, str], 
                             historical_context: str) -> str:
        """Create enhanced prompt with MeTTa context"""
        
        prompt = f"""As an expert market research specialist with access to structured business knowledge, analyze this business idea:

**BUSINESS IDEA:**
Title: {idea.get('title', 'Unknown')}
Description: {idea.get('description', 'No description')}
Revenue Model: {idea.get('revenue_model', 'No revenue model')}

**METTA KNOWLEDGE CONTEXT:**
{historical_context}

**INDUSTRY INSIGHTS:**
Market Size: {industry_insights.get('market_size', 'Unknown')}
Growth Rate: {industry_insights.get('growth_rate', 'Unknown')}
Key Players: {industry_insights.get('key_players', 'Unknown')}
Trends: {industry_insights.get('trends', 'Unknown')}

**ENHANCED ANALYSIS REQUIRED:**
Based on the historical context and industry insights above, provide a comprehensive analysis:

1. **Competitive Landscape Analysis** - Identify existing competitors and their positioning
2. **Market Opportunity Assessment** - Evaluate market size, growth potential, and barriers
3. **Success Pattern Recognition** - Apply historical success patterns to this idea
4. **Risk Assessment** - Identify key challenges and mitigation strategies
5. **Strategic Recommendations** - Provide positioning and differentiation strategies

**FORMAT YOUR RESPONSE AS JSON:**
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
    "market_size": "Estimated market size with context",
    "growth_potential": "High/Medium/Low with reasoning",
    "key_challenges": ["Challenge 1 with context", "Challenge 2 with context"],
    "opportunities": ["Opportunity 1 with context", "Opportunity 2 with context"]
  }},
  "recommendations": {{
    "positioning": "How to position based on historical patterns",
    "differentiation": "How to stand out using success factors",
    "target_audience": "Primary target market with reasoning"
  }}
}}

**IMPORTANT:** Use the MeTTa knowledge context to provide more accurate and contextual analysis. Reference historical patterns and industry insights in your recommendations."""

        return prompt
    
    def parse_research_response(self, response: str) -> Dict[str, Any]:
        """Parse research response from ASI:One"""
        try:
            # Clean the response
            cleaned_response = response
            cleaned_response = re.sub(r'[\u0000-\u001F\u007F-\u009F]', '', cleaned_response)
            cleaned_response = cleaned_response.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            
            # Extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', cleaned_response)
            if json_match:
                cleaned_response = json_match.group(0)
            
            # Parse JSON
            research_data = json.loads(cleaned_response)
            return research_data
            
        except json.JSONDecodeError:
            print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
            return self.get_fallback_research_data()
    
    def enhance_with_metta_insights(self, research_data: Dict[str, Any], business_context: Dict[str, str]) -> Dict[str, Any]:
        """Enhance research data with MeTTa insights"""
        try:
            # Add MeTTa insights to market analysis
            if 'market_analysis' in research_data:
                industry_insights = self.get_industry_insights(business_context)
                
                # Enhance market size with MeTTa context
                if 'market_size' in research_data['market_analysis']:
                    metta_size = industry_insights.get('market_size', '')
                    if metta_size:
                        research_data['market_analysis']['market_size'] += f" (MeTTa: {metta_size} total industry)"
                
                # Add MeTTa trends to opportunities
                metta_trends = industry_insights.get('trends', '')
                if metta_trends and 'opportunities' in research_data['market_analysis']:
                    research_data['market_analysis']['opportunities'].append(f"Industry trends: {metta_trends}")
            
            return research_data
            
        except Exception as e:
            print(f"❌ [{self.name}] Error enhancing with MeTTa insights: {e}")
            return research_data
    
    def store_research_findings(self, idea: Dict[str, str], research_data: Dict[str, Any]):
        """Store research findings in MeTTa memory"""
        try:
            business_context = self.extract_business_context(idea)
            
            # Extract key findings
            findings = {
                'timestamp': datetime.now().isoformat(),
                'industry': business_context.get('industry', 'Unknown'),
                'business_model': business_context.get('business_model', 'Unknown'),
                'market_segment': business_context.get('market_segment', 'Unknown'),
                'competitors_count': len(research_data.get('competitors', [])),
                'growth_potential': research_data.get('market_analysis', {}).get('growth_potential', 'Unknown'),
                'challenges_count': len(research_data.get('market_analysis', {}).get('key_challenges', [])),
                'opportunities_count': len(research_data.get('market_analysis', {}).get('opportunities', []))
            }
            
            # Store in MeTTa memory
            self.research_memory.add_research_record(
                idea_title=idea.get('title', 'Unknown'),
                industry=business_context.get('industry', 'Unknown'),
                business_model=business_context.get('business_model', 'Unknown'),
                market_segment=business_context.get('market_segment', 'Unknown'),
                competitors=[comp.get('name', 'Unknown') for comp in research_data.get('competitors', [])],
                market_size=research_data.get('market_analysis', {}).get('market_size', 'Unknown'),
                growth_potential=research_data.get('market_analysis', {}).get('growth_potential', 'Unknown'),
                key_challenges=research_data.get('market_analysis', {}).get('key_challenges', []),
                opportunities=research_data.get('market_analysis', {}).get('opportunities', []),
                success_rate="High",  # Default for now
                timestamp=findings['timestamp']
            )
            
            print(f"🧠 [{self.name}] Stored research findings in MeTTa memory")
            
        except Exception as e:
            print(f"❌ [{self.name}] Error storing research findings: {e}")
    
    def get_fallback_research_data(self) -> Dict[str, Any]:
        """Get fallback research data when API fails"""
        return {
            "competitors": [
                {
                    "name": "Competitor 1",
                    "description": "Leading competitor in the market",
                    "strengths": "Strong market presence",
                    "weaknesses": "Limited innovation"
                },
                {
                    "name": "Competitor 2",
                    "description": "Emerging competitor",
                    "strengths": "Innovative approach",
                    "weaknesses": "Small market share"
                }
            ],
            "market_analysis": {
                "market_size": "Large and growing market",
                "growth_potential": "High",
                "key_challenges": ["Market competition", "Regulatory requirements"],
                "opportunities": ["Growing demand", "Technology advancement"]
            },
            "recommendations": {
                "positioning": "Innovative and user-focused solution",
                "differentiation": "Unique value proposition",
                "target_audience": "Primary target market"
            }
        }
    
    def create_fallback_response(self) -> MettaResearchResponse:
        """Create fallback response when MeTTa integration fails"""
        fallback_data = self.get_fallback_research_data()
        
        return MettaResearchResponse(
            competitors=[Competitor(**comp) for comp in fallback_data['competitors']],
            market_analysis=MarketAnalysis(**fallback_data['market_analysis']),
            recommendations=Recommendations(**fallback_data['recommendations']),
            historical_context="MeTTa knowledge system temporarily unavailable",
            similar_research=[],
            market_patterns={"error": "MeTTa analysis unavailable"},
            success_factors=["Focus on user needs", "Build strong team", "Iterate quickly"]
        )

# Create the enhanced agent instance
research_metta_agent = ResearchMettauAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Enhanced Research uAgent with MeTTa on port {research_metta_agent.port}")
    print(f"📍 Agent address: {research_metta_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    print(f"🧠 MeTTa Knowledge Graphs: Enabled")
    research_metta_agent.agent.run()
