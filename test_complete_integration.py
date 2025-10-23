"""
Test Complete Integration
Tests the full integration from Node.js to uAgents
"""

import requests
import json
import time

def test_complete_integration():
    """Test the complete integration"""
    print("🧪 Testing Complete Integration...")
    print()

    # Test 1: Check if Node.js server is running
    print("Test 1: Check Node.js server status")
    try:
        response = requests.get("http://localhost:5000/api/agents/test-asi-one-api", timeout=10)
        if response.status_code == 200:
            print("✅ Node.js server is running")
            print("Response:", response.json())
        else:
            print(f"❌ Node.js server returned status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Node.js server not running on port 5000")
        return
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Node.js server test failed: {e}")
    print()

    # Test 2: Test complete workflow through Node.js
    print("Test 2: Test complete workflow through Node.js")
    try:
        response = requests.post(
            "http://localhost:5000/api/agents/process-complete-workflow",
            json={
                "user_input": "I want to start an AI company that helps small businesses",
                "idea_count": 1
            },
            timeout=300  # 5 minutes timeout
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Complete workflow executed successfully through Node.js!")
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
        else:
            print(f"❌ Node.js server returned status {response.status_code}")
            print("Response:", response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Node.js server on port 5000")
    except requests.exceptions.Timeout:
        print("❌ Workflow timed out (5 minutes)")
    except requests.exceptions.RequestException as e:
        print(f"❌ Workflow test failed: {e}")
    print()

    # Test 3: Test individual uAgent endpoints
    print("Test 3: Test individual uAgent endpoints")
    agent_ports = {
        'orchestrator': 8008,
        'ceo': 8001,
        'research': 8002,
        'product': 8003,
        'cmo': 8004,
        'cto': 8005,
        'head_engineering': 8006,
        'finance': 8007
    }
    
    for agent_name, port in agent_ports.items():
        try:
            response = requests.get(f"http://localhost:{port}/health", timeout=5)
            print(f"✅ {agent_name.title()} agent running on port {port}")
        except requests.exceptions.ConnectionError:
            print(f"❌ {agent_name.title()} agent not running on port {port}")
        except requests.exceptions.RequestException:
            print(f"⚠️ {agent_name.title()} agent health check failed on port {port}")
    print()

def main():
    print("🚀 Complete Integration Testing")
    print("==================================================")
    print()

    test_complete_integration()

    print("🎉 Complete integration testing completed!")
    print()
    print("Next steps:")
    print("1. Fix any connectivity issues")
    print("2. Update frontend to use new endpoints")
    print("3. Test user experience")

if __name__ == "__main__":
    main()
