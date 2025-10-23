#!/usr/bin/env python3
"""
Test script for Phase 1 uAgents (CEO, Research, Product)
Tests individual functionality and REST endpoints
"""

import asyncio
import sys
import os
import requests
import json
sys.path.append('.')

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_uagents'))

from ceo_uagent import ceo_agent, GenerateIdeas, IdeasResponse
from research_uagent import research_agent, ResearchRequest, ResearchResponse
from product_uagent import product_agent, ProductRequest, ProductResponse

async def test_individual_uagents():
    """Test individual uAgent functionality"""
    print("🧪 Testing individual uAgent functionality...")
    print()
    
    # Test 1: CEO uAgent
    print("Test 1: CEO uAgent")
    try:
        response = await ceo_agent.call_asi_one("Hello, please respond with 'CEO uAgent test successful'")
        print(f"✅ CEO uAgent ASI:One integration working!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ CEO uAgent failed: {e}")
    print()
    
    # Test 2: Research uAgent
    print("Test 2: Research uAgent")
    try:
        response = await research_agent.call_asi_one("Hello, please respond with 'Research uAgent test successful'")
        print(f"✅ Research uAgent ASI:One integration working!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ Research uAgent failed: {e}")
    print()
    
    # Test 3: Product uAgent
    print("Test 3: Product uAgent")
    try:
        response = await product_agent.call_asi_one("Hello, please respond with 'Product uAgent test successful'")
        print(f"✅ Product uAgent ASI:One integration working!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ Product uAgent failed: {e}")
    print()

def test_rest_endpoints():
    """Test REST endpoints (requires uAgents to be running)"""
    print("🧪 Testing REST endpoints...")
    print("Note: This test requires uAgents to be running on their respective ports")
    print()
    
    # Test CEO uAgent REST endpoint
    print("Test 1: CEO uAgent REST endpoint")
    try:
        response = requests.post('http://localhost:8001/generate-ideas', 
                               json={'count': 1}, 
                               timeout=10)
        if response.status_code == 200:
            print("✅ CEO uAgent REST endpoint working!")
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"❌ CEO uAgent REST endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ CEO uAgent not running on port 8001")
    except Exception as e:
        print(f"❌ CEO uAgent REST test failed: {e}")
    print()
    
    # Test Research uAgent REST endpoint
    print("Test 2: Research uAgent REST endpoint")
    try:
        test_idea = {
            'title': 'Test AI Product',
            'description': 'A test product for validation',
            'revenue_model': 'Subscription model'
        }
        response = requests.post('http://localhost:8002/research-idea', 
                               json={'idea': test_idea}, 
                               timeout=10)
        if response.status_code == 200:
            print("✅ Research uAgent REST endpoint working!")
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"❌ Research uAgent REST endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Research uAgent not running on port 8002")
    except Exception as e:
        print(f"❌ Research uAgent REST test failed: {e}")
    print()
    
    # Test Product uAgent REST endpoint
    print("Test 3: Product uAgent REST endpoint")
    try:
        test_idea = {
            'title': 'Test AI Product',
            'description': 'A test product for validation',
            'revenue_model': 'Subscription model'
        }
        test_research = {
            'competitors': [{'name': 'Test Competitor', 'description': 'Test'}],
            'market_analysis': {'market_size': 'Large', 'growth_potential': 'High'},
            'recommendations': {'positioning': 'Test positioning'}
        }
        response = requests.post('http://localhost:8003/develop-product', 
                               json={'idea': test_idea, 'research': test_research}, 
                               timeout=10)
        if response.status_code == 200:
            print("✅ Product uAgent REST endpoint working!")
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"❌ Product uAgent REST endpoint failed: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Product uAgent not running on port 8003")
    except Exception as e:
        print(f"❌ Product uAgent REST test failed: {e}")
    print()

def test_agent_info():
    """Test agent information and addresses"""
    print("🧪 Testing agent information...")
    print()
    
    agents = [
        ("CEO Agent", ceo_agent),
        ("Research Agent", research_agent),
        ("Product Agent", product_agent)
    ]
    
    for name, agent in agents:
        print(f"{name}:")
        print(f"  Name: {agent.name}")
        print(f"  Port: {agent.port}")
        print(f"  Address: {agent.get_agent_address()}")
        print(f"  API Key: {'✅ Configured' if agent.api_key else '❌ Missing'}")
        print()

async def main():
    """Main test function"""
    print("🚀 Phase 1 uAgents Testing")
    print("=" * 50)
    print()
    
    # Test agent information
    test_agent_info()
    print()
    
    # Test individual functionality
    await test_individual_uagents()
    print()
    
    # Test REST endpoints
    test_rest_endpoints()
    print()
    
    print("🎉 Phase 1 uAgents testing completed!")
    print()
    print("Next steps:")
    print("1. Start uAgents: python3 ai_uagents/ceo_uagent.py")
    print("2. Start uAgents: python3 ai_uagents/research_uagent.py")
    print("3. Start uAgents: python3 ai_uagents/product_uagent.py")
    print("4. Test REST endpoints")
    print("5. Update Node.js server to use uAgents")

if __name__ == "__main__":
    asyncio.run(main())
