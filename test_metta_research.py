"""
Test script for MeTTa-enhanced Research Agent
Tests the enhanced research capabilities with structured reasoning
"""

import requests
import json
import time

def test_metta_research_agent():
    """Test the MeTTa-enhanced Research Agent"""
    
    print("🧪 Testing MeTTa-enhanced Research Agent...")
    print("=" * 60)
    
    # Test cases
    test_ideas = [
        {
            "title": "AI-Powered Customer Service Platform",
            "description": "An AI platform that automates customer service with natural language processing",
            "revenue_model": "SaaS subscription model"
        },
        {
            "title": "Blockchain Payment Solution for SMEs",
            "description": "A blockchain-based payment platform specifically designed for small and medium enterprises",
            "revenue_model": "Transaction fees and premium features"
        },
        {
            "title": "AI Tutoring Platform for Students",
            "description": "Personalized AI tutoring platform that adapts to individual learning styles",
            "revenue_model": "Freemium model with premium features"
        }
    ]
    
    for i, idea in enumerate(test_ideas, 1):
        print(f"\n🔍 Test Case {i}: {idea['title']}")
        print("-" * 40)
        
        try:
            # Test MeTTa-enhanced research
            response = requests.post(
                'http://localhost:8009/research-idea-metta',
                json={"idea": idea},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"✅ Research completed successfully!")
                print(f"📊 Competitors found: {len(data.get('competitors', []))}")
                print(f"📈 Market analysis: {data.get('market_analysis', {}).get('growth_potential', 'Unknown')}")
                print(f"🎯 Target audience: {data.get('recommendations', {}).get('target_audience', 'Unknown')}")
                
                # Display MeTTa insights
                print(f"\n🧠 MeTTa Insights:")
                print(f"📚 Historical context: {data.get('historical_context', 'No context')[:100]}...")
                print(f"🔍 Similar research found: {len(data.get('similar_research', []))}")
                print(f"📊 Market patterns: {data.get('market_patterns', {})}")
                print(f"🎯 Success factors: {len(data.get('success_factors', []))}")
                
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {e}")
            print("💡 Make sure the MeTTa Research Agent is running on port 8009")
        
        print()
        time.sleep(2)  # Wait between tests

def test_similar_research_endpoint():
    """Test the similar research endpoint"""
    
    print("\n🔍 Testing Similar Research Endpoint...")
    print("=" * 50)
    
    test_idea = {
        "title": "AI-Powered Analytics Platform",
        "description": "An AI platform for business analytics and insights",
        "revenue_model": "SaaS subscription"
    }
    
    try:
        response = requests.post(
            'http://localhost:8009/find-similar-research',
            json={"idea": test_idea},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Similar research endpoint working!")
            print(f"🔍 Similar research found: {len(data.get('similar_research', []))}")
            print(f"📊 Market patterns: {data.get('market_patterns', {})}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")

def test_market_trend_analysis():
    """Test the market trend analysis endpoint"""
    
    print("\n📊 Testing Market Trend Analysis Endpoint...")
    print("=" * 50)
    
    test_idea = {
        "title": "Fintech Innovation Platform",
        "description": "A platform for financial technology innovation",
        "revenue_model": "Marketplace commission"
    }
    
    try:
        response = requests.post(
            'http://localhost:8009/market-trend-analysis',
            json={"idea": test_idea},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Market trend analysis endpoint working!")
            print(f"🏭 Industry insights: {data.get('industry_insights', {})}")
            print(f"📈 Market patterns: {data.get('market_patterns', {})}")
            print(f"🔄 Trends: {data.get('trends', 'No trends')}")
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")

def test_metta_knowledge_queries():
    """Test MeTTa knowledge graph queries directly"""
    
    print("\n🧠 Testing MeTTa Knowledge Graph Queries...")
    print("=" * 50)
    
    try:
        from ai_uagents.knowledge.business_knowledge import BusinessKnowledgeGraph
        from ai_uagents.knowledge.research_memory import ResearchMemorySystem
        
        # Test Business Knowledge Graph
        print("📚 Testing Business Knowledge Graph...")
        business_kg = BusinessKnowledgeGraph()
        
        # Test industry queries
        ai_insights = business_kg.get_industry_insights("AI")
        print(f"🤖 AI Industry Insights: {ai_insights}")
        
        fintech_insights = business_kg.get_industry_insights("Fintech")
        print(f"💰 Fintech Industry Insights: {fintech_insights}")
        
        # Test Research Memory System
        print("\n🧠 Testing Research Memory System...")
        memory_system = ResearchMemorySystem()
        
        # Test historical context
        ai_context = memory_system.get_historical_context("AI")
        print(f"📚 AI Historical Context: {ai_context[:100]}...")
        
        # Test similar research
        similar_research = memory_system.find_similar_research("AI")
        print(f"🔍 Similar AI Research: {len(similar_research)} found")
        
        # Test market patterns
        market_patterns = memory_system.analyze_market_patterns("AI")
        print(f"📊 AI Market Patterns: {market_patterns}")
        
        print("✅ MeTTa Knowledge Graph queries working!")
        
    except Exception as e:
        print(f"❌ Error testing MeTTa knowledge: {e}")

if __name__ == "__main__":
    print("🚀 MeTTa-Enhanced Research Agent Test Suite")
    print("=" * 60)
    
    # Test MeTTa knowledge graphs first
    test_metta_knowledge_queries()
    
    # Test the enhanced research agent
    test_metta_research_agent()
    
    # Test additional endpoints
    test_similar_research_endpoint()
    test_market_trend_analysis()
    
    print("\n🎉 MeTTa Research Agent testing completed!")
    print("=" * 60)
