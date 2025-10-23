"""
CEO uAgent for AI Company
Generates business ideas and evaluates product concepts
"""

import json
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class GenerateIdeas(Model):
    """Model for generating business ideas"""
    count: int = 3

class BusinessIdea(Model):
    """Model for business idea structure"""
    title: str
    description: str
    revenue_model: str
    success_factors: str

class IdeasResponse(Model):
    """Model for ideas response"""
    ideas: List[BusinessIdea]

class EvaluateProduct(Model):
    """Model for product evaluation request"""
    product_name: str
    product_description: str
    features: List[str]
    target_market: Dict[str, str]

class ProductEvaluation(Model):
    """Model for product evaluation response"""
    viability_score: int
    market_potential: str
    recommendations: str
    go_decision: bool

class CEOuAgent(BaseUAgent):
    """CEO uAgent for strategic decision making and idea generation"""
    
    def __init__(self):
        super().__init__(
            name="CEO Agent",
            role="Strategic decision making and idea generation",
            port=8001
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=GenerateIdeas)
        async def handle_generate_ideas(ctx: Context, sender: str, msg: GenerateIdeas):
            """Generate business ideas"""
            try:
                print(f"🧠 [{ceo_agent.name}] Generating {msg.count} business ideas...")
                
                prompt = f"""You are a visionary CEO of an AI company. Generate {msg.count} innovative business ideas that could potentially generate $1 million in revenue.

For each idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Potential revenue model
4. Why it could be successful

Format your response as JSON with this structure:
{{
  "ideas": [
    {{
      "title": "Idea Title",
      "description": "Brief description",
      "revenue_model": "How it makes money",
      "success_factors": "Why it could work"
    }}
  ]
}}"""

                response = await ceo_agent.call_asi_one(prompt, 2000)
                
                # Parse JSON response
                try:
                    ideas_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        ideas_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                ideas = [BusinessIdea(**idea) for idea in ideas_data.get('ideas', [])]
                
                ceo_agent.log_activity('Generated business ideas', {
                    'count': len(ideas),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, IdeasResponse(ideas=ideas))
                
            except Exception as e:
                print(f"❌ [{ceo_agent.name}] Error generating ideas: {str(e)}")
                # Send error response
                await ctx.send(sender, IdeasResponse(ideas=[]))
        
        @self.agent.on_message(model=EvaluateProduct)
        async def handle_evaluate_product(ctx: Context, sender: str, msg: EvaluateProduct):
            """Evaluate product concept for market viability"""
            try:
                print(f"🧠 [{ceo_agent.name}] Evaluating product: {msg.product_name}")
                
                prompt = f"""As a CEO, evaluate this product concept for market viability:

Product: {msg.product_name}
Description: {msg.product_description}
Features: {', '.join(msg.features)}
Target Market: {json.dumps(msg.target_market)}

Provide your assessment in JSON format:
{{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}}"""

                response = await ceo_agent.call_asi_one(prompt, 1000)
                
                # Parse JSON response
                try:
                    evaluation_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        evaluation_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                evaluation = ProductEvaluation(**evaluation_data)
                
                ceo_agent.log_activity('Evaluated product', {
                    'product_name': msg.product_name,
                    'viability_score': evaluation.viability_score,
                    'go_decision': evaluation.go_decision,
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, evaluation)
                
            except Exception as e:
                print(f"❌ [{ceo_agent.name}] Error evaluating product: {str(e)}")
                # Send error response with default values
                error_evaluation = ProductEvaluation(
                    viability_score=0,
                    market_potential="Low",
                    recommendations="Evaluation failed",
                    go_decision=False
                )
                await ctx.send(sender, error_evaluation)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/wait-for-user", GenerateIdeas, IdeasResponse)
        async def handle_wait_for_user_rest(ctx: Context, req: GenerateIdeas) -> IdeasResponse:
            """REST endpoint - CEO agent waits for user to build AI agents"""
            try:
                print(f"🧠 [{self.name}] REST: Waiting for user to build AI agents...")
                
                prompt = f"""You are the CEO of an AI company. A person is coming to build AI agents for the company.
                Prepare a welcoming message and explain that you're ready to coordinate the workflow
                once the agents are built and the company is established.
                
                Keep the response brief and professional. Return a JSON with a welcome message:
                {{
                  "message": "Welcome message",
                  "status": "ready_for_workflow",
                  "next_steps": "What happens next"
                }}"""

                response = await self.call_asi_one(prompt, 500)
                
                # Parse JSON response
                try:
                    welcome_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        welcome_data = json.loads(json_match.group())
                    else:
                        welcome_data = {
                            "message": "Welcome! I'm ready to coordinate the AI agent workflow once you build the agents.",
                            "status": "ready_for_workflow",
                            "next_steps": "Build your AI agents and establish the company workflow."
                        }
                
                # Create a single "idea" representing the user's intention to build agents
                user_idea = BusinessIdea(
                    title="User Building AI Agents",
                    description=welcome_data.get("message", "User is building AI agents for the company."),
                    revenue_model="AI Agent Services",
                    success_factors=welcome_data.get("next_steps", "Establish company workflow with built agents.")
                )
                
                self.log_activity('REST: Ready for user workflow', {
                    'status': welcome_data.get("status", "ready_for_workflow")
                })
                
                return IdeasResponse(ideas=[user_idea])
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error in wait endpoint: {str(e)}")
                # Return a default welcome message
                default_idea = BusinessIdea(
                    title="AI Company Setup",
                    description="Welcome! I'm ready to coordinate the AI agent workflow.",
                    revenue_model="AI Services",
                    success_factors="Build agents and establish company workflow."
                )
                return IdeasResponse(ideas=[default_idea])
        
        @self.agent.on_rest_post("/evaluate-product", EvaluateProduct, ProductEvaluation)
        async def handle_evaluate_product_rest(ctx: Context, req: EvaluateProduct) -> ProductEvaluation:
            """REST endpoint for product evaluation"""
            try:
                print(f"🧠 [{self.name}] REST: Evaluating product: {req.product_name}")
                
                prompt = f"""As a CEO, evaluate this product concept for market viability:

Product: {req.product_name}
Description: {req.product_description}
Features: {', '.join(req.features)}
Target Market: {json.dumps(req.target_market)}

Provide your assessment in JSON format:
{{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}}"""

                response = await self.call_asi_one(prompt, 1000)
                
                # Parse JSON response
                try:
                    evaluation_data = json.loads(response)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[\s\S]*\}', response)
                    if json_match:
                        evaluation_data = json.loads(json_match.group())
                    else:
                        raise ValueError("Could not parse JSON from response")
                
                evaluation = ProductEvaluation(**evaluation_data)
                
                self.log_activity('REST: Evaluated product', {
                    'product_name': req.product_name,
                    'viability_score': evaluation.viability_score,
                    'go_decision': evaluation.go_decision
                })
                
                return evaluation
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error evaluating product: {str(e)}")
                return ProductEvaluation(
                    viability_score=0,
                    market_potential="Low",
                    recommendations="Evaluation failed",
                    go_decision=False
                )

# Create the agent instance
ceo_agent = CEOuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting CEO uAgent on port {ceo_agent.port}")
    print(f"📍 Agent address: {ceo_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    ceo_agent.agent.run()
