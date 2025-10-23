"""
Head of Engineering uAgent for AI Company
Creates technical implementation and website development strategy
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class BoltPromptRequest(Model):
    """Model for Bolt prompt request"""
    idea: Dict[str, str]
    product: Dict[str, Any]
    research: Dict[str, Any]
    marketing_strategy: Dict[str, Any]
    technical_strategy: Dict[str, Any]

class DesignSpecifications(Model):
    """Model for design specifications"""
    color_scheme: str
    typography: str
    layout_style: str
    responsive_design: str

class ContentStrategy(Model):
    """Model for content strategy"""
    homepage_content: str
    about_page: str
    features_page: str
    pricing_page: str
    contact_page: str

class TechnicalSpecifications(Model):
    """Model for technical specifications"""
    performance_requirements: str
    seo_requirements: str
    analytics_setup: str
    security_requirements: str

class BoltPromptResponse(Model):
    """Model for Bolt prompt response"""
    website_title: str
    website_description: str
    pages_required: List[str]
    design_specifications: DesignSpecifications
    functional_requirements: List[str]
    content_strategy: ContentStrategy
    technical_specifications: TechnicalSpecifications
    integration_requirements: List[str]
    bolt_prompt: str

class HeadOfEngineeringuAgent(BaseUAgent):
    """Head of Engineering uAgent for technical implementation and website development strategy"""
    
    def __init__(self):
        super().__init__(
            name="Head of Engineering Agent",
            role="Technical implementation and website development strategy",
            port=8006
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=BoltPromptRequest)
        async def handle_bolt_prompt_request(ctx: Context, sender: str, msg: BoltPromptRequest):
            """Create Bolt prompt for website development"""
            try:
                print(f"🔧 [{self.name}] Creating Bolt prompt for: {msg.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Head of Engineering, create a comprehensive Bolt prompt for building a website based on the following project:

Product Idea:
Title: {msg.idea.get('title', 'Unknown')}
Description: {msg.idea.get('description', 'No description')}

Product Concept:
Name: {msg.product.get('product_name', 'Unknown')}
Description: {msg.product.get('product_description', 'No description')}
Core Features: {json.dumps(msg.product.get('core_features', []))}
Target Market: {json.dumps(msg.product.get('target_market', {}))}
Value Proposition: {msg.product.get('value_proposition', 'Not specified')}
Revenue Model: {msg.product.get('revenue_model', 'Not specified')}

Market Research Summary:
Market Size: {msg.research.get('market_analysis', {}).get('market_size', 'N/A')}
Growth Potential: {msg.research.get('market_analysis', {}).get('growth_potential', 'N/A')}
Competitors: {json.dumps(msg.research.get('competitors', []))}
Target Audience: {msg.research.get('recommendations', {}).get('target_audience', 'N/A')}

Marketing Strategy:
Brand Positioning: {msg.marketing_strategy.get('brand_positioning', 'N/A')}
Key Messages: {json.dumps(msg.marketing_strategy.get('key_messages', []))}
Target Segments: {json.dumps(msg.marketing_strategy.get('target_segments', []))}
Marketing Channels: {json.dumps(msg.marketing_strategy.get('marketing_channels', []))}

Technical Strategy:
Technology Stack: {json.dumps(msg.technical_strategy.get('technology_stack', {}))}
Architecture: {msg.technical_strategy.get('architecture', {}).get('overview', 'N/A')}
Development Timeline: {json.dumps(msg.technical_strategy.get('timeline', {}))}

Create a detailed Bolt prompt that includes:
1. Website structure and pages needed
2. Design requirements and UI/UX specifications
3. Functional requirements and features
4. Content strategy and messaging
5. Technical specifications
6. Integration requirements
7. Performance and scalability needs
8. SEO and marketing considerations

Format your response as JSON:
{{
  "website_title": "Website Title",
  "website_description": "Brief description of the website",
  "pages_required": ["Page 1", "Page 2", "Page 3"],
  "design_specifications": {{
    "color_scheme": "Primary and secondary colors",
    "typography": "Font specifications",
    "layout_style": "Layout approach",
    "responsive_design": "Mobile-first requirements"
  }},
  "functional_requirements": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "content_strategy": {{
    "homepage_content": "Homepage content requirements",
    "about_page": "About page content",
    "features_page": "Features page content",
    "pricing_page": "Pricing page content",
    "contact_page": "Contact page content"
  }},
  "technical_specifications": {{
    "performance_requirements": "Performance targets",
    "seo_requirements": "SEO specifications",
    "analytics_setup": "Analytics requirements",
    "security_requirements": "Security measures"
  }},
  "integration_requirements": [
    "Integration 1",
    "Integration 2"
  ],
  "bolt_prompt": "Complete Bolt prompt for website generation"
}}"""

                response = await self.call_asi_one(prompt, 4000)
                
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
                    bolt_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
                    bolt_data = self.get_fallback_bolt_data(msg.product)
                
                # Convert to response models
                design_specifications = DesignSpecifications(**bolt_data.get('design_specifications', {}))
                content_strategy = ContentStrategy(**bolt_data.get('content_strategy', {}))
                technical_specifications = TechnicalSpecifications(**bolt_data.get('technical_specifications', {}))
                
                bolt_response = BoltPromptResponse(
                    website_title=bolt_data.get('website_title', f"{msg.product.get('product_name', 'Product')} Website"),
                    website_description=bolt_data.get('website_description', msg.product.get('product_description', 'Website description')),
                    pages_required=bolt_data.get('pages_required', []),
                    design_specifications=design_specifications,
                    functional_requirements=bolt_data.get('functional_requirements', []),
                    content_strategy=content_strategy,
                    technical_specifications=technical_specifications,
                    integration_requirements=bolt_data.get('integration_requirements', []),
                    bolt_prompt=bolt_data.get('bolt_prompt', '')
                )
                
                self.log_activity('Created Bolt prompt for website development', {
                    'product_name': msg.product.get('product_name', 'Unknown'),
                    'pages_count': len(bolt_response.pages_required),
                    'features_count': len(bolt_response.functional_requirements),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, bolt_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error creating Bolt prompt: {str(e)}")
                # Send error response with fallback data
                fallback_response = self.get_fallback_bolt_response(msg.product)
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/create-bolt-prompt", BoltPromptRequest, BoltPromptResponse)
        async def handle_create_bolt_prompt_rest(ctx: Context, req: BoltPromptRequest) -> BoltPromptResponse:
            """REST endpoint for creating Bolt prompts"""
            try:
                print(f"🔧 [{self.name}] REST: Creating Bolt prompt for: {req.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Head of Engineering, create a comprehensive Bolt prompt for building a website based on the following project:

Product Idea:
Title: {req.idea.get('title', 'Unknown')}
Description: {req.idea.get('description', 'No description')}

Product Concept:
Name: {req.product.get('product_name', 'Unknown')}
Description: {req.product.get('product_description', 'No description')}
Core Features: {json.dumps(req.product.get('core_features', []))}
Target Market: {json.dumps(req.product.get('target_market', {}))}
Value Proposition: {req.product.get('value_proposition', 'Not specified')}
Revenue Model: {req.product.get('revenue_model', 'Not specified')}

Market Research Summary:
Market Size: {req.research.get('market_analysis', {}).get('market_size', 'N/A')}
Growth Potential: {req.research.get('market_analysis', {}).get('growth_potential', 'N/A')}
Competitors: {json.dumps(req.research.get('competitors', []))}
Target Audience: {req.research.get('recommendations', {}).get('target_audience', 'N/A')}

Marketing Strategy:
Brand Positioning: {req.marketing_strategy.get('brand_positioning', 'N/A')}
Key Messages: {json.dumps(req.marketing_strategy.get('key_messages', []))}
Target Segments: {json.dumps(req.marketing_strategy.get('target_segments', []))}
Marketing Channels: {json.dumps(req.marketing_strategy.get('marketing_channels', []))}

Technical Strategy:
Technology Stack: {json.dumps(req.technical_strategy.get('technology_stack', {}))}
Architecture: {req.technical_strategy.get('architecture', {}).get('overview', 'N/A')}
Development Timeline: {json.dumps(req.technical_strategy.get('timeline', {}))}

Create a detailed Bolt prompt that includes:
1. Website structure and pages needed
2. Design requirements and UI/UX specifications
3. Functional requirements and features
4. Content strategy and messaging
5. Technical specifications
6. Integration requirements
7. Performance and scalability needs
8. SEO and marketing considerations

Format your response as JSON:
{{
  "website_title": "Website Title",
  "website_description": "Brief description of the website",
  "pages_required": ["Page 1", "Page 2", "Page 3"],
  "design_specifications": {{
    "color_scheme": "Primary and secondary colors",
    "typography": "Font specifications",
    "layout_style": "Layout approach",
    "responsive_design": "Mobile-first requirements"
  }},
  "functional_requirements": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "content_strategy": {{
    "homepage_content": "Homepage content requirements",
    "about_page": "About page content",
    "features_page": "Features page content",
    "pricing_page": "Pricing page content",
    "contact_page": "Contact page content"
  }},
  "technical_specifications": {{
    "performance_requirements": "Performance targets",
    "seo_requirements": "SEO specifications",
    "analytics_setup": "Analytics requirements",
    "security_requirements": "Security measures"
  }},
  "integration_requirements": [
    "Integration 1",
    "Integration 2"
  ],
  "bolt_prompt": "Complete Bolt prompt for website generation"
}}"""

                response = await self.call_asi_one(prompt, 4000)
                
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
                    bolt_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] REST: JSON parsing failed, using fallback data")
                    bolt_data = self.get_fallback_bolt_data(req.product)
                
                # Convert to response models
                design_specifications = DesignSpecifications(**bolt_data.get('design_specifications', {}))
                content_strategy = ContentStrategy(**bolt_data.get('content_strategy', {}))
                technical_specifications = TechnicalSpecifications(**bolt_data.get('technical_specifications', {}))
                
                bolt_response = BoltPromptResponse(
                    website_title=bolt_data.get('website_title', f"{req.product.get('product_name', 'Product')} Website"),
                    website_description=bolt_data.get('website_description', req.product.get('product_description', 'Website description')),
                    pages_required=bolt_data.get('pages_required', []),
                    design_specifications=design_specifications,
                    functional_requirements=bolt_data.get('functional_requirements', []),
                    content_strategy=content_strategy,
                    technical_specifications=technical_specifications,
                    integration_requirements=bolt_data.get('integration_requirements', []),
                    bolt_prompt=bolt_data.get('bolt_prompt', '')
                )
                
                self.log_activity('REST: Created Bolt prompt for website development', {
                    'product_name': req.product.get('product_name', 'Unknown'),
                    'pages_count': len(bolt_response.pages_required),
                    'features_count': len(bolt_response.functional_requirements)
                })
                
                return bolt_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error creating Bolt prompt: {str(e)}")
                return self.get_fallback_bolt_response(req.product)
    
    def get_fallback_bolt_data(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Get fallback Bolt data when API fails"""
        return {
            "website_title": f"{product.get('product_name', 'Product')} Website",
            "website_description": product.get('product_description', 'Website description'),
            "pages_required": ["Home", "About", "Features", "Pricing", "Contact"],
            "design_specifications": {
                "color_scheme": "Modern blue and white theme",
                "typography": "Clean, professional fonts",
                "layout_style": "Modern, minimalist design",
                "responsive_design": "Mobile-first approach"
            },
            "functional_requirements": [
                "Responsive design",
                "Contact form",
                "Pricing calculator",
                "User testimonials"
            ],
            "content_strategy": {
                "homepage_content": "Compelling headline and value proposition",
                "about_page": "Company story and mission",
                "features_page": "Detailed feature descriptions",
                "pricing_page": "Clear pricing tiers",
                "contact_page": "Contact information and form"
            },
            "technical_specifications": {
                "performance_requirements": "Fast loading, optimized for speed",
                "seo_requirements": "SEO optimized content and structure",
                "analytics_setup": "Google Analytics integration",
                "security_requirements": "SSL certificate, secure forms"
            },
            "integration_requirements": [
                "Email marketing integration",
                "Payment processing"
            ],
            "bolt_prompt": f"Create a modern, professional website for {product.get('product_name', 'Product')}. The website should have a clean, minimalist design with a blue and white color scheme. Include a compelling homepage with hero section, features page showcasing the product capabilities, pricing page with clear tiers, about page with company story, and contact page with form. The site should be fully responsive and optimized for SEO. Focus on converting visitors into customers with clear call-to-action buttons and trust signals."
        }
    
    def get_fallback_bolt_response(self, product: Dict[str, Any]) -> BoltPromptResponse:
        """Get fallback Bolt response"""
        fallback_data = self.get_fallback_bolt_data(product)
        return BoltPromptResponse(
            website_title=fallback_data['website_title'],
            website_description=fallback_data['website_description'],
            pages_required=fallback_data['pages_required'],
            design_specifications=DesignSpecifications(**fallback_data['design_specifications']),
            functional_requirements=fallback_data['functional_requirements'],
            content_strategy=ContentStrategy(**fallback_data['content_strategy']),
            technical_specifications=TechnicalSpecifications(**fallback_data['technical_specifications']),
            integration_requirements=fallback_data['integration_requirements'],
            bolt_prompt=fallback_data['bolt_prompt']
        )

# Create the agent instance
head_engineering_agent = HeadOfEngineeringuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Head of Engineering uAgent on port {head_engineering_agent.port}")
    print(f"📍 Agent address: {head_engineering_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    head_engineering_agent.agent.run()
