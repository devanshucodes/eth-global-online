"""
Workflow Orchestrator uAgent for AI Company
Coordinates the complete business workflow across all agents
"""

import asyncio
import json
import requests
from typing import Dict, Any, List
from uagents import Context, Model
from base_uagent import BaseUAgent

class WorkflowRequest(Model):
    """Model for workflow request"""
    user_input: str
    idea_count: int = 3

class WorkflowResponse(Model):
    """Model for workflow response"""
    success: bool
    message: str
    data: Dict[str, Any] = None
    error: str = None

class OrchestratoruAgent(BaseUAgent):
    """Workflow Orchestrator uAgent for coordinating complete business workflow"""
    
    def __init__(self):
        super().__init__(
            name="Workflow Orchestrator",
            role="Coordinates complete business workflow across all agents",
            port=8008
        )
        self.agent_ports = {
            'ceo': 8001,
            'research': 8002,
            'product': 8003,
            'cmo': 8004,
            'cto': 8005,
            'head_engineering': 8006,
            'finance': 8007
        }
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=WorkflowRequest)
        async def handle_workflow_request(ctx: Context, sender: str, msg: WorkflowRequest):
            """Handle complete workflow request"""
            try:
                print(f"🎯 [{self.name}] Starting complete workflow for: {msg.user_input}")
                
                # Run the complete workflow
                workflow_result = await self.run_complete_workflow(msg.user_input, msg.idea_count)
                
                response = WorkflowResponse(
                    success=True,
                    message="Complete workflow executed successfully",
                    data=workflow_result
                )
                
                self.log_activity('Complete workflow executed', {
                    'user_input': msg.user_input,
                    'idea_count': msg.idea_count,
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error in workflow: {str(e)}")
                error_response = WorkflowResponse(
                    success=False,
                    message="Workflow execution failed",
                    error=str(e)
                )
                await ctx.send(sender, error_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/process-business-idea", WorkflowRequest, WorkflowResponse)
        async def handle_process_business_idea_rest(ctx: Context, req: WorkflowRequest) -> WorkflowResponse:
            """REST endpoint for processing business ideas through complete workflow"""
            try:
                print(f"🎯 [{self.name}] REST: Starting complete workflow for: {req.user_input}")
                
                # Run the complete workflow
                workflow_result = await self.run_complete_workflow(req.user_input, req.idea_count)
                
                response = WorkflowResponse(
                    success=True,
                    message="Complete workflow executed successfully",
                    data=workflow_result
                )
                
                self.log_activity('REST: Complete workflow executed', {
                    'user_input': req.user_input,
                    'idea_count': req.idea_count
                })
                
                return response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error in workflow: {str(e)}")
                return WorkflowResponse(
                    success=False,
                    message="Workflow execution failed",
                    error=str(e)
                )
    
    async def run_complete_workflow(self, user_input: str, idea_count: int = 3) -> Dict[str, Any]:
        """Run the complete business workflow"""
        print(f"🎯 [{self.name}] Starting complete workflow...")
        
        try:
            # Step 1: Use user input as business concept (no automatic idea generation)
            print(f"🎯 [{self.name}] Step 1: Using user business concept...")
            
            # Create a business concept from user input
            selected_idea = {
                "title": f"User Business: {user_input}",
                "description": f"Business concept provided by user: {user_input}",
                "revenue_model": "To be determined by workflow",
                "success_factors": "User-driven business development"
            }
            
            print(f"🎯 [{self.name}] Using user business concept: {selected_idea.get('title', 'Unknown')}")
            
            # Step 2: Research analyzes the idea
            print(f"🎯 [{self.name}] Step 2: Research analyzing market...")
            research_response = await self.call_research_agent(selected_idea)
            if not research_response:
                raise Exception("Research agent failed to analyze market")
            
            # Step 3: Product develops the concept
            print(f"🎯 [{self.name}] Step 3: Product developing concept...")
            product_response = await self.call_product_agent(selected_idea, research_response)
            if not product_response:
                raise Exception("Product agent failed to develop concept")
            
            # Step 4: CMO creates marketing strategy
            print(f"🎯 [{self.name}] Step 4: CMO creating marketing strategy...")
            marketing_response = await self.call_cmo_agent(selected_idea, product_response, research_response)
            if not marketing_response:
                raise Exception("CMO agent failed to create marketing strategy")
            
            # Step 5: CTO creates technical strategy
            print(f"🎯 [{self.name}] Step 5: CTO creating technical strategy...")
            technical_response = await self.call_cto_agent(selected_idea, product_response, research_response)
            if not technical_response:
                raise Exception("CTO agent failed to create technical strategy")
            
            # Step 6: Head of Engineering creates Bolt prompt
            print(f"🎯 [{self.name}] Step 6: Head of Engineering creating Bolt prompt...")
            bolt_response = await self.call_head_engineering_agent(
                selected_idea, product_response, research_response, 
                marketing_response, technical_response
            )
            if not bolt_response:
                raise Exception("Head of Engineering agent failed to create Bolt prompt")
            
            # Step 7: Finance analyzes revenue
            print(f"🎯 [{self.name}] Step 7: Finance analyzing revenue...")
            finance_response = await self.call_finance_agent(selected_idea, product_response)
            if not finance_response:
                raise Exception("Finance agent failed to analyze revenue")
            
            # Compile complete business plan
            complete_business_plan = {
                "workflow_summary": {
                    "user_input": user_input,
                    "selected_idea": selected_idea.get('title', 'Unknown'),
                    "workflow_status": "completed",
                    "timestamp": "2024-01-01T00:00:00Z"
                },
                "idea": selected_idea,
                "research": research_response,
                "product": product_response,
                "marketing": marketing_response,
                "technical": technical_response,
                "bolt_prompt": bolt_response,
                "finance": finance_response,
                "all_ideas": [selected_idea]
            }
            
            print(f"🎯 [{self.name}] Complete workflow finished successfully!")
            return complete_business_plan
            
        except Exception as e:
            print(f"❌ [{self.name}] Workflow failed at step: {str(e)}")
            raise e
    
    async def call_ceo_agent(self, idea_count: int) -> Dict[str, Any]:
        """Call CEO agent to generate business ideas"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['ceo']}/generate-ideas",
                json={"count": idea_count},
                timeout=90
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] CEO agent call failed: {e}")
            return None
    
    async def call_research_agent(self, idea: Dict[str, Any]) -> Dict[str, Any]:
        """Call MeTTa-enhanced Research agent to analyze market"""
        try:
            print(f"🧠 [{self.name}] Calling MeTTa-enhanced Research agent...")
            response = requests.post(
                "http://localhost:8009/research-idea-metta",
                json={"idea": idea},
                timeout=120
            )
            response.raise_for_status()
            metta_response = response.json()
            
            # Extract the core research data from MeTTa response
            research_data = {
                "competitors": metta_response.get("competitors", []),
                "market_analysis": metta_response.get("market_analysis", {}),
                "recommendations": metta_response.get("recommendations", {}),
                # Add MeTTa insights
                "metta_insights": {
                    "historical_context": metta_response.get("historical_context", ""),
                    "similar_research": metta_response.get("similar_research", []),
                    "market_patterns": metta_response.get("market_patterns", {}),
                    "success_factors": metta_response.get("success_factors", [])
                }
            }
            
            print(f"🧠 [{self.name}] MeTTa Research completed with {len(metta_response.get('similar_research', []))} similar studies found")
            return research_data
        except Exception as e:
            print(f"❌ [{self.name}] MeTTa Research agent call failed: {e}")
            return None
    
    async def call_product_agent(self, idea: Dict[str, Any], research: Dict[str, Any]) -> Dict[str, Any]:
        """Call Product agent to develop concept"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['product']}/develop-product",
                json={"idea": idea, "research": research},
                timeout=90
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] Product agent call failed: {e}")
            return None
    
    async def call_cmo_agent(self, idea: Dict[str, Any], product: Dict[str, Any], research: Dict[str, Any]) -> Dict[str, Any]:
        """Call CMO agent to create marketing strategy"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['cmo']}/develop-marketing",
                json={"idea": idea, "product": product, "research": research},
                timeout=90
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] CMO agent call failed: {e}")
            return None
    
    async def call_cto_agent(self, idea: Dict[str, Any], product: Dict[str, Any], research: Dict[str, Any]) -> Dict[str, Any]:
        """Call CTO agent to create technical strategy"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['cto']}/develop-technical",
                json={"idea": idea, "product": product, "research": research},
                timeout=120
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] CTO agent call failed: {e}")
            return None
    
    async def call_head_engineering_agent(self, idea: Dict[str, Any], product: Dict[str, Any], 
                                        research: Dict[str, Any], marketing: Dict[str, Any], 
                                        technical: Dict[str, Any]) -> Dict[str, Any]:
        """Call Head of Engineering agent to create Bolt prompt"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['head_engineering']}/create-bolt-prompt",
                json={
                    "idea": idea, 
                    "product": product, 
                    "research": research, 
                    "marketing_strategy": marketing, 
                    "technical_strategy": technical
                },
                timeout=120
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] Head of Engineering agent call failed: {e}")
            return None
    
    async def call_finance_agent(self, idea: Dict[str, Any], product: Dict[str, Any]) -> Dict[str, Any]:
        """Call Finance agent to analyze revenue"""
        try:
            response = requests.post(
                f"http://localhost:{self.agent_ports['finance']}/analyze-revenue",
                json={"idea_data": idea, "product_data": product},
                timeout=90
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ [{self.name}] Finance agent call failed: {e}")
            return None

# Create the agent instance
orchestrator_agent = OrchestratoruAgent()

if __name__ == "__main__":
    print(f"🚀 Starting Workflow Orchestrator uAgent on port {orchestrator_agent.port}")
    print(f"📍 Agent address: {orchestrator_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    print(f"🎯 Orchestrating workflow across {len(orchestrator_agent.agent_ports)} agents")
    orchestrator_agent.agent.run()
