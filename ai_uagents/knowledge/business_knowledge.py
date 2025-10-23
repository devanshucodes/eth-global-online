"""
Business Intelligence Knowledge Graph using MeTTa
Stores structured business knowledge for intelligent research
"""

from hyperon import MeTTa, S, E, V, ValueAtom
from typing import Dict, List, Any, Optional
import json

class BusinessKnowledgeGraph:
    """MeTTa-based knowledge graph for business intelligence"""
    
    def __init__(self):
        self.metta = MeTTa()
        self.initialize_business_knowledge()
        print("🧠 [KNOWLEDGE] Business Knowledge Graph initialized")
    
    def initialize_business_knowledge(self):
        """Initialize the business knowledge graph with core business data"""
        
        # Industry Knowledge
        self._add_industry_data()
        
        # Business Model Knowledge  
        self._add_business_model_data()
        
        # Technology Knowledge
        self._add_technology_data()
        
        # Market Segment Knowledge
        self._add_market_segment_data()
        
        # Success Factor Knowledge
        self._add_success_factors()
        
        print("🧠 [KNOWLEDGE] Core business knowledge loaded")
    
    def _add_industry_data(self):
        """Add industry-specific knowledge"""
        # AI Industry
        self.metta.space().add_atom(E(S("industry"), S("AI"), S("market_size"), ValueAtom("$50B")))
        self.metta.space().add_atom(E(S("industry"), S("AI"), S("growth_rate"), ValueAtom("25%")))
        self.metta.space().add_atom(E(S("industry"), S("AI"), S("key_players"), ValueAtom("OpenAI, Anthropic, Google, Microsoft")))
        self.metta.space().add_atom(E(S("industry"), S("AI"), S("trends"), ValueAtom("LLMs, Agentic AI, Multimodal AI")))
        
        # Fintech Industry
        self.metta.space().add_atom(E(S("industry"), S("Fintech"), S("market_size"), ValueAtom("$310B")))
        self.metta.space().add_atom(E(S("industry"), S("Fintech"), S("growth_rate"), S("15%")))
        self.metta.space().add_atom(E(S("industry"), S("Fintech"), S("key_players"), ValueAtom("Stripe, PayPal, Square, Coinbase")))
        self.metta.space().add_atom(E(S("industry"), S("Fintech"), S("trends"), ValueAtom("Digital payments, DeFi, Embedded finance")))
        
        # SaaS Industry
        self.metta.space().add_atom(E(S("industry"), S("SaaS"), S("market_size"), ValueAtom("$720B")))
        self.metta.space().add_atom(E(S("industry"), S("SaaS"), S("growth_rate"), ValueAtom("18%")))
        self.metta.space().add_atom(E(S("industry"), S("SaaS"), S("key_players"), ValueAtom("Salesforce, Microsoft, Adobe, ServiceNow")))
        self.metta.space().add_atom(E(S("industry"), S("SaaS"), S("trends"), ValueAtom("Vertical SaaS, AI integration, Low-code")))
        
        # EdTech Industry
        self.metta.space().add_atom(E(S("industry"), S("EdTech"), S("market_size"), ValueAtom("$340B")))
        self.metta.space().add_atom(E(S("industry"), S("EdTech"), S("growth_rate"), ValueAtom("16%")))
        self.metta.space().add_atom(E(S("industry"), S("EdTech"), S("key_players"), ValueAtom("Coursera, Khan Academy, Duolingo, Udemy")))
        self.metta.space().add_atom(E(S("industry"), S("EdTech"), S("trends"), ValueAtom("Personalized learning, AI tutoring, VR education")))
    
    def _add_business_model_data(self):
        """Add business model knowledge"""
        # SaaS Model
        self.metta.space().add_atom(E(S("business_model"), S("SaaS"), S("revenue_model"), ValueAtom("Subscription")))
        self.metta.space().add_atom(E(S("business_model"), S("SaaS"), S("key_metrics"), ValueAtom("MRR, Churn, LTV, CAC")))
        self.metta.space().add_atom(E(S("business_model"), S("SaaS"), S("success_factors"), ValueAtom("Product-market fit, Customer success, Scalable infrastructure")))
        
        # Marketplace Model
        self.metta.space().add_atom(E(S("business_model"), S("Marketplace"), S("revenue_model"), ValueAtom("Commission")))
        self.metta.space().add_atom(E(S("business_model"), S("Marketplace"), S("key_metrics"), ValueAtom("GMV, Take rate, Network effects")))
        self.metta.space().add_atom(E(S("business_model"), S("Marketplace"), S("success_factors"), ValueAtom("Two-sided network, Trust, Liquidity")))
        
        # Freemium Model
        self.metta.space().add_atom(E(S("business_model"), S("Freemium"), S("revenue_model"), ValueAtom("Freemium + Premium")))
        self.metta.space().add_atom(E(S("business_model"), S("Freemium"), S("key_metrics"), ValueAtom("Conversion rate, Free users, Premium features")))
        self.metta.space().add_atom(E(S("business_model"), S("Freemium"), S("success_factors"), ValueAtom("Value differentiation, User engagement, Viral growth")))
    
    def _add_technology_data(self):
        """Add technology knowledge"""
        # AI Technologies
        self.metta.space().add_atom(E(S("technology"), S("LLMs"), S("adoption_rate"), ValueAtom("High")))
        self.metta.space().add_atom(E(S("technology"), S("LLMs"), S("market_impact"), ValueAtom("Revolutionary")))
        self.metta.space().add_atom(E(S("technology"), S("LLMs"), S("use_cases"), ValueAtom("Content generation, Customer service, Code assistance")))
        
        # Blockchain Technologies
        self.metta.space().add_atom(E(S("technology"), S("Blockchain"), S("adoption_rate"), ValueAtom("Medium")))
        self.metta.space().add_atom(E(S("technology"), S("Blockchain"), S("market_impact"), ValueAtom("Disruptive")))
        self.metta.space().add_atom(E(S("technology"), S("Blockchain"), S("use_cases"), ValueAtom("DeFi, NFTs, Supply chain, Identity")))
        
        # Cloud Technologies
        self.metta.space().add_atom(E(S("technology"), S("Cloud"), S("adoption_rate"), ValueAtom("Very High")))
        self.metta.space().add_atom(E(S("technology"), S("Cloud"), S("market_impact"), ValueAtom("Infrastructure")))
        self.metta.space().add_atom(E(S("technology"), S("Cloud"), S("use_cases"), ValueAtom("Scalable computing, Storage, AI services")))
    
    def _add_market_segment_data(self):
        """Add market segment knowledge"""
        # B2B Segment
        self.metta.space().add_atom(E(S("market_segment"), S("B2B"), S("target_audience"), ValueAtom("Enterprises, SMBs")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2B"), S("pain_points"), ValueAtom("Efficiency, Cost reduction, Scalability")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2B"), S("sales_cycle"), ValueAtom("Long")))
        
        # B2C Segment
        self.metta.space().add_atom(E(S("market_segment"), S("B2C"), S("target_audience"), ValueAtom("Individual consumers")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2C"), S("pain_points"), ValueAtom("Convenience, Personalization, Value")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2C"), S("sales_cycle"), ValueAtom("Short")))
        
        # B2B2C Segment
        self.metta.space().add_atom(E(S("market_segment"), S("B2B2C"), S("target_audience"), ValueAtom("Businesses serving consumers")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2B2C"), S("pain_points"), ValueAtom("Integration, White-label, Customer experience")))
        self.metta.space().add_atom(E(S("market_segment"), S("B2B2C"), S("sales_cycle"), ValueAtom("Medium")))
    
    def _add_success_factors(self):
        """Add success factors knowledge"""
        # AI Company Success Factors
        self.metta.space().add_atom(E(S("success_factor"), S("AI_company"), S("talent"), ValueAtom("AI researchers, ML engineers")))
        self.metta.space().add_atom(E(S("success_factor"), S("AI_company"), S("data"), ValueAtom("High-quality training data")))
        self.metta.space().add_atom(E(S("success_factor"), S("AI_company"), S("infrastructure"), ValueAtom("GPU clusters, Cloud computing")))
        self.metta.space().add_atom(E(S("success_factor"), S("AI_company"), S("regulatory"), ValueAtom("AI safety, Privacy compliance")))
        
        # SaaS Success Factors
        self.metta.space().add_atom(E(S("success_factor"), S("SaaS_company"), S("product"), ValueAtom("User experience, Feature completeness")))
        self.metta.space().add_atom(E(S("success_factor"), S("SaaS_company"), S("sales"), ValueAtom("Inbound marketing, Customer success")))
        self.metta.space().add_atom(E(S("success_factor"), S("SaaS_company"), S("engineering"), ValueAtom("Scalability, Reliability, Security")))
    
    def query_industry_info(self, industry: str) -> Dict[str, Any]:
        """Query information about a specific industry"""
        try:
            # Try different query patterns
            query_patterns = [
                f'!(match &self (industry {industry} $property $value) $property $value)',
                f'!(match &self (industry "{industry}" $property $value) $property $value)',
                f'!(match &self (industry {industry} $property $value))'
            ]
            
            industry_info = {}
            
            for query_str in query_patterns:
                try:
                    results = self.metta.run(query_str)
                    if results and len(results) > 0 and results[0]:
                        for result in results[0]:
                            try:
                                if hasattr(result, '__len__') and len(result) >= 2:
                                    property_name = str(result[0])
                                    value = str(result[1])
                                    industry_info[property_name] = value
                                elif hasattr(result, 'get_children'):
                                    children = result.get_children()
                                    if len(children) >= 2:
                                        property_name = str(children[0])
                                        value = str(children[1])
                                        industry_info[property_name] = value
                            except Exception as parse_error:
                                continue
                        break  # If we got results, break out of query patterns
                except Exception as query_error:
                    continue
            
            return industry_info
        except Exception as e:
            print(f"❌ [KNOWLEDGE] Error querying industry {industry}: {e}")
            return {}
    
    def query_business_model_info(self, business_model: str) -> Dict[str, Any]:
        """Query information about a business model"""
        try:
            query_str = f'!(match &self (business_model {business_model} $property $value) $property $value)'
            results = self.metta.run(query_str)
            
            model_info = {}
            if results and len(results) > 0:
                for result in results[0]:
                    try:
                        if hasattr(result, '__len__') and len(result) >= 2:
                            property_name = str(result[0])
                            value = str(result[1])
                            model_info[property_name] = value
                        elif hasattr(result, 'get_children'):
                            children = result.get_children()
                            if len(children) >= 2:
                                property_name = str(children[0])
                                value = str(children[1])
                                model_info[property_name] = value
                    except Exception as parse_error:
                        continue
            
            return model_info
        except Exception as e:
            print(f"❌ [KNOWLEDGE] Error querying business model {business_model}: {e}")
            return {}
    
    def query_success_factors(self, company_type: str) -> List[str]:
        """Query success factors for a company type using direct lookup"""
        # Direct lookup for success factors
        success_factors_data = {
            "AI_company": [
                "talent: AI researchers, ML engineers",
                "data: High-quality training data",
                "infrastructure: GPU clusters, Cloud computing",
                "regulatory: AI safety, Privacy compliance"
            ],
            "SaaS_company": [
                "product: User experience, Feature completeness",
                "sales: Inbound marketing, Customer success",
                "engineering: Scalability, Reliability, Security"
            ],
            "Fintech_company": [
                "compliance: Regulatory adherence, Security protocols",
                "trust: User confidence, Transparency",
                "technology: Secure infrastructure, API reliability"
            ],
            "EdTech_company": [
                "content: Quality educational materials, Curriculum alignment",
                "engagement: Student motivation, Interactive features",
                "accessibility: User-friendly interface, Multi-device support"
            ]
        }
        
        return success_factors_data.get(company_type, [
            "Focus on user needs",
            "Build strong team", 
            "Iterate quickly",
            "Maintain quality"
        ])
    
    def add_research_finding(self, idea_title: str, industry: str, findings: Dict[str, Any]):
        """Add new research findings to the knowledge graph"""
        try:
            # Add research record
            self.metta.space().add_atom(E(S("research"), ValueAtom(idea_title), S("industry"), S(industry)))
            self.metta.space().add_atom(E(S("research"), ValueAtom(idea_title), S("timestamp"), ValueAtom(str(findings.get("timestamp", "")))))
            
            # Add findings
            for key, value in findings.items():
                if key != "timestamp":
                    self.metta.space().add_atom(E(S("research"), ValueAtom(idea_title), S(key), ValueAtom(str(value))))
            
            print(f"🧠 [KNOWLEDGE] Added research findings for: {idea_title}")
        except Exception as e:
            print(f"❌ [KNOWLEDGE] Error adding research finding: {e}")
    
    def find_similar_research(self, industry: str) -> List[str]:
        """Find similar research in the same industry"""
        try:
            query_str = f'!(match &self (research $idea industry {industry}) $idea)'
            results = self.metta.run(query_str)
            
            similar_ideas = []
            if results:
                for result in results[0]:
                    if result:
                        similar_ideas.append(str(result[0]))
            
            return similar_ideas
        except Exception as e:
            print(f"❌ [KNOWLEDGE] Error finding similar research: {e}")
            return []
    
    def get_market_trends(self, industry: str) -> str:
        """Get market trends for an industry"""
        industry_info = self.query_industry_info(industry)
        return industry_info.get("trends", "No trend data available")
    
    def get_industry_insights(self, industry: str) -> Dict[str, str]:
        """Get comprehensive industry insights using direct lookup"""
        # Direct lookup for known industries
        industry_data = {
            "AI": {
                "market_size": "$50B",
                "growth_rate": "25%",
                "key_players": "OpenAI, Anthropic, Google, Microsoft",
                "trends": "LLMs, Agentic AI, Multimodal AI"
            },
            "Fintech": {
                "market_size": "$310B",
                "growth_rate": "15%",
                "key_players": "Stripe, PayPal, Square, Coinbase",
                "trends": "Digital payments, DeFi, Embedded finance"
            },
            "SaaS": {
                "market_size": "$720B",
                "growth_rate": "18%",
                "key_players": "Salesforce, Microsoft, Adobe, ServiceNow",
                "trends": "Vertical SaaS, AI integration, Low-code"
            },
            "EdTech": {
                "market_size": "$340B",
                "growth_rate": "16%",
                "key_players": "Coursera, Khan Academy, Duolingo, Udemy",
                "trends": "Personalized learning, AI tutoring, VR education"
            }
        }
        
        return industry_data.get(industry, {
            "market_size": "Unknown",
            "growth_rate": "Unknown", 
            "key_players": "Unknown",
            "trends": "No trend data available"
        })
