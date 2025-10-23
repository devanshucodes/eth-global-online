"""
CTO uAgent for AI Company
Develops technical architecture and development strategy
"""

import json
import re
from typing import List, Dict, Any
from uagents import Context, Model
from base_uagent import BaseUAgent

class TechnicalRequest(Model):
    """Model for technical strategy request"""
    idea: Dict[str, str]
    product: Dict[str, Any]
    research: Dict[str, Any]

class TechnologyStack(Model):
    """Model for technology stack"""
    frontend: List[str]
    backend: List[str]
    database: str
    cloud_platform: str
    ai_ml: List[str]

class Architecture(Model):
    """Model for system architecture"""
    overview: str
    components: List[str]
    data_flow: str
    api_design: str

class DevelopmentMethodology(Model):
    """Model for development methodology"""
    approach: str
    sprints: str
    tools: List[str]
    version_control: str

class SecurityCompliance(Model):
    """Model for security and compliance"""
    security_measures: List[str]
    compliance_requirements: List[str]
    data_protection: str
    authentication: str

class Scalability(Model):
    """Model for scalability strategy"""
    performance_targets: str
    scaling_strategy: str
    monitoring: str
    load_balancing: str

class Integrations(Model):
    """Model for integrations"""
    third_party: List[str]
    apis: str
    data_sources: str

class TimelinePhase(Model):
    """Model for timeline phase"""
    phase: str
    duration: str
    deliverables: List[str]

class Timeline(Model):
    """Model for development timeline"""
    phases: List[TimelinePhase]
    total_duration: str
    milestones: List[str]

class TeamStructure(Model):
    """Model for team structure"""
    roles_needed: List[str]
    team_size: str
    hiring_priority: List[str]

class Infrastructure(Model):
    """Model for infrastructure requirements"""
    hosting: str
    cdn: str
    backup: str
    monitoring: str

class QualityAssurance(Model):
    """Model for quality assurance"""
    testing_strategy: str
    automation: str
    performance_testing: str
    security_testing: str

class TechnicalResponse(Model):
    """Model for technical response"""
    technology_stack: TechnologyStack
    architecture: Architecture
    development_methodology: DevelopmentMethodology
    security_compliance: SecurityCompliance
    scalability: Scalability
    integrations: Integrations
    timeline: Timeline
    team_structure: TeamStructure
    infrastructure: Infrastructure
    quality_assurance: QualityAssurance

class CTOuAgent(BaseUAgent):
    """CTO uAgent for technical architecture and development strategy"""
    
    def __init__(self):
        super().__init__(
            name="CTO Agent",
            role="Technical architecture and development strategy",
            port=8005
        )
        self.setup_handlers()
    
    def setup_handlers(self):
        """Setup message handlers for the agent"""
        
        @self.agent.on_message(model=TechnicalRequest)
        async def handle_technical_request(ctx: Context, sender: str, msg: TechnicalRequest):
            """Develop technical strategy for a product"""
            try:
                print(f"⚙️ [{self.name}] Developing technical strategy for: {msg.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Chief Technology Officer, develop a comprehensive technical strategy for this product:

Product Details:
Name: {msg.product.get('product_name', 'Unknown')}
Description: {msg.product.get('product_description', 'No description')}
Features: {json.dumps(msg.product.get('core_features', []))}
Target Market: {json.dumps(msg.product.get('target_market', {}))}

Research Data:
Market Size: {msg.research.get('market_analysis', {}).get('market_size', 'Not available')}
Competitors: {json.dumps(msg.research.get('competitors', []))}
Key Challenges: {json.dumps(msg.research.get('market_analysis', {}).get('key_challenges', []))}

Create a comprehensive technical strategy including:

1. Technology stack recommendations
2. System architecture design
3. Development methodology
4. Security and compliance requirements
5. Scalability and performance planning
6. Integration requirements
7. Development timeline and milestones
8. Team structure and hiring needs
9. Infrastructure requirements
10. Quality assurance strategy

Format your response as JSON:
{{
  "technology_stack": {{
    "frontend": ["Technology 1", "Technology 2"],
    "backend": ["Technology 1", "Technology 2"],
    "database": "Database technology",
    "cloud_platform": "Cloud provider",
    "ai_ml": ["AI/ML technology 1", "AI/ML technology 2"]
  }},
  "architecture": {{
    "overview": "High-level system architecture",
    "components": ["Component 1", "Component 2", "Component 3"],
    "data_flow": "How data flows through the system",
    "api_design": "API strategy and design"
  }},
  "development_methodology": {{
    "approach": "Agile/Waterfall/Other",
    "sprints": "Sprint duration and planning",
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "version_control": "Git strategy"
  }},
  "security_compliance": {{
    "security_measures": ["Measure 1", "Measure 2"],
    "compliance_requirements": ["Requirement 1", "Requirement 2"],
    "data_protection": "Data protection strategy",
    "authentication": "Authentication approach"
  }},
  "scalability": {{
    "performance_targets": "Performance goals",
    "scaling_strategy": "How to scale the system",
    "monitoring": "Monitoring and alerting strategy",
    "load_balancing": "Load balancing approach"
  }},
  "integrations": {{
    "third_party": ["Integration 1", "Integration 2"],
    "apis": "API integration strategy",
    "data_sources": "External data sources"
  }},
  "timeline": {{
    "phases": [
      {{
        "phase": "Phase 1",
        "duration": "Duration",
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }}
    ],
    "total_duration": "Total development time",
    "milestones": ["Milestone 1", "Milestone 2"]
  }},
  "team_structure": {{
    "roles_needed": ["Role 1", "Role 2", "Role 3"],
    "team_size": "Recommended team size",
    "hiring_priority": ["Priority 1", "Priority 2"]
  }},
  "infrastructure": {{
    "hosting": "Hosting requirements",
    "cdn": "CDN strategy",
    "backup": "Backup and disaster recovery",
    "monitoring": "Infrastructure monitoring"
  }},
  "quality_assurance": {{
    "testing_strategy": "Testing approach",
    "automation": "Test automation strategy",
    "performance_testing": "Performance testing plan",
    "security_testing": "Security testing approach"
  }}
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
                
                # Convert to response models with validation
                tech_stack_data = strategy_data.get('technology_stack', {})
                # Ensure database is a string
                if 'database' in tech_stack_data and not isinstance(tech_stack_data['database'], str):
                    tech_stack_data['database'] = str(tech_stack_data['database'])
                technology_stack = TechnologyStack(**tech_stack_data)
                architecture = Architecture(**strategy_data.get('architecture', {}))
                development_methodology = DevelopmentMethodology(**strategy_data.get('development_methodology', {}))
                security_compliance = SecurityCompliance(**strategy_data.get('security_compliance', {}))
                scalability = Scalability(**strategy_data.get('scalability', {}))
                integrations = Integrations(**strategy_data.get('integrations', {}))
                timeline_phases = [TimelinePhase(**phase) for phase in strategy_data.get('timeline', {}).get('phases', [])]
                timeline = Timeline(
                    phases=timeline_phases,
                    total_duration=strategy_data.get('timeline', {}).get('total_duration', ''),
                    milestones=strategy_data.get('timeline', {}).get('milestones', [])
                )
                team_structure = TeamStructure(**strategy_data.get('team_structure', {}))
                infrastructure = Infrastructure(**strategy_data.get('infrastructure', {}))
                quality_assurance = QualityAssurance(**strategy_data.get('quality_assurance', {}))
                
                technical_response = TechnicalResponse(
                    technology_stack=technology_stack,
                    architecture=architecture,
                    development_methodology=development_methodology,
                    security_compliance=security_compliance,
                    scalability=scalability,
                    integrations=integrations,
                    timeline=timeline,
                    team_structure=team_structure,
                    infrastructure=infrastructure,
                    quality_assurance=quality_assurance
                )
                
                self.log_activity('Developed technical strategy', {
                    'product_name': msg.product.get('product_name', 'Unknown'),
                    'tech_stack_count': len(technology_stack.frontend) + len(technology_stack.backend),
                    'sender': sender
                })
                
                # Send response back
                await ctx.send(sender, technical_response)
                
            except Exception as e:
                print(f"❌ [{self.name}] Error developing technical strategy: {str(e)}")
                # Send error response with fallback data
                fallback_response = self.get_fallback_technical_response()
                await ctx.send(sender, fallback_response)
        
        # REST endpoints for Node.js server integration
        @self.agent.on_rest_post("/develop-technical", TechnicalRequest, TechnicalResponse)
        async def handle_develop_technical_rest(ctx: Context, req: TechnicalRequest) -> TechnicalResponse:
            """REST endpoint for developing technical strategies"""
            try:
                print(f"⚙️ [{self.name}] REST: Developing technical strategy for: {req.product.get('product_name', 'Unknown')}")
                
                prompt = f"""As a Chief Technology Officer, develop a comprehensive technical strategy for this product:

Product Details:
Name: {req.product.get('product_name', 'Unknown')}
Description: {req.product.get('product_description', 'No description')}
Features: {json.dumps(req.product.get('core_features', []))}
Target Market: {json.dumps(req.product.get('target_market', {}))}

Research Data:
Market Size: {req.research.get('market_analysis', {}).get('market_size', 'Not available')}
Competitors: {json.dumps(req.research.get('competitors', []))}
Key Challenges: {json.dumps(req.research.get('market_analysis', {}).get('key_challenges', []))}

Create a comprehensive technical strategy including:

1. Technology stack recommendations
2. System architecture design
3. Development methodology
4. Security and compliance requirements
5. Scalability and performance planning
6. Integration requirements
7. Development timeline and milestones
8. Team structure and hiring needs
9. Infrastructure requirements
10. Quality assurance strategy

Format your response as JSON:
{{
  "technology_stack": {{
    "frontend": ["Technology 1", "Technology 2"],
    "backend": ["Technology 1", "Technology 2"],
    "database": "Database technology",
    "cloud_platform": "Cloud provider",
    "ai_ml": ["AI/ML technology 1", "AI/ML technology 2"]
  }},
  "architecture": {{
    "overview": "High-level system architecture",
    "components": ["Component 1", "Component 2", "Component 3"],
    "data_flow": "How data flows through the system",
    "api_design": "API strategy and design"
  }},
  "development_methodology": {{
    "approach": "Agile/Waterfall/Other",
    "sprints": "Sprint duration and planning",
    "tools": ["Tool 1", "Tool 2", "Tool 3"],
    "version_control": "Git strategy"
  }},
  "security_compliance": {{
    "security_measures": ["Measure 1", "Measure 2"],
    "compliance_requirements": ["Requirement 1", "Requirement 2"],
    "data_protection": "Data protection strategy",
    "authentication": "Authentication approach"
  }},
  "scalability": {{
    "performance_targets": "Performance goals",
    "scaling_strategy": "How to scale the system",
    "monitoring": "Monitoring and alerting strategy",
    "load_balancing": "Load balancing approach"
  }},
  "integrations": {{
    "third_party": ["Integration 1", "Integration 2"],
    "apis": "API integration strategy",
    "data_sources": "External data sources"
  }},
  "timeline": {{
    "phases": [
      {{
        "phase": "Phase 1",
        "duration": "Duration",
        "deliverables": ["Deliverable 1", "Deliverable 2"]
      }}
    ],
    "total_duration": "Total development time",
    "milestones": ["Milestone 1", "Milestone 2"]
  }},
  "team_structure": {{
    "roles_needed": ["Role 1", "Role 2", "Role 3"],
    "team_size": "Recommended team size",
    "hiring_priority": ["Priority 1", "Priority 2"]
  }},
  "infrastructure": {{
    "hosting": "Hosting requirements",
    "cdn": "CDN strategy",
    "backup": "Backup and disaster recovery",
    "monitoring": "Infrastructure monitoring"
  }},
  "quality_assurance": {{
    "testing_strategy": "Testing approach",
    "automation": "Test automation strategy",
    "performance_testing": "Performance testing plan",
    "security_testing": "Security testing approach"
  }}
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
                
                # Convert to response models with validation
                tech_stack_data = strategy_data.get('technology_stack', {})
                # Ensure database is a string
                if 'database' in tech_stack_data and not isinstance(tech_stack_data['database'], str):
                    tech_stack_data['database'] = str(tech_stack_data['database'])
                technology_stack = TechnologyStack(**tech_stack_data)
                architecture = Architecture(**strategy_data.get('architecture', {}))
                development_methodology = DevelopmentMethodology(**strategy_data.get('development_methodology', {}))
                security_compliance = SecurityCompliance(**strategy_data.get('security_compliance', {}))
                scalability = Scalability(**strategy_data.get('scalability', {}))
                integrations = Integrations(**strategy_data.get('integrations', {}))
                timeline_phases = [TimelinePhase(**phase) for phase in strategy_data.get('timeline', {}).get('phases', [])]
                timeline = Timeline(
                    phases=timeline_phases,
                    total_duration=strategy_data.get('timeline', {}).get('total_duration', ''),
                    milestones=strategy_data.get('timeline', {}).get('milestones', [])
                )
                team_structure = TeamStructure(**strategy_data.get('team_structure', {}))
                infrastructure = Infrastructure(**strategy_data.get('infrastructure', {}))
                quality_assurance = QualityAssurance(**strategy_data.get('quality_assurance', {}))
                
                technical_response = TechnicalResponse(
                    technology_stack=technology_stack,
                    architecture=architecture,
                    development_methodology=development_methodology,
                    security_compliance=security_compliance,
                    scalability=scalability,
                    integrations=integrations,
                    timeline=timeline,
                    team_structure=team_structure,
                    infrastructure=infrastructure,
                    quality_assurance=quality_assurance
                )
                
                self.log_activity('REST: Developed technical strategy', {
                    'product_name': req.product.get('product_name', 'Unknown'),
                    'tech_stack_count': len(technology_stack.frontend) + len(technology_stack.backend)
                })
                
                return technical_response
                
            except Exception as e:
                print(f"❌ [{self.name}] REST: Error developing technical strategy: {str(e)}")
                return self.get_fallback_technical_response()
    
    def get_fallback_strategy_data(self) -> Dict[str, Any]:
        """Get fallback strategy data when API fails"""
        return {
            "technology_stack": {
                "frontend": ["React", "TypeScript", "Tailwind CSS"],
                "backend": ["Node.js", "Express", "TypeScript"],
                "database": "PostgreSQL",
                "cloud_platform": "AWS",
                "ai_ml": ["OpenAI API", "TensorFlow", "PyTorch"]
            },
            "architecture": {
                "overview": "Microservices architecture with API gateway",
                "components": ["Frontend", "Backend API", "Database", "AI Service"],
                "data_flow": "RESTful API communication between services",
                "api_design": "RESTful API with OpenAPI documentation"
            },
            "development_methodology": {
                "approach": "Agile with 2-week sprints",
                "sprints": "2-week sprints with daily standups",
                "tools": ["Git", "GitHub", "Jira", "Docker"],
                "version_control": "Git with feature branching"
            },
            "security_compliance": {
                "security_measures": ["HTTPS", "JWT Authentication", "Input validation"],
                "compliance_requirements": ["GDPR", "SOC 2"],
                "data_protection": "End-to-end encryption",
                "authentication": "OAuth 2.0 with JWT tokens"
            },
            "scalability": {
                "performance_targets": "99.9% uptime, <200ms response time",
                "scaling_strategy": "Horizontal scaling with load balancers",
                "monitoring": "Prometheus and Grafana",
                "load_balancing": "Application Load Balancer"
            },
            "integrations": {
                "third_party": ["Payment Gateway", "Email Service", "Analytics"],
                "apis": "RESTful API for third-party integrations",
                "data_sources": "External APIs and databases"
            },
            "timeline": {
                "phases": [
                    {
                        "phase": "MVP Development",
                        "duration": "3 months",
                        "deliverables": ["Core features", "Basic UI", "API"]
                    },
                    {
                        "phase": "Enhancement",
                        "duration": "2 months",
                        "deliverables": ["Advanced features", "Performance optimization"]
                    }
                ],
                "total_duration": "5 months",
                "milestones": ["MVP Launch", "Beta Release", "Full Launch"]
            },
            "team_structure": {
                "roles_needed": ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"],
                "team_size": "4-6 developers",
                "hiring_priority": ["Senior Backend Developer", "DevOps Engineer"]
            },
            "infrastructure": {
                "hosting": "AWS EC2 with Auto Scaling",
                "cdn": "CloudFront for static assets",
                "backup": "Daily automated backups",
                "monitoring": "CloudWatch and custom monitoring"
            },
            "quality_assurance": {
                "testing_strategy": "Unit, Integration, and E2E testing",
                "automation": "Automated testing pipeline with CI/CD",
                "performance_testing": "Load testing with realistic data",
                "security_testing": "Regular security audits and penetration testing"
            }
        }
    
    def get_fallback_technical_response(self) -> TechnicalResponse:
        """Get fallback technical response"""
        fallback_data = self.get_fallback_strategy_data()
        return TechnicalResponse(
            technology_stack=TechnologyStack(**fallback_data['technology_stack']),
            architecture=Architecture(**fallback_data['architecture']),
            development_methodology=DevelopmentMethodology(**fallback_data['development_methodology']),
            security_compliance=SecurityCompliance(**fallback_data['security_compliance']),
            scalability=Scalability(**fallback_data['scalability']),
            integrations=Integrations(**fallback_data['integrations']),
            timeline=Timeline(
                phases=[TimelinePhase(**phase) for phase in fallback_data['timeline']['phases']],
                total_duration=fallback_data['timeline']['total_duration'],
                milestones=fallback_data['timeline']['milestones']
            ),
            team_structure=TeamStructure(**fallback_data['team_structure']),
            infrastructure=Infrastructure(**fallback_data['infrastructure']),
            quality_assurance=QualityAssurance(**fallback_data['quality_assurance'])
        )

# Create the agent instance
cto_agent = CTOuAgent()

if __name__ == "__main__":
    print(f"🚀 Starting CTO uAgent on port {cto_agent.port}")
    print(f"📍 Agent address: {cto_agent.get_agent_address()}")
    print(f"🌐 Agentverse registration: Enabled")
    cto_agent.agent.run()
