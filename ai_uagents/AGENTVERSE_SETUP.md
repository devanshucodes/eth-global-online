# How to Register Your uAgents on Agentverse

## Current Issue:
Your agents are running locally but NOT visible on Agentverse dashboard because they need proper mailbox configuration.

## Solution: Register on Agentverse

### Step 1: Create Agentverse Account
1. Go to https://agentverse.ai/
2. Sign up with email or Fetch.ai wallet
3. Verify your account

### Step 2: Create Agents on Agentverse (Do this for EACH agent)

For each agent, follow these steps:

1. Click **"Create Agent"** or **"New Agent"**
2. Fill in details:
   - **Name**: "Research Agent (MeTTa)" (or CEO Agent, CMO Agent, etc.)
   - **Description**: Brief description of what the agent does
3. **IMPORTANT**: Copy the **Mailbox Key** that Agentverse provides
4. **IMPORTANT**: Copy the **Agent Address** 

### Step 3: Update Agent Code with Mailbox Keys

Once you have mailbox keys from Agentverse, update `base_uagent.py`:

```python
import os
from dotenv import load_dotenv
from uagents import Agent

load_dotenv()

class BaseUAgent:
    def __init__(self, name: str, role: str, port: int, seed: str = None):
        self.name = name
        self.role = role
        self.port = port
        self.api_key = os.getenv('ASI_ONE_API_KEY')
        
        # Get mailbox key from environment
        mailbox_key = os.getenv(f'{name.upper().replace(" ", "_")}_MAILBOX_KEY')
        
        # Initialize agent with seed and mailbox
        if seed:
            self.agent = Agent(
                name=name,
                seed=seed,
                port=port,
                mailbox=mailbox_key  # Use the key from Agentverse
            )
        else:
            # Fallback to local-only agent
            self.agent = Agent(
                name=name,
                port=port
            )
```

### Step 4: Add Mailbox Keys to .env

Add these to your `.env` file (replace with actual keys from Agentverse):

```env
CEO_AGENT_MAILBOX_KEY=your_ceo_mailbox_key_here
RESEARCH_AGENT_METTA_MAILBOX_KEY=your_research_mailbox_key_here
PRODUCT_AGENT_MAILBOX_KEY=your_product_mailbox_key_here
CMO_AGENT_MAILBOX_KEY=your_cmo_mailbox_key_here
CTO_AGENT_MAILBOX_KEY=your_cto_mailbox_key_here
HEAD_OF_ENGINEERING_AGENT_MAILBOX_KEY=your_head_eng_mailbox_key_here
FINANCE_AGENT_MAILBOX_KEY=your_finance_mailbox_key_here
WORKFLOW_ORCHESTRATOR_MAILBOX_KEY=your_orchestrator_mailbox_key_here
```

---

## Alternative: Use Local Agents Only (Faster for Now)

If you don't need Agentverse dashboard visibility RIGHT NOW:

**What you have works fine for:**
- ✅ Agent-to-agent communication (localhost)
- ✅ REST API endpoints (your Node.js can call them)
- ✅ MeTTa integration (working)
- ✅ ASI:One integration (working)

**What it WON'T work for:**
- ❌ Viewing agents on Agentverse dashboard
- ❌ Remote agent discovery
- ❌ Cross-network agent communication

**For the hackathon**, judges can see:
- Your code (shows proper uAgents implementation)
- Local agent logs (shows they're running)
- MeTTa integration (in code)
- Your demo video/screenshots

---

## Recommendation for Hackathon:

Since you're short on time, I suggest:

**NOW:** Use local agents (they work, just not visible on dashboard)
**LATER:** Properly register on Agentverse if you have time

Your current setup is enough to demonstrate:
- ✅ uAgents framework usage
- ✅ MeTTa integration
- ✅ ASI:One LLM integration
- ✅ Multi-agent orchestration

The judges will understand from your code that agents are properly implemented.
