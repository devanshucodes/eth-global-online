"""
Test Phase 2 uAgents functionality
Tests CMO, CTO, Head of Engineering, and Finance uAgents
"""

import asyncio
import os
import requests
import json
import sys

# Add the ai_uagents directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_uagents'))

from cmo_uagent import cmo_agent
from cto_uagent import cto_agent
from head_engineering_uagent import head_engineering_agent
from finance_uagent import finance_agent

async def test_individual_uagents():
    """Test individual uAgent functionality"""
    print("🧪 Testing Phase 2 uAgent functionality...")
    print()

    # Test 1: CMO uAgent
    print("Test 1: CMO uAgent")
    try:
        response_content = await cmo_agent.call_asi_one("Hello, please respond with \"CMO uAgent test successful\"")
        print("✅ CMO uAgent ASI:One integration working!")
        print("Response:", response_content)
    except Exception as e:
        print(f"❌ CMO uAgent ASI:One integration failed: {e}")
    print()

    # Test 2: CTO uAgent
    print("Test 2: CTO uAgent")
    try:
        response_content = await cto_agent.call_asi_one("Hello, please respond with \"CTO uAgent test successful\"")
        print("✅ CTO uAgent ASI:One integration working!")
        print("Response:", response_content)
    except Exception as e:
        print(f"❌ CTO uAgent ASI:One integration failed: {e}")
    print()

    # Test 3: Head of Engineering uAgent
    print("Test 3: Head of Engineering uAgent")
    try:
        response_content = await head_engineering_agent.call_asi_one("Hello, please respond with \"Head of Engineering uAgent test successful\"")
        print("✅ Head of Engineering uAgent ASI:One integration working!")
        print("Response:", response_content)
    except Exception as e:
        print(f"❌ Head of Engineering uAgent ASI:One integration failed: {e}")
    print()

    # Test 4: Finance uAgent
    print("Test 4: Finance uAgent")
    try:
        response_content = await finance_agent.call_asi_one("Hello, please respond with \"Finance uAgent test successful\"")
        print("✅ Finance uAgent ASI:One integration working!")
        print("Response:", response_content)
    except Exception as e:
        print(f"❌ Finance uAgent ASI:One integration failed: {e}")
    print()

async def test_rest_endpoints():
    """Test REST endpoints of uAgents"""
    print("🧪 Testing Phase 2 REST endpoints...")
    print("Note: This test requires uAgents to be running on their respective ports")
    print()

    # Test 1: CMO uAgent REST endpoint
    print("Test 1: CMO uAgent REST endpoint")
    try:
        response = requests.post(
            f"http://localhost:{cmo_agent.port}/develop-marketing",
            json={
                "idea": {"title": "Test AI Product", "description": "A test product"},
                "product": {
                    "product_name": "Test Product",
                    "product_description": "Test description",
                    "target_market": {"primary": "Test market"},
                    "value_proposition": "Test value"
                },
                "research": {
                    "market_analysis": {"market_size": "Large"},
                    "competitors": [],
                    "recommendations": {"target_audience": "Test audience"}
                }
            },
            timeout=10
        )
        response.raise_for_status()
        print("✅ CMO uAgent REST endpoint working!")
        print("Response keys:", list(response.json().keys()))
    except requests.exceptions.ConnectionError:
        print(f"❌ CMO uAgent not running on port {cmo_agent.port}")
    except requests.exceptions.RequestException as e:
        print(f"❌ CMO uAgent REST test failed: {e}")
    print()

    # Test 2: CTO uAgent REST endpoint
    print("Test 2: CTO uAgent REST endpoint")
    try:
        response = requests.post(
            f"http://localhost:{cto_agent.port}/develop-technical",
            json={
                "idea": {"title": "Test AI Product", "description": "A test product"},
                "product": {
                    "product_name": "Test Product",
                    "product_description": "Test description",
                    "core_features": ["Feature 1", "Feature 2"],
                    "target_market": {"primary": "Test market"}
                },
                "research": {
                    "market_analysis": {"market_size": "Large", "key_challenges": ["Challenge 1"]},
                    "competitors": []
                }
            },
            timeout=10
        )
        response.raise_for_status()
        print("✅ CTO uAgent REST endpoint working!")
        print("Response keys:", list(response.json().keys()))
    except requests.exceptions.ConnectionError:
        print(f"❌ CTO uAgent not running on port {cto_agent.port}")
    except requests.exceptions.RequestException as e:
        print(f"❌ CTO uAgent REST test failed: {e}")
    print()

    # Test 3: Head of Engineering uAgent REST endpoint
    print("Test 3: Head of Engineering uAgent REST endpoint")
    try:
        response = requests.post(
            f"http://localhost:{head_engineering_agent.port}/create-bolt-prompt",
            json={
                "idea": {"title": "Test AI Product", "description": "A test product"},
                "product": {
                    "product_name": "Test Product",
                    "product_description": "Test description",
                    "core_features": ["Feature 1"],
                    "target_market": {"primary": "Test market"},
                    "value_proposition": "Test value",
                    "revenue_model": "Subscription"
                },
                "research": {
                    "market_analysis": {"market_size": "Large"},
                    "competitors": [],
                    "recommendations": {"target_audience": "Test audience"}
                },
                "marketing_strategy": {
                    "brand_positioning": "Test positioning",
                    "key_messages": ["Message 1"],
                    "target_segments": [],
                    "marketing_channels": []
                },
                "technical_strategy": {
                    "technology_stack": {},
                    "architecture": {"overview": "Test architecture"},
                    "timeline": {}
                }
            },
            timeout=10
        )
        response.raise_for_status()
        print("✅ Head of Engineering uAgent REST endpoint working!")
        print("Response keys:", list(response.json().keys()))
    except requests.exceptions.ConnectionError:
        print(f"❌ Head of Engineering uAgent not running on port {head_engineering_agent.port}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Head of Engineering uAgent REST test failed: {e}")
    print()

    # Test 4: Finance uAgent REST endpoint
    print("Test 4: Finance uAgent REST endpoint")
    try:
        response = requests.post(
            f"http://localhost:{finance_agent.port}/analyze-revenue",
            json={
                "idea_data": {"title": "Test AI Product", "description": "A test product"},
                "product_data": {"product_name": "Test Product", "product_description": "Test description"}
            },
            timeout=10
        )
        response.raise_for_status()
        print("✅ Finance uAgent REST endpoint working!")
        print("Response keys:", list(response.json().keys()))
    except requests.exceptions.ConnectionError:
        print(f"❌ Finance uAgent not running on port {finance_agent.port}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Finance uAgent REST test failed: {e}")
    print()

async def main():
    print("🚀 Phase 2 uAgents Testing")
    print("==================================================")
    print()

    print("🧪 Testing agent information...")
    print()
    print(f"CMO Agent:\n  Name: {cmo_agent.name}\n  Port: {cmo_agent.port}\n  Address: {cmo_agent.get_agent_address()}\n  API Key: {'✅ Configured' if cmo_agent.api_key else '❌ Not Configured'}")
    print()
    print(f"CTO Agent:\n  Name: {cto_agent.name}\n  Port: {cto_agent.port}\n  Address: {cto_agent.get_agent_address()}\n  API Key: {'✅ Configured' if cto_agent.api_key else '❌ Not Configured'}")
    print()
    print(f"Head of Engineering Agent:\n  Name: {head_engineering_agent.name}\n  Port: {head_engineering_agent.port}\n  Address: {head_engineering_agent.get_agent_address()}\n  API Key: {'✅ Configured' if head_engineering_agent.api_key else '❌ Not Configured'}")
    print()
    print(f"Finance Agent:\n  Name: {finance_agent.name}\n  Port: {finance_agent.port}\n  Address: {finance_agent.get_agent_address()}\n  API Key: {'✅ Configured' if finance_agent.api_key else '❌ Not Configured'}")
    print()

    await test_individual_uagents()
    await test_rest_endpoints()

    print("🎉 Phase 2 uAgents testing completed!")
    print()
    print("Next steps:")
    print("1. Fix any timeout issues")
    print("2. Update Node.js server to use uAgents")
    print("3. Test complete workflow")

if __name__ == "__main__":
    asyncio.run(main())
