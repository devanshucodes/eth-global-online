"""
Test the Workflow Orchestrator
Tests the complete workflow orchestration
"""

import asyncio
import os
import requests
import json
import sys

# Add the ai_uagents directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_uagents'))

from orchestrator_uagent import orchestrator_agent

async def test_orchestrator():
    """Test the orchestrator functionality"""
    print("🧪 Testing Workflow Orchestrator...")
    print()

    # Test 1: Check if orchestrator is running
    print("Test 1: Check orchestrator status")
    try:
        response = requests.get(f"http://localhost:{orchestrator_agent.port}/health", timeout=5)
        print(f"✅ Orchestrator running on port {orchestrator_agent.port}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Orchestrator not running on port {orchestrator_agent.port}")
        return
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Orchestrator health check failed: {e}")
    print()

    # Test 2: Test complete workflow
    print("Test 2: Test complete workflow")
    try:
        response = requests.post(
            f"http://localhost:{orchestrator_agent.port}/process-business-idea",
            json={
                "user_input": "I want to start an AI company that helps small businesses",
                "idea_count": 1
            },
            timeout=120  # 2 minutes timeout for complete workflow
        )
        response.raise_for_status()
        result = response.json()
        
        if result.get('success'):
            print("✅ Complete workflow executed successfully!")
            print(f"Selected idea: {result.get('data', {}).get('idea', {}).get('title', 'Unknown')}")
            print(f"Workflow status: {result.get('data', {}).get('workflow_summary', {}).get('workflow_status', 'Unknown')}")
            
            # Check if all components are present
            data = result.get('data', {})
            components = ['idea', 'research', 'product', 'marketing', 'technical', 'bolt_prompt', 'finance']
            missing_components = [comp for comp in components if comp not in data]
            
            if missing_components:
                print(f"⚠️ Missing components: {missing_components}")
            else:
                print("✅ All workflow components present")
        else:
            print(f"❌ Workflow failed: {result.get('message', 'Unknown error')}")
            print(f"Error: {result.get('error', 'No error details')}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to orchestrator on port {orchestrator_agent.port}")
    except requests.exceptions.Timeout:
        print("❌ Workflow timed out (2 minutes)")
    except requests.exceptions.RequestException as e:
        print(f"❌ Workflow test failed: {e}")
    print()

    # Test 3: Test individual agent connectivity
    print("Test 3: Test individual agent connectivity")
    agent_ports = orchestrator_agent.agent_ports
    
    for agent_name, port in agent_ports.items():
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=5)
            print(f"✅ {agent_name.title()} agent running on port {port}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {agent_name.title()} agent not running on port {port}")
        except requests.exceptions.RequestException:
            print(f"⚠️ {agent_name.title()} agent health check failed on port {port}")
    print()

async def main():
    print("🚀 Workflow Orchestrator Testing")
    print("==================================================")
    print()

    print("🧪 Testing orchestrator information...")
    print()
    print(f"Orchestrator Agent:")
    print(f"  Name: {orchestrator_agent.name}")
    print(f"  Port: {orchestrator_agent.port}")
    print(f"  Address: {orchestrator_agent.get_agent_address()}")
    print(f"  API Key: {'✅ Configured' if orchestrator_agent.api_key else '❌ Not Configured'}")
    print(f"  Managing {len(orchestrator_agent.agent_ports)} agents")
    print()

    await test_orchestrator()

    print("🎉 Workflow Orchestrator testing completed!")
    print()
    print("Next steps:")
    print("1. Fix any connectivity issues")
    print("2. Update Node.js server to use orchestrator")
    print("3. Test complete workflow integration")

if __name__ == "__main__":
    asyncio.run(main())
