"""
Base uAgent class for AI Company agents
Provides common functionality for all agents including ASI:One integration
"""

import os
import json
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from uagents import Agent, Context, Model

load_dotenv()

class BaseUAgent:
    """Base class for all AI Company uAgents"""
    
    def __init__(self, name: str, role: str, port: int, seed_phrase: str = None):
        self.name = name
        self.role = role
        self.port = port
        self.api_key = os.getenv('ASI_ONE_API_KEY')
        self.base_url = 'https://api.asi1.ai/v1'
        
        # Load seed from private_keys.json if not provided
        if not seed_phrase:
            try:
                with open(os.path.join(os.path.dirname(__file__), 'private_keys.json'), 'r') as f:
                    keys = json.load(f)
                    agent_keys = keys.get(name, {})
                    seed_phrase = agent_keys.get('identity_key')
            except Exception as e:
                print(f"⚠️ [{name}] Could not load seed from private_keys.json: {e}")
        
        # Initialize the agent with proper Agentverse configuration
        agent_config = {
            "name": name,
            "port": port,
            "endpoint": [f"http://localhost:{port}/submit"],
        }
        
        # Use seed for deterministic address (required for Agentverse)
        if seed_phrase:
            agent_config["seed"] = seed_phrase
            print(f"✅ [{name}] Using deterministic seed for Agentverse registration")
        
        # Enable mailbox for Agentverse connectivity
        agent_config["mailbox"] = True
        
        self.agent = Agent(**agent_config)
        
        if not self.api_key:
            raise ValueError(f"ASI_ONE_API_KEY not found for {name}")
    
    async def call_asi_one(self, prompt: str, max_tokens: int = 1000) -> str:
        """Call ASI:One API to generate response"""
        try:
            print(f"🔑 [{self.name}] Calling ASI:One API...")
            print(f"🔑 [{self.name}] API Key length: {len(self.api_key)}")
            print(f"🔑 [{self.name}] API Key starts with sk_: {self.api_key.startswith('sk_')}")
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'asi1-mini',
                    'max_tokens': max_tokens,
                    'messages': [
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ]
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                print(f"✅ [{self.name}] ASI:One response received ({len(content)} chars)")
                return content
            else:
                print(f"❌ [{self.name}] ASI:One API error: {response.status_code}")
                print(f"❌ [{self.name}] Error response: {response.text}")
                raise Exception(f"ASI:One API error: {response.status_code}")
                
        except Exception as e:
            print(f"❌ [{self.name}] Error calling ASI:One: {str(e)}")
            raise e
    
    def log_activity(self, activity: str, data: Dict[str, Any] = None):
        """Log agent activity"""
        print(f"[{self.name}] {activity}: {data or 'No data'}")
    
    def get_agent_address(self) -> str:
        """Get the agent's address for communication"""
        return str(self.agent.address)
    
    def get_agent_info(self) -> Dict[str, Any]:
        """Get agent information"""
        return {
            'name': self.name,
            'role': self.role,
            'port': self.port,
            'address': self.get_agent_address(),
            'status': 'active'
        }
