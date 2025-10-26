#!/usr/bin/env python3
"""
Register all AI Company uAgents on Agentverse
This script helps you register your agents properly for Agentverse visibility
"""

import json
import os
from pathlib import Path

# Agent configurations for Agentverse
AGENTS = [
    {
        "name": "CEO Agent",
        "description": "Generates and evaluates innovative business ideas using AI",
        "port": 8001,
        "capabilities": ["Idea Generation", "Business Evaluation", "Strategic Planning"],
        "readme": "README_CEO.md"
    },
    {
        "name": "Research Agent (MeTTa)",
        "description": "Intelligent market research with MeTTa knowledge graphs and structured reasoning",
        "port": 8009,
        "capabilities": ["Market Research", "Competitor Analysis", "MeTTa Knowledge Graphs", "Historical Context"],
        "readme": "README_RESEARCH_METTA.md"
    },
    {
        "name": "Product Agent",
        "description": "Creates comprehensive product development reports and specifications",
        "port": 8003,
        "capabilities": ["Product Design", "Feature Planning", "Market Fit Analysis"],
        "readme": "README_PRODUCT.md"
    },
    {
        "name": "CMO Agent",
        "description": "Develops marketing strategies and brand positioning",
        "port": 8004,
        "capabilities": ["Marketing Strategy", "Brand Development", "Social Media"],
        "readme": "README_CMO.md"
    },
    {
        "name": "CTO Agent",
        "description": "Designs technical architecture and technology stack",
        "port": 8005,
        "capabilities": ["Technical Strategy", "Architecture Design", "Tech Stack Selection"],
        "readme": "README_CTO.md"
    },
    {
        "name": "Head of Engineering Agent",
        "description": "Creates website specifications and Bolt.diy prompts",
        "port": 8006,
        "capabilities": ["Website Specs", "Bolt Integration", "Engineering Plans"],
        "readme": "README_HEAD_ENG.md"
    },
    {
        "name": "Finance Agent",
        "description": "Performs financial analysis and revenue projections",
        "port": 8007,
        "capabilities": ["Financial Analysis", "Revenue Modeling", "Investment Planning"],
        "readme": "README_FINANCE.md"
    },
    {
        "name": "Workflow Orchestrator",
        "description": "Coordinates complete business workflow across all agents",
        "port": 8008,
        "capabilities": ["Workflow Management", "Agent Coordination", "Process Automation"],
        "readme": "README_ORCHESTRATOR.md"
    }
]

def load_agent_addresses():
    """Load agent addresses from private_keys.json"""
    try:
        with open('private_keys.json', 'r') as f:
            keys = json.load(f)
            
        # Create agent instances to get addresses
        from uagents import Agent
        
        addresses = {}
        for agent_name, agent_keys in keys.items():
            identity = agent_keys.get('identity_key')
            if identity:
                # Create temporary agent to get address
                temp_agent = Agent(name=agent_name, seed=identity)
                addresses[agent_name] = str(temp_agent.address)
        
        return addresses
    except Exception as e:
        print(f"❌ Error loading addresses: {e}")
        return {}

def print_registration_guide():
    """Print step-by-step Agentverse registration guide"""
    
    print("=" * 80)
    print("🤖 AGENTVERSE REGISTRATION GUIDE FOR AI COMPANY AGENTS")
    print("=" * 80)
    
    addresses = load_agent_addresses()
    
    print("\n📋 STEP 1: CREATE AGENTVERSE ACCOUNT")
    print("-" * 80)
    print("1. Visit: https://agentverse.ai/")
    print("2. Sign up with email or Fetch.ai wallet")
    print("3. Verify your email address")
    
    print("\n📋 STEP 2: REGISTER EACH AGENT ON AGENTVERSE")
    print("-" * 80)
    print("For each agent below, follow these steps:\n")
    
    for i, agent in enumerate(AGENTS, 1):
        agent_name = agent['name']
        address = addresses.get(agent_name, "Run agents to get address")
        
        print(f"\n{'=' * 80}")
        print(f"AGENT {i}/{len(AGENTS)}: {agent_name}")
        print('=' * 80)
        print(f"📍 Address: {address}")
        print(f"🔌 Port: {agent['port']}")
        print(f"📝 Description: {agent['description']}")
        print(f"⚡ Capabilities: {', '.join(agent['capabilities'])}")
        
        print(f"\nSTEPS TO REGISTER:")
        print("1. On Agentverse, click 'My Agents' → 'New Agent' → 'Mailbox Agent'")
        print(f"2. Agent Name: {agent_name}")
        print(f"3. Paste Address: {address}")
        print(f"4. Description: {agent['description']}")
        print(f"5. Add Tags: {', '.join(agent['capabilities'])}")
        print("6. Click 'Create Agent'")
        print("7. Your agent will appear in 'My Agents' dashboard")
        print("\n✅ Agent will be discoverable via ASI:One and Agentverse search!")
    
    print("\n" + "=" * 80)
    print("📋 STEP 3: VERIFY REGISTRATION")
    print("-" * 80)
    print("1. Go to 'My Agents' on Agentverse")
    print("2. You should see all 8 agents listed")
    print("3. Each agent should show as 'Connected' or 'Online'")
    print("4. Try searching for your agents in Agent Explorer")
    
    print("\n" + "=" * 80)
    print("📋 STEP 4: TEST AGENT DISCOVERY")
    print("-" * 80)
    print("1. Go to ASI:One Chat: https://asi1.ai/")
    print("2. Ask: 'Find agents for market research'")
    print("3. Your Research Agent (MeTTa) should appear!")
    print("4. Test other agents similarly")
    
    print("\n" + "=" * 80)
    print("🎉 COMPLETION CHECKLIST")
    print("-" * 80)
    print("✅ All 8 agents registered on Agentverse")
    print("✅ Agents visible in 'My Agents' dashboard")
    print("✅ Agents discoverable via search")
    print("✅ ASI:One can find and interact with agents")
    print("✅ MeTTa integration visible in Research Agent")
    
    print("\n" + "=" * 80)
    print("🏆 HACKATHON SCORING IMPACT")
    print("-" * 80)
    print("With proper registration, you demonstrate:")
    print("✅ Use of ASI Alliance Tech (20%): Agentverse + uAgents + MeTTa")
    print("✅ Functionality (25%): All agents working and communicating")
    print("✅ Innovation (20%): Multi-agent system with knowledge graphs")
    print("✅ Real-World Impact (20%): Complete AI company automation")
    print("✅ User Experience (15%): Professional Agentverse presence")
    print("\n💰 TARGET: $3,500 (1st Place) or $2,500 (2nd Place)")
    
    print("\n" + "=" * 80)
    print("📝 IMPORTANT NOTES")
    print("-" * 80)
    print("• Your agents are ALREADY RUNNING locally (since Oct 12-14)")
    print("• They have deterministic addresses (from private_keys.json)")
    print("• Mailbox=True enables Agentverse connectivity")
    print("• Registration makes them VISIBLE on Agentverse marketplace")
    print("• ASI:One can then discover and chat with your agents")
    print("\n" + "=" * 80)
    
    # Save addresses to file for easy copying
    with open('agent_addresses.txt', 'w') as f:
        f.write("AI COMPANY AGENT ADDRESSES FOR AGENTVERSE\n")
        f.write("=" * 80 + "\n\n")
        for agent in AGENTS:
            address = addresses.get(agent['name'], "Run agent to get address")
            f.write(f"{agent['name']}:\n")
            f.write(f"  Address: {address}\n")
            f.write(f"  Port: {agent['port']}\n")
            f.write(f"  Description: {agent['description']}\n")
            f.write("\n")
    
    print("\n💾 Agent addresses saved to: agent_addresses.txt")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    print_registration_guide()
