"""
Research uAgent for AI Company
Conducts market research and competitive analysis
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

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

class ResearchuAgent(BaseUAgent):
    """Research uAgent for market research and competitive analysis"""
    
    def __init__(self):
        super().__init__(
            name="Research Agent",
            role="Market research and competitive analysis",
            port=8002
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=ResearchRequest)
        async def handle_research_request(ctx: Context, sender: str, msg: ResearchRequest):
            """Conduct market research for a business idea"""
            try:
                print(f"🔍 [{self.name}] Starting research for idea: {msg.idea.get('title', 'Unknown')}")
                
                prompt = f"""As a market research specialist, analyze this business idea:

Title: {msg.idea.get('title', 'Unknown')}
Description: {msg.idea.get('description', 'No description')}
Revenue Model: {msg.idea.get('revenue_model', 'No revenue model')}

Conduct thorough research and provide:

1. Existing competitors in this space
2. Market size and opportunity
3. Key challenges and barriers
4. Success factors for this type of business
5. Recommended positioning strategy

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
    "market_size": "Estimated market size",
    "growth_potential": "High/Medium/Low",
    "key_challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  }},
  "recommendations": {{
    "positioning": "How to position this product",
    "differentiation": "How to stand out",
    "target_audience": "Primary target market"
  }}
}}"""

                response = await self.call_asi_one(prompt, 2500)
                
                # Clean the response to handle JSON parsing issues
                cleaned_response = response
                cleaned_response = re.sub(r'[\u0000-\u001F\u007F-\u009F]', '', cleaned_response)  # Remove control characters
                cleaned_response = cleaned_response.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
                
                # Try to extract JSON from the response if it's wrapped in markdown
                json_match = re.search(r'\{[\s\S]*\}', cleaned_response)
                if json_match:
                    cleaned_response = json_match.group(0)
                
                # Parse JSON response
                try:
                    research_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
                    research_data = self.get_fallback_research_data()
                
                # Convert to response models
                competitors = [Competitor(**comp) for comp in research_data.get('competitors', [])]
                market_analysis = MarketAnalysis(**research_data.get('market_analysis', {}))
                recommendations = Recommendations(**research_data.get('recommendations', {}))
                
                research_response = ResearchResponse(
                    competitors=competitors,
                    market_analysis=market_analysis,
                    recommendations=recommendations
                )
                
                self.log_activity('Conducted market research', {
                    'idea_title': msg.idea.get('title', 'Unknown'),
                    'competitors_found': len(competitors),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, research_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error conducting research: {str(e)}")
                # Send error response with fallback data
                fallback_response = ResearchResponse(
                    competitors=[Competitor(**comp) for comp in self.get_fallback_research_data()['competitors']],
                    market_analysis=MarketAnalysis(**self.get_fallback_research_data()['market_analysis']),
                    recommendations=Recommendations(**self.get_fallback_research_data()['recommendations'])
                )
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/research-idea", ResearchRequest, ResearchResponse)
        async def handle_research_idea_rest(ctx: Context, req: ResearchRequest) -> ResearchResponse:
            """REST endpoint for researching business ideas"""
            try:
                print(f"🔍 [{self.name}] REST: Researching idea: {req.idea.get('title', 'Unknown')}")
                
                prompt = f"""As a market research specialist, analyze this business idea:

Title: {req.idea.get('title', 'Unknown')}
Description: {req.idea.get('description', 'No description')}
Revenue Model: {req.idea.get('revenue_model', 'No revenue model')}

Conduct thorough research and provide:

1. Existing competitors in this space
2. Market size and opportunity
3. Key challenges and barriers
4. Success factors for this type of business
5. Recommended positioning strategy

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
    "market_size": "Estimated market size",
    "growth_potential": "High/Medium/Low",
    "key_challenges": ["Challenge 1", "Challenge 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"]
  }},
  "recommendations": {{
    "positioning": "How to position this product",
    "differentiation": "How to stand out",
    "target_audience": "Primary target market"
  }}
}}"""

                response = await self.call_asi_one(prompt, 2500)
                
                # Clean the response to handle JSON parsing issues
                cleaned_response = response
                cleaned_response = re.sub(r'[\u0000-\u001F\u007F-\u009F]', '', cleaned_response)  # Remove control characters
                cleaned_response = cleaned_response.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
                
                # Try to extract JSON from the response if it's wrapped in markdown
                json_match = re.search(r'\{[\s\S]*\}', cleaned_response)
                if json_match:
                    cleaned_response = json_match.group(0)
                
                # Parse JSON response
                try:
                    research_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] REST: JSON parsing failed, using fallback data")
                    research_data = self.get_fallback_research_data()
                
                # Convert to response models
                competitors = [Competitor(**comp) for comp in research_data.get('competitors', [])]
                market_analysis = MarketAnalysis(**research_data.get('market_analysis', {}))
                recommendations = Recommendations(**research_data.get('recommendations', {}))
                
                research_response = ResearchResponse(
                    competitors=competitors,
                    market_analysis=market_analysis,
                    recommendations=recommendations
                )
                
                self.log_activity('REST: Conducted market research', {
                    'idea_title': req.idea.get('title', 'Unknown'),
                    'competitors_found': len(competitors)
                })
                
                return research_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error conducting research: {str(e)}")
                # Return fallback response
                fallback_data = self.get_fallback_research_data()
                return ResearchResponse(
                    competitors=[Competitor(**comp) for comp in fallback_data['competitors']],
                    market_analysis=MarketAnalysis(**fallback_data['market_analysis']),
                    recommendations=Recommendations(**fallback_data['recommendations'])
                )
    
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

# Create the agent instance
research_agent = ResearchuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Research uAgent on port {research_agent.port}")
    print(f"📍 Agent address: {research_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    research_agent.agent.run()
