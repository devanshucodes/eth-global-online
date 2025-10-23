"""
Product uAgent for AI Company
Develops product strategy and concepts
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class ProductRequest(Model):
    """Model for product development request"""
    idea: Dict[str, str]
    research: Dict[str, Any]

class TargetMarket(Model):
    """Model for target market"""
    primary: str
    secondary: str

class GoToMarket(Model):
    """Model for go-to-market strategy"""
    channels: List[str]
    pricing_strategy: str
    launch_plan: str

class ProductResponse(Model):
    """Model for product response"""
    product_name: str
    product_description: str
    core_features: List[str]
    target_market: TargetMarket
    value_proposition: str
    go_to_market: GoToMarket
    revenue_model: str
    success_metrics: List[str]

class ProductuAgent(BaseUAgent):
    """Product uAgent for product strategy and concept development"""
    
    def __init__(self):
        super().__init__(
            name="Product Agent",
            role="Product strategy and concept development",
            port=8003
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=ProductRequest)
        async def handle_product_request(ctx: Context, sender: str, msg: ProductRequest):
            """Develop product concept based on idea and research"""
            try:
                print(f"🔧 [{self.name}] Developing product concept for: {msg.idea.get('title', 'Unknown')}")
                
                prompt = f"""As a product strategist, develop a detailed product concept based on this business idea and research:

Original Idea:
Title: {msg.idea.get('title', 'Unknown')}
Description: {msg.idea.get('description', 'No description')}
Revenue Model: {msg.idea.get('revenue_model', 'No revenue model')}

Research Data:
Competitors: {json.dumps(msg.research.get('competitors', []))}
Market Analysis: {json.dumps(msg.research.get('market_analysis', {}))}
Recommendations: {json.dumps(msg.research.get('recommendations', {}))}

Create a comprehensive product concept that includes:

1. Product name and positioning
2. Core features and functionality
3. Target market segments
4. Value proposition
5. Go-to-market strategy
6. Revenue model refinement
7. Success metrics

Format your response as JSON:
{{
  "product_name": "Final Product Name",
  "product_description": "Detailed product description",
  "core_features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "target_market": {{
    "primary": "Primary target audience",
    "secondary": "Secondary target audience"
  }},
  "value_proposition": "Why customers will choose this product",
  "go_to_market": {{
    "channels": ["Channel 1", "Channel 2"],
    "pricing_strategy": "Pricing approach",
    "launch_plan": "Launch strategy"
  }},
  "revenue_model": "How the product generates revenue",
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
                    product_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
                    product_data = self.get_fallback_product_data()
                
                # Convert to response models
                target_market = TargetMarket(**product_data.get('target_market', {}))
                go_to_market = GoToMarket(**product_data.get('go_to_market', {}))
                
                product_response = ProductResponse(
                    product_name=product_data.get('product_name', 'AI Product Concept'),
                    product_description=product_data.get('product_description', 'A comprehensive product concept'),
                    core_features=product_data.get('core_features', []),
                    target_market=target_market,
                    value_proposition=product_data.get('value_proposition', 'Innovative solution'),
                    go_to_market=go_to_market,
                    revenue_model=product_data.get('revenue_model', 'Subscription model'),
                    success_metrics=product_data.get('success_metrics', [])
                )
                
                self.log_activity('Developed product concept', {
                    'product_name': product_response.product_name,
                    'features_count': len(product_response.core_features),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, product_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error developing product: {str(e)}")
                # Send error response with fallback data
                fallback_response = self.get_fallback_product_response()
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/develop-product", ProductRequest, ProductResponse)
        async def handle_develop_product_rest(ctx: Context, req: ProductRequest) -> ProductResponse:
            """REST endpoint for developing product concepts"""
            try:
                print(f"🔧 [{self.name}] REST: Developing product concept for: {req.idea.get('title', 'Unknown')}")
                
                prompt = f"""As a product strategist, develop a detailed product concept based on this business idea and research:

Original Idea:
Title: {req.idea.get('title', 'Unknown')}
Description: {req.idea.get('description', 'No description')}
Revenue Model: {req.idea.get('revenue_model', 'No revenue model')}

Research Data:
Competitors: {json.dumps(req.research.get('competitors', []))}
Market Analysis: {json.dumps(req.research.get('market_analysis', {}))}
Recommendations: {json.dumps(req.research.get('recommendations', {}))}

Create a comprehensive product concept that includes:

1. Product name and positioning
2. Core features and functionality
3. Target market segments
4. Value proposition
5. Go-to-market strategy
6. Revenue model refinement
7. Success metrics

Format your response as JSON:
{{
  "product_name": "Final Product Name",
  "product_description": "Detailed product description",
  "core_features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "target_market": {{
    "primary": "Primary target audience",
    "secondary": "Secondary target audience"
  }},
  "value_proposition": "Why customers will choose this product",
  "go_to_market": {{
    "channels": ["Channel 1", "Channel 2"],
    "pricing_strategy": "Pricing approach",
    "launch_plan": "Launch strategy"
  }},
  "revenue_model": "How the product generates revenue",
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
                    product_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] REST: JSON parsing failed, using fallback data")
                    product_data = self.get_fallback_product_data()
                
                # Convert to response models
                target_market = TargetMarket(**product_data.get('target_market', {}))
                go_to_market = GoToMarket(**product_data.get('go_to_market', {}))
                
                product_response = ProductResponse(
                    product_name=product_data.get('product_name', 'AI Product Concept'),
                    product_description=product_data.get('product_description', 'A comprehensive product concept'),
                    core_features=product_data.get('core_features', []),
                    target_market=target_market,
                    value_proposition=product_data.get('value_proposition', 'Innovative solution'),
                    go_to_market=go_to_market,
                    revenue_model=product_data.get('revenue_model', 'Subscription model'),
                    success_metrics=product_data.get('success_metrics', [])
                )
                
                self.log_activity('REST: Developed product concept', {
                    'product_name': product_response.product_name,
                    'features_count': len(product_response.core_features)
                })
                
                return product_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error developing product: {str(e)}")
                return self.get_fallback_product_response()
    
    def get_fallback_product_data(self) -> Dict[str, Any]:
        """Get fallback product data when API fails"""
        return {
            "product_name": "AI Product Concept",
            "product_description": "A comprehensive product concept developed by AI agents",
            "core_features": ["AI-powered functionality", "User-friendly interface", "Scalable architecture"],
            "target_market": {
                "primary": "Target users",
                "secondary": "Secondary market"
            },
            "value_proposition": "Innovative AI solution for modern needs",
            "go_to_market": {
                "channels": ["Digital channels"],
                "pricing_strategy": "Subscription model",
                "launch_plan": "Phased rollout"
            },
            "revenue_model": "Subscription-based revenue model",
            "success_metrics": ["User adoption", "Revenue growth", "Customer satisfaction"]
        }
    
    def get_fallback_product_response(self) -> ProductResponse:
        """Get fallback product response"""
        fallback_data = self.get_fallback_product_data()
        return ProductResponse(
            product_name=fallback_data['product_name'],
            product_description=fallback_data['product_description'],
            core_features=fallback_data['core_features'],
            target_market=TargetMarket(**fallback_data['target_market']),
            value_proposition=fallback_data['value_proposition'],
            go_to_market=GoToMarket(**fallback_data['go_to_market']),
            revenue_model=fallback_data['revenue_model'],
            success_metrics=fallback_data['success_metrics']
        )

# Create the agent instance
product_agent = ProductuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Product uAgent on port {product_agent.port}")
    print(f"📍 Agent address: {product_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    product_agent.agent.run()
