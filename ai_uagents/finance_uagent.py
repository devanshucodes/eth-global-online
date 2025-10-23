"""
Finance uAgent for AI Company
Handles financial analysis and revenue distribution
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class RevenueAnalysisRequest(Model):
    """Model for revenue analysis request"""
    idea_data: Dict[str, Any]
    product_data: Dict[str, Any] = None

class RevenueProjection(Model):
    """Model for revenue projection"""
    minimum: float
    maximum: float
    most_likely: float
    currency: str

class RevenueAnalysisResponse(Model):
    """Model for revenue analysis response"""
    revenue_projection: RevenueProjection
    timeline: str
    revenue_sources: List[str]
    risk_factors: List[str]
    pricing_strategy: str
    confidence_level: str

class FinancialReportRequest(Model):
    """Model for financial report request"""
    revenue_data: Dict[str, Any] = None
    token_holder_data: Dict[str, Any] = None
    contract_info: Dict[str, Any] = None

class FinancialReportResponse(Model):
    """Model for financial report response"""
    report: str
    summary: Dict[str, Any]

class FinanceuAgent(BaseUAgent):
    """Finance uAgent for financial analysis and revenue distribution"""
    
    def __init__(self):
        super().__init__(
            name="Finance Agent",
            role="Financial analysis and revenue distribution",
            port=8007
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=RevenueAnalysisRequest)
        async def handle_revenue_analysis(ctx: Context, sender: str, msg: RevenueAnalysisRequest):
            """Analyze revenue potential for a project"""
            try:
                print(f"💰 [{self.name}] Analyzing revenue potential for: {msg.idea_data.get('title', 'Unknown')}")
                
                prompt = f"""As the Finance Agent for an AI company, analyze the revenue potential for this project:
        
IDEA: {json.dumps(msg.idea_data, indent=2)}
{json.dumps(msg.product_data, indent=2) if msg.product_data else ''}

Please provide:
1. Estimated revenue range (minimum, maximum, most likely)
2. Revenue timeline (when revenue might be generated)
3. Revenue sources (how money would be made)
4. Risk factors that could impact revenue
5. Recommended pricing strategy

Format your response as JSON with these fields:
{{
  "revenue_projection": {{
    "minimum": number,
    "maximum": number,
    "most_likely": number,
    "currency": "USD"
  }},
  "timeline": "string describing when revenue is expected",
  "revenue_sources": ["source1", "source2"],
  "risk_factors": ["risk1", "risk2"],
  "pricing_strategy": "description",
  "confidence_level": "high/medium/low"
}}"""

                response = await self.call_asi_one(prompt, 2000)
                
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
                    analysis_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] JSON parsing failed, using fallback data")
                    analysis_data = self.get_fallback_analysis_data()
                
                # Convert to response models
                revenue_projection = RevenueProjection(**analysis_data.get('revenue_projection', {}))
                
                analysis_response = RevenueAnalysisResponse(
                    revenue_projection=revenue_projection,
                    timeline=analysis_data.get('timeline', '6-12 months'),
                    revenue_sources=analysis_data.get('revenue_sources', []),
                    risk_factors=analysis_data.get('risk_factors', []),
                    pricing_strategy=analysis_data.get('pricing_strategy', 'Subscription model'),
                    confidence_level=analysis_data.get('confidence_level', 'medium')
                )
                
                self.log_activity('Revenue Analysis', {
                    'idea_title': msg.idea_data.get('title', 'Unknown'),
                    'most_likely_revenue': analysis_response.revenue_projection.most_likely,
                    'confidence_level': analysis_response.confidence_level,
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, analysis_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error analyzing revenue: {str(e)}")
                # Send error response with fallback data
                fallback_response = self.get_fallback_analysis_response()
                await ctx.send(sender, fallback_response)
        
        @self.agent.on_message(model=FinancialReportRequest)
        async def handle_financial_report(ctx: Context, sender: str, msg: FinancialReportRequest):
            """Generate financial report"""
            try:
                print(f"💰 [{self.name}] Generating financial report")
                
                prompt = f"""As the Finance Agent, create a comprehensive financial report based on this data:
        
REVENUE HISTORY: {json.dumps(msg.revenue_data or {}, indent=2)}
TOKEN HOLDERS: {json.dumps(msg.token_holder_data or {}, indent=2)}
CONTRACT INFO: {json.dumps(msg.contract_info or {}, indent=2)}

Generate a professional financial report including:
1. Total revenue generated
2. Total dividends distributed
3. Token holder performance
4. Growth metrics
5. Recommendations for improvement

Format as a markdown report."""

                response = await self.call_asi_one(prompt, 3000)
                
                # Create summary from the data
                summary = {
                    'total_revenue': msg.revenue_data.get('total_revenue', 0) if msg.revenue_data else 0,
                    'total_dividends': msg.revenue_data.get('total_dividends', 0) if msg.revenue_data else 0,
                    'token_holders': msg.token_holder_data.get('count', 0) if msg.token_holder_data else 0,
                    'report_date': '2024-01-01'
                }
                
                report_response = FinancialReportResponse(
                    report=response,
                    summary=summary
                )
                
                self.log_activity('Financial Report Generated', {
                    'report_date': summary['report_date'],
                    'total_revenue': summary['total_revenue'],
                    'total_dividends': summary['total_dividends'],
                    'token_holders': summary['token_holders'],
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, report_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error generating financial report: {str(e)}")
                # Send error response with fallback data
                fallback_response = FinancialReportResponse(
                    report="Financial report generation failed. Please try again later.",
                    summary={'error': str(e)}
                )
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/analyze-revenue", RevenueAnalysisRequest, RevenueAnalysisResponse)
        async def handle_analyze_revenue_rest(ctx: Context, req: RevenueAnalysisRequest) -> RevenueAnalysisResponse:
            """REST endpoint for revenue analysis"""
            try:
                print(f"💰 [{self.name}] REST: Analyzing revenue potential for: {req.idea_data.get('title', 'Unknown')}")
                
                prompt = f"""As the Finance Agent for an AI company, analyze the revenue potential for this project:
        
IDEA: {json.dumps(req.idea_data, indent=2)}
{json.dumps(req.product_data, indent=2) if req.product_data else ''}

Please provide:
1. Estimated revenue range (minimum, maximum, most likely)
2. Revenue timeline (when revenue might be generated)
3. Revenue sources (how money would be made)
4. Risk factors that could impact revenue
5. Recommended pricing strategy

Format your response as JSON with these fields:
{{
  "revenue_projection": {{
    "minimum": number,
    "maximum": number,
    "most_likely": number,
    "currency": "USD"
  }},
  "timeline": "string describing when revenue is expected",
  "revenue_sources": ["source1", "source2"],
  "risk_factors": ["risk1", "risk2"],
  "pricing_strategy": "description",
  "confidence_level": "high/medium/low"
}}"""

                response = await self.call_asi_one(prompt, 2000)
                
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
                    analysis_data = json.loads(cleaned_response)
                except json.JSONDecodeError:
                    print(f"❌ [{self.name}] REST: JSON parsing failed, using fallback data")
                    analysis_data = self.get_fallback_analysis_data()
                
                # Convert to response models
                revenue_projection = RevenueProjection(**analysis_data.get('revenue_projection', {}))
                
                analysis_response = RevenueAnalysisResponse(
                    revenue_projection=revenue_projection,
                    timeline=analysis_data.get('timeline', '6-12 months'),
                    revenue_sources=analysis_data.get('revenue_sources', []),
                    risk_factors=analysis_data.get('risk_factors', []),
                    pricing_strategy=analysis_data.get('pricing_strategy', 'Subscription model'),
                    confidence_level=analysis_data.get('confidence_level', 'medium')
                )
                
                self.log_activity('REST: Revenue Analysis', {
                    'idea_title': req.idea_data.get('title', 'Unknown'),
                    'most_likely_revenue': analysis_response.revenue_projection.most_likely,
                    'confidence_level': analysis_response.confidence_level
                })
                
                return analysis_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error analyzing revenue: {str(e)}")
                return self.get_fallback_analysis_response()
        
        @self.agent.on_rest_post("/generate-report", FinancialReportRequest, FinancialReportResponse)
        async def handle_generate_report_rest(ctx: Context, req: FinancialReportRequest) -> FinancialReportResponse:
            """REST endpoint for financial report generation"""
            try:
                print(f"💰 [{self.name}] REST: Generating financial report")
                
                prompt = f"""As the Finance Agent, create a comprehensive financial report based on this data:
        
REVENUE HISTORY: {json.dumps(req.revenue_data or {}, indent=2)}
TOKEN HOLDERS: {json.dumps(req.token_holder_data or {}, indent=2)}
CONTRACT INFO: {json.dumps(req.contract_info or {}, indent=2)}

Generate a professional financial report including:
1. Total revenue generated
2. Total dividends distributed
3. Token holder performance
4. Growth metrics
5. Recommendations for improvement

Format as a markdown report."""

                response = await self.call_asi_one(prompt, 3000)
                
                # Create summary from the data
                summary = {
                    'total_revenue': req.revenue_data.get('total_revenue', 0) if req.revenue_data else 0,
                    'total_dividends': req.revenue_data.get('total_dividends', 0) if req.revenue_data else 0,
                    'token_holders': req.token_holder_data.get('count', 0) if req.token_holder_data else 0,
                    'report_date': '2024-01-01'
                }
                
                report_response = FinancialReportResponse(
                    report=response,
                    summary=summary
                )
                
                self.log_activity('REST: Financial Report Generated', {
                    'report_date': summary['report_date'],
                    'total_revenue': summary['total_revenue'],
                    'total_dividends': summary['total_dividends'],
                    'token_holders': summary['token_holders']
                })
                
                return report_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error generating financial report: {str(e)}")
                return FinancialReportResponse(
                    report="Financial report generation failed. Please try again later.",
                    summary={'error': str(e)}
                )
    
    def get_fallback_analysis_data(self) -> Dict[str, Any]:
        """Get fallback analysis data when API fails"""
        return {
            "revenue_projection": {
                "minimum": 10000,
                "maximum": 100000,
                "most_likely": 50000,
                "currency": "USD"
            },
            "timeline": "6-12 months to generate first revenue",
            "revenue_sources": ["Subscription fees", "Premium features", "Enterprise licensing"],
            "risk_factors": ["Market competition", "Technology changes", "Economic conditions"],
            "pricing_strategy": "Freemium model with premium tiers",
            "confidence_level": "medium"
        }
    
    def get_fallback_analysis_response(self) -> RevenueAnalysisResponse:
        """Get fallback analysis response"""
        fallback_data = self.get_fallback_analysis_data()
        return RevenueAnalysisResponse(
            revenue_projection=RevenueProjection(**fallback_data['revenue_projection']),
            timeline=fallback_data['timeline'],
            revenue_sources=fallback_data['revenue_sources'],
            risk_factors=fallback_data['risk_factors'],
            pricing_strategy=fallback_data['pricing_strategy'],
            confidence_level=fallback_data['confidence_level']
        )

# Create the agent instance
finance_agent = FinanceuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Finance uAgent on port {finance_agent.port}")
    print(f"📍 Agent address: {finance_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    finance_agent.agent.run()
