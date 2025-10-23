"""
CMO uAgent for AI Company
Develops marketing strategy and brand development
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class MarketingRequest(Model):
    """Model for marketing strategy request"""
    idea: Dict[str, str]
    product: Dict[str, Any]
    research: Dict[str, Any]

class TargetSegment(Model):
    """Model for target segment"""
    segment: str
    characteristics: str
    channels: List[str]

class MarketingChannel(Model):
    """Model for marketing channel"""
    channel: str
    strategy: str
    budget_allocation: str

class ContentStrategy(Model):
    """Model for content strategy"""
    content_types: List[str]
    content_themes: List[str]
    publishing_schedule: str

class SocialMedia(Model):
    """Model for social media strategy"""
    platforms: List[str]
    strategy: str
    engagement_tactics: List[str]

class LaunchCampaign(Model):
    """Model for launch campaign"""
    pre_launch: str
    launch_day: str
    post_launch: str

class BudgetRecommendations(Model):
    """Model for budget recommendations"""
    total_budget: str
    allocation: Dict[str, str]

class MarketingResponse(Model):
    """Model for marketing response"""
    brand_positioning: str
    key_messages: List[str]
    target_segments: List[TargetSegment]
    marketing_channels: List[MarketingChannel]
    content_strategy: ContentStrategy
    social_media: SocialMedia
    launch_campaign: LaunchCampaign
    budget_recommendations: BudgetRecommendations
    success_metrics: List[str]

class CMouAgent(BaseUAgent):
    """CMO uAgent for marketing strategy and brand development"""
    
    def __init__(self):
        super().__init__(
            name="CMO Agent",
            role="Marketing strategy and brand development",
            port=8004
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=MarketingRequest)
        async def handle_marketing_request(ctx: Context, sender: str, msg: MarketingRequest):
            """Develop marketing strategy for a product"""
            try:
                print(f"📢 [{self.name}] Developing marketing strategy for: {msg.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Chief Marketing Officer, develop a comprehensive marketing strategy for this product:

Product Details:
Name: {msg.product.get('product_name', 'Unknown')}
Description: {msg.product.get('product_description', 'No description')}
Target Market: {json.dumps(msg.product.get('target_market', {}))}
Value Proposition: {msg.product.get('value_proposition', 'Not specified')}

Research Data:
Market Size: {msg.research.get('market_analysis', {}).get('market_size', 'Not available')}
Competitors: {json.dumps(msg.research.get('competitors', []))}
Target Audience: {msg.research.get('recommendations', {}).get('target_audience', 'Not specified')}

Create a comprehensive marketing strategy including:

1. Brand positioning and messaging
2. Target audience segmentation
3. Marketing channels and tactics
4. Content marketing strategy
5. Social media strategy
6. Launch campaign plan
7. Budget allocation recommendations
8. Success metrics and KPIs

Format your response as JSON:
{{
  "brand_positioning": "How the brand should be positioned in the market",
  "key_messages": ["Message 1", "Message 2", "Message 3"],
  "target_segments": [
    {{
      "segment": "Primary target segment",
      "characteristics": "Key characteristics",
      "channels": ["Channel 1", "Channel 2"]
    }}
  ],
  "marketing_channels": [
    {{
      "channel": "Channel name",
      "strategy": "How to use this channel",
      "budget_allocation": "Percentage of budget"
    }}
  ],
  "content_strategy": {{
    "content_types": ["Type 1", "Type 2"],
    "content_themes": ["Theme 1", "Theme 2"],
    "publishing_schedule": "How often to publish"
  }},
  "social_media": {{
    "platforms": ["Platform 1", "Platform 2"],
    "strategy": "Social media approach",
    "engagement_tactics": ["Tactic 1", "Tactic 2"]
  }},
  "launch_campaign": {{
    "pre_launch": "Pre-launch activities",
    "launch_day": "Launch day strategy",
    "post_launch": "Post-launch follow-up"
  }},
  "budget_recommendations": {{
    "total_budget": "Recommended total budget",
    "allocation": {{
      "digital_ads": "Percentage",
      "content_creation": "Percentage",
      "events": "Percentage",
      "pr": "Percentage"
    }}
  }},
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}}"""

                response = await self.call_asi_one(prompt, 3000)
                
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
                    strategy_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
                    strategy_data = self.get_fallback_strategy_data()
                
                # Convert to response models
                target_segments = [TargetSegment(**seg) for seg in strategy_data.get('target_segments', [])]
                marketing_channels = [MarketingChannel(**ch) for ch in strategy_data.get('marketing_channels', [])]
                content_strategy = ContentStrategy(**strategy_data.get('content_strategy', {}))
                social_media = SocialMedia(**strategy_data.get('social_media', {}))
                launch_campaign = LaunchCampaign(**strategy_data.get('launch_campaign', {}))
                budget_recommendations = BudgetRecommendations(**strategy_data.get('budget_recommendations', {}))
                
                marketing_response = MarketingResponse(
                    brand_positioning=strategy_data.get('brand_positioning', 'Innovative solution'),
                    key_messages=strategy_data.get('key_messages', []),
                    target_segments=target_segments,
                    marketing_channels=marketing_channels,
                    content_strategy=content_strategy,
                    social_media=social_media,
                    launch_campaign=launch_campaign,
                    budget_recommendations=budget_recommendations,
                    success_metrics=strategy_data.get('success_metrics', [])
                )
                
                self.log_activity('Developed marketing strategy', {
                    'product_name': msg.product.get('product_name', 'Unknown'),
                    'channels_count': len(marketing_channels),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, marketing_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error developing marketing strategy: {str(e)}")
                # Send error response with fallback data
                fallback_response = self.get_fallback_marketing_response()
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/develop-marketing", MarketingRequest, MarketingResponse)
        async def handle_develop_marketing_rest(ctx: Context, req: MarketingRequest) -> MarketingResponse:
            """REST endpoint for developing marketing strategies"""
            try:
                print(f"📢 [{self.name}] REST: Developing marketing strategy for: {req.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Chief Marketing Officer, develop a comprehensive marketing strategy for this product:

Product Details:
Name: {req.product.get('product_name', 'Unknown')}
Description: {req.product.get('product_description', 'No description')}
Target Market: {json.dumps(req.product.get('target_market', {}))}
Value Proposition: {req.product.get('value_proposition', 'Not specified')}

Research Data:
Market Size: {req.research.get('market_analysis', {}).get('market_size', 'Not available')}
Competitors: {json.dumps(req.research.get('competitors', []))}
Target Audience: {req.research.get('recommendations', {}).get('target_audience', 'Not specified')}

Create a comprehensive marketing strategy including:

1. Brand positioning and messaging
2. Target audience segmentation
3. Marketing channels and tactics
4. Content marketing strategy
5. Social media strategy
6. Launch campaign plan
7. Budget allocation recommendations
8. Success metrics and KPIs

Format your response as JSON:
{{
  "brand_positioning": "How the brand should be positioned in the market",
  "key_messages": ["Message 1", "Message 2", "Message 3"],
  "target_segments": [
    {{
      "segment": "Primary target segment",
      "characteristics": "Key characteristics",
      "channels": ["Channel 1", "Channel 2"]
    }}
  ],
  "marketing_channels": [
    {{
      "channel": "Channel name",
      "strategy": "How to use this channel",
      "budget_allocation": "Percentage of budget"
    }}
  ],
  "content_strategy": {{
    "content_types": ["Type 1", "Type 2"],
    "content_themes": ["Theme 1", "Theme 2"],
    "publishing_schedule": "How often to publish"
  }},
  "social_media": {{
    "platforms": ["Platform 1", "Platform 2"],
    "strategy": "Social media approach",
    "engagement_tactics": ["Tactic 1", "Tactic 2"]
  }},
  "launch_campaign": {{
    "pre_launch": "Pre-launch activities",
    "launch_day": "Launch day strategy",
    "post_launch": "Post-launch follow-up"
  }},
  "budget_recommendations": {{
    "total_budget": "Recommended total budget",
    "allocation": {{
      "digital_ads": "Percentage",
      "content_creation": "Percentage",
      "events": "Percentage",
      "pr": "Percentage"
    }}
  }},
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"]
}}"""

                response = await self.call_asi_one(prompt, 3000)
                
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
                    strategy_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] REST: JSON parsing failed, using fallback data")
                    strategy_data = self.get_fallback_strategy_data()
                
                # Convert to response models
                target_segments = [TargetSegment(**seg) for seg in strategy_data.get('target_segments', [])]
                marketing_channels = [MarketingChannel(**ch) for ch in strategy_data.get('marketing_channels', [])]
                content_strategy = ContentStrategy(**strategy_data.get('content_strategy', {}))
                social_media = SocialMedia(**strategy_data.get('social_media', {}))
                launch_campaign = LaunchCampaign(**strategy_data.get('launch_campaign', {}))
                budget_recommendations = BudgetRecommendations(**strategy_data.get('budget_recommendations', {}))
                
                marketing_response = MarketingResponse(
                    brand_positioning=strategy_data.get('brand_positioning', 'Innovative solution'),
                    key_messages=strategy_data.get('key_messages', []),
                    target_segments=target_segments,
                    marketing_channels=marketing_channels,
                    content_strategy=content_strategy,
                    social_media=social_media,
                    launch_campaign=launch_campaign,
                    budget_recommendations=budget_recommendations,
                    success_metrics=strategy_data.get('success_metrics', [])
                )
                
                self.log_activity('REST: Developed marketing strategy', {
                    'product_name': req.product.get('product_name', 'Unknown'),
                    'channels_count': len(marketing_channels)
                })
                
                return marketing_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error developing marketing strategy: {str(e)}")
                return self.get_fallback_marketing_response()
    
    def get_fallback_strategy_data(self) -> Dict[str, Any]:
        """Get fallback strategy data when API fails"""
        return {
            "brand_positioning": "Innovative AI-powered solution for modern needs",
            "key_messages": ["Cutting-edge technology", "User-friendly experience", "Proven results"],
            "target_segments": [
                {
                    "segment": "Primary target market",
                    "characteristics": "Tech-savvy professionals",
                    "channels": ["Digital marketing", "Social media"]
                }
            ],
            "marketing_channels": [
                {
                    "channel": "Digital Marketing",
                    "strategy": "Comprehensive digital presence",
                    "budget_allocation": "40%"
                },
                {
                    "channel": "Social Media",
                    "strategy": "Engaging content strategy",
                    "budget_allocation": "30%"
                }
            ],
            "content_strategy": {
                "content_types": ["Blog posts", "Videos", "Infographics"],
                "content_themes": ["Product features", "User success stories"],
                "publishing_schedule": "Weekly"
            },
            "social_media": {
                "platforms": ["LinkedIn", "Twitter", "Facebook"],
                "strategy": "Professional and engaging content",
                "engagement_tactics": ["Community building", "User-generated content"]
            },
            "launch_campaign": {
                "pre_launch": "Build anticipation and awareness",
                "launch_day": "Major announcement and media coverage",
                "post_launch": "Sustained marketing and user acquisition"
            },
            "budget_recommendations": {
                "total_budget": "$50,000 - $100,000",
                "allocation": {
                    "digital_ads": "40%",
                    "content_creation": "25%",
                    "events": "20%",
                    "pr": "15%"
                }
            },
            "success_metrics": ["Brand awareness", "Lead generation", "Customer acquisition cost"]
        }
    
    def get_fallback_marketing_response(self) -> MarketingResponse:
        """Get fallback marketing response"""
        fallback_data = self.get_fallback_strategy_data()
        return MarketingResponse(
            brand_positioning=fallback_data['brand_positioning'],
            key_messages=fallback_data['key_messages'],
            target_segments=[TargetSegment(**seg) for seg in fallback_data['target_segments']],
            marketing_channels=[MarketingChannel(**ch) for ch in fallback_data['marketing_channels']],
            content_strategy=ContentStrategy(**fallback_data['content_strategy']),
            social_media=SocialMedia(**fallback_data['social_media']),
            launch_campaign=LaunchCampaign(**fallback_data['launch_campaign']),
            budget_recommendations=BudgetRecommendations(**fallback_data['budget_recommendations']),
            success_metrics=fallback_data['success_metrics']
        )

# Create the agent instance
cmo_agent = CMouAgent()

if __name__ == "__main__":
    print(f"🚀 Starting CMO uAgent on port {cmo_agent.port}")
    print(f"📍 Agent address: {cmo_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    cmo_agent.agent.run()
