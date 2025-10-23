#!/usr/bin/env python3
"""
Test script for CEO uAgent
"""

import asyncio
import sys
import os
sys.path.append('.')

from ai_uagents.ceo_uagent import ceo_agent, GenerateIdeas, IdeasResponse

async def test_ceo_agent():
    """Test the CEO uAgent functionality"""
    print("🧪 Testing CEO uAgent...")
    print(f"Agent name: {ceo_agent.name}")
    print(f"Agent port: {ceo_agent.port}")
    print(f"Agent address: {ceo_agent.get_agent_address()}")
    print(f"API key configured: {bool(ceo_agent.api_key)}")
    print()
    
    # Test 1: ASI:One API integration
    print("Test 1: ASI:One API integration")
    try:
        response = await ceo_agent.call_asi_one("Hello, please respond with 'CEO uAgent test successful'")
        print(f"✅ ASI:One integration working!")
        print(f"Response: {response}")
    except Exception as e:
        print(f"❌ ASI:One integration failed: {e}")
    print()
    
    # Test 2: Idea generation
    print("Test 2: Idea generation")
    try:
        prompt = """You are a visionary CEO of an AI company. Generate 1 innovative business idea that could potentially generate $1 million in revenue.

For the idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Potential revenue model
4. Why it could be successful

Format your response as JSON with this structure:
{
  "ideas": [
    {
      "title": "Idea Title",
      "description": "Brief description",
      "revenue_model": "How it makes money",
      "success_factors": "Why it could work"
    }
  ]
}"""
        
        response = await ceo_agent.call_asi_one(prompt, 2000)
        print(f"✅ Idea generation working!")
        print(f"Response length: {len(response)} characters")
        
        # Try to parse JSON
        import json
        try:
            ideas_data = json.loads(response)
            ideas = ideas_data.get('ideas', [])
            print(f"Ideas generated: {len(ideas)}")
            for i, idea in enumerate(ideas):
                print(f"  Idea {i+1}: {idea.get('title', 'No title')}")
        except json.JSONDecodeError:
            print("Response is not valid JSON, but ASI:One call succeeded")
            
    except Exception as e:
        print(f"❌ Idea generation failed: {e}")
    print()
    
    # Test 3: Product evaluation
    print("Test 3: Product evaluation")
    try:
        prompt = """As a CEO, evaluate this product concept for market viability:

Product: Test AI Product
Description: An AI-powered business automation tool
Features: ['AI automation', 'Business intelligence', 'Workflow optimization']
Target Market: {"primary": "Small businesses", "secondary": "Enterprises"}

Provide your assessment in JSON format:
{
  "viability_score": 1-10,
  "market_potential": "High/Medium/Low",
  "recommendations": "What to improve",
  "go_decision": true/false
}"""
        
        response = await ceo_agent.call_asi_one(prompt, 1000)
        print(f"✅ Product evaluation working!")
        print(f"Response length: {len(response)} characters")
        
        # Try to parse JSON
        import json
        try:
            evaluation_data = json.loads(response)
            print(f"Viability score: {evaluation_data.get('viability_score', 'N/A')}")
            print(f"Market potential: {evaluation_data.get('market_potential', 'N/A')}")
            print(f"Go decision: {evaluation_data.get('go_decision', 'N/A')}")
        except json.JSONDecodeError:
            print("Response is not valid JSON, but ASI:One call succeeded")
            
    except Exception as e:
        print(f"❌ Product evaluation failed: {e}")
    print()
    
    print("🎉 CEO uAgent testing completed!")

if __name__ == "__main__":
    asyncio.run(test_ceo_agent())
