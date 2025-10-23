# Artificial Superintelligence Alliance (ASI) Hackathon

## Overview

The Artificial Superintelligence Alliance brings together Fetch.ai and SingularityNET to build an open, modular marketplace for autonomous AI agents. Developers can create agents that discover each other, connect to services and APIs, reason over knowledge, and act across chains, without needing niche domain expertise.

**Website:** [superintelligence.io](https://superintelligence.io)  
**Total Prize Pool:** $10,000

## About ASI Alliance

The ASI Alliance is building an open, modular marketplace for autonomous AI agents. The stack is UI-agnostic and designed for search, discovery, and dynamic connectivity.

### Core Components

- **uAgents**: Power autonomous behavior
- **Agentverse**: Provides listing, hosting, and orchestration
- **Fetch Network**: Secures identities, messaging, and execution
- **ASI:One**: Offers a Web3-native LLM and Chat Protocol for direct human-agent interaction
- **MeTTa**: Brings structured knowledge and reasoning with real-world signals, provenance, and privacy

## Prize Structure

| Place | Prize | Description |
|-------|-------|-------------|
| 🥇 **1st Place** | $3,500 | Most effective and creative use of ASI:One for human-agent interaction, paired with MeTTa for structured reasoning |
| 🥈 **2nd Place** | $2,500 | Most impactful, well-presented launch on Agentverse with clear MeTTa integration |
| 🥉 **3rd Place** | $1,750 | Most cohesive multi-agent system using Fetch.ai agents and MeTTa for shared knowledge |
| 🏅 **4th Place** | $1,250 | Most innovative demonstration of agent collaboration within ASI:One ecosystem |
| 🏅 **5th Place** | $1,000 | Most polished user-facing experience for advanced human-agent interaction |

## Judging Criteria

### 1. Functionality & Technical Implementation (25%)
- Does the agent system work as intended?
- Are the agents properly communicating and reasoning in real time?

### 2. Use of ASI Alliance Tech (20%)
- Are agents registered on Agentverse?
- Is the Chat Protocol live for ASI:One?
- Does your solution make use of uAgents and MeTTa Knowledge Graphs tools?

### 3. Innovation & Creativity (20%)
- How original or creative is the solution?
- Is it solving a problem in a new or unconventional way?

### 4. Real-World Impact & Usefulness (20%)
- Does it solve a meaningful problem?
- How useful would this be to an end user?

### 5. User Experience & Presentation (15%)
- Is the demo clear and well-structured?
- Is the user experience smooth and easy to follow?
- Comprehensive documentation detailing the use and integration of each technology

## Fetch.ai Technology Stack

### Core Components

#### 🤖 uAgents
Microservices built to connect seamlessly with other agents. They can represent:
- Data
- APIs
- Services
- Machine learning models
- And more

#### 🛒 Agentverse
An Agent marketplace, management, and development hub where agents are:
- Created
- Registered
- Deployed
- Discovered

#### 🧠 ASI:One LLM
The world's first Web3-native Large Language Model (LLM) designed specifically for agentic AI. It queries Agentverse agents on the go.

### Key Principles

#### 🚀 Build
Build Microservices using uagents, or make your own AI Agents using SDK to enable agentverse connectivity.

#### 🔗 Connect
Deploy uAgents and register agents on Agentverse to discover and collaborate with other agents.

#### 💬 Communicate
Enable agents to exchange secure messages and share data seamlessly.

#### 💰 Transact
Perform decentralized transactions using blockchain to ensure trust, transparency, and accountability.

### Development Tools
- uAgents Framework
- Agentverse IDE
- Almanac registry
- Templates and tools

## What Makes Fetch.ai Different?

### 🔗 Decentralisation
Unlike many frameworks, Fetch.ai's uAgents are built with optional decentralisation, leveraging blockchain for secure, transparent, and trustless interactions.

### 🛒 Agent Marketplace
Fetch.ai's Agentverse acts as a marketplace where agents can be registered, discovered, and collaborate to solve real-world problems.

### 📨 Unified Messaging System
uAgents provide a generalized messaging structure, removing the need to define custom data models for agent communication.

### 🛠️ Seamless Integration
uAgents and the Fetch.ai SDK allow for easy integration with APIs, smart contracts, and other AI Agent frameworks.

### ⚖️ Lightweight and Scalable
The uAgents Framework is designed to be lightweight, making it ideal for deploying scalable, task-specific agents.

### 🔗 Blockchain-Powered Economy
Fetch.ai agents can perform transactions, interact with smart contracts, and maintain transparency through blockchain integration.

### 🛠️ Predefined Templates and Tools
Fetch.ai provides developer-friendly tools, such as templates, the Agentverse IDE, and the Almanac registry, to accelerate agent creation and deployment.

### 🔄 Interoperability
Agents can interact with multiple frameworks and other decentralized networks, enabling cross-platform collaboration.

## MeTTa by SingularityNET

### What is MeTTa?

MeTTa (Meta Type Talk) is a multi-paradigm language for declarative and functional computations over knowledge (meta)graphs developed by SingularityNET. It provides a powerful framework for:

- **Structured Knowledge Representation**: Organize information in logical, queryable formats
- **Symbolic Reasoning**: Perform complex logical operations and pattern matching
- **Knowledge Graph Operations**: Build, query, and manipulate knowledge graphs

MeTTa uses a space-based architecture where knowledge is stored as atoms in logical spaces, enabling sophisticated querying and reasoning capabilities.

### MeTTa Components Explained

#### Core MeTTa Elements

1. **Space (Knowledge Container)**
```python
metta = MeTTa()  # Creates a new MeTTa instance with a space
```
The space is where all knowledge atoms are stored and queried.

2. **Atoms (Knowledge Units)**
Atoms are the fundamental units of knowledge in MeTTa:
- **E (Expression)**: Creates logical expressions
- **S (Symbol)**: Represents symbolic atoms
- **ValueAtom**: Stores actual values (strings, numbers, etc.)

3. **Knowledge Graph Structure**
```python
# Symptoms → Diseases
metta.space().add_atom(E(S("symptom"), S("fever"), S("flu")))

# Diseases → Treatments  
metta.space().add_atom(E(S("treatment"), S("flu"), ValueAtom("rest, fluids, antiviral drugs")))

# Treatments → Side Effects
metta.space().add_atom(E(S("side_effect"), S("antiviral drugs"), ValueAtom("nausea, dizziness")))
```

4. **Querying with Pattern Matching**
```python
# Find diseases for a symptom
query_str = '!(match &self (symptom fever $disease) $disease)'
results = metta.run(query_str)
```

### Key MeTTa Concepts
- `&self`: References the current space
- `$variable`: Pattern matching variables
- `!(match ...)`: Query syntax for pattern matching
- `E(S(...), S(...), ...)`: Creates logical expressions

## Medical MeTTa Agent Example

A demonstration of how to integrate SingularityNET's MeTTa Knowledge Graph with Fetch.ai's uAgents to create intelligent, autonomous agents that can understand and respond to medical queries using structured knowledge reasoning.

### Project Architecture

#### Core Components
- **agent.py**: Main uAgent implementation with Chat Protocol to make the agent queryable through ASI:One
- **knowledge.py**: MeTTa knowledge graph initialization
- **medicalrag.py**: Medical RAG (Retrieval-Augmented Generation) system
- **utils.py**: LLM integration and query processing logic

#### Data Flow
```
User Query → Intent Classification → MeTTa Query → Knowledge Retrieval → LLM Response → User
```

### Integration with uAgents

#### Using This as a Template
This project serves as a template for integrating MeTTa with uAgents. The key integration point is the `process_query` function in `utils.py`, which you can customize for your specific use case.

#### Customization Steps

1. **Modify Knowledge Graph (knowledge.py)**:
```python
def initialize_knowledge_graph(metta: MeTTa):
    # Add your domain-specific knowledge
    metta.space().add_atom(E(S("your_relation"), S("subject"), S("object")))
```

2. **Update Query Processing (utils.py)**:
```python
def process_query(query, rag: YourRAG, llm: LLM):
    # Implement your domain-specific logic
    intent, keyword = get_intent_and_keyword(query, llm)
    # Add your custom processing logic here
```

3. **Extend RAG System (medicalrag.py)**:
```python
class YourRAG:
    def __init__(self, metta_instance: MeTTa):
        self.metta = metta_instance
    
    def query_your_domain(self, query):
        # Implement your domain-specific queries
        query_str = f'!(match &self (your_relation {query} $result) $result)'
        return self.metta.run(query_str)
```

### Setup Instructions

#### Prerequisites
- Python 3.11+
- ASI:One API key

#### Installation
1. Clone the repository:
```bash
git clone <your-repo-url>
cd fetch-metta-example
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
To get the ASI:One API Key, login to https://asi1.ai/ and go to Developer section, click on Create New and copy your API Key.

```bash
cp .env.example .env
# Edit .env with your API keys
```

5. Run the agent:
```bash
python agent.py
```

#### Environment Variables
Create a `.env` file with:
```
ASI_ONE_API_KEY=your_asi_one_api_key_here
```

### Key Features

#### 1. Dynamic Knowledge Learning
The agent can learn new information and add it to the MeTTa knowledge graph:
```python
# Automatically adds new knowledge when not found
rag.add_knowledge("symptom", "new_symptom", "related_disease")
```

#### 2. Intent Classification
Uses ASI:One to classify user intent and extract keywords:
- **symptom**: Find diseases related to symptoms
- **treatment**: Get treatment recommendations
- **side_effect**: Learn about medication side effects
- **faq**: Answer general questions

#### 3. Structured Reasoning
MeTTa enables complex logical reasoning:
```python
# Find treatments for diseases related to a symptom
symptoms = rag.query_symptom("fever")
treatments = rag.get_treatment(symptoms[0])
side_effects = rag.get_side_effects(treatments[0])
```

#### 4. Agentverse Integration
The agent automatically:
- Registers on Agentverse for discovery
- Implements Chat Protocol for ASI:One accessibility
- Provides a web interface for testing

### Testing the Agent

1. **Start the agent**:
```bash
python agent.py
```

2. **Access the inspector**: Visit the URL shown in the console and click on Connect and select the Mailbox option.

3. **Test queries**:
- "I have a fever, what could it be?"
- "How do I treat a migraine?"
- "What are the side effects of antidepressants?"

4. **Test Agents using Chat with Agent button on Agentverse**
   Once the agent is connected via Mailbox, go to Agent Profile and click on Chat with Agent

## Running MeTTa in Python

### Introduction

As Python has a broad range of applications, including web development, scientific and numeric computing, and especially AI, ML, and data analysis, its combined use with MeTTa significantly expands the possibilities of building AI systems.

### Setup

Install MeTTa's Python API:
```bash
pip install hyperon
```

### MeTTa Runner Class

The main interface class for MeTTa in Python is `MeTTa` class, which represents a runner built on top of the interpreter to execute MeTTa programs.

```python
from hyperon import MeTTa
metta = MeTTa()
result = metta.run('''
   (= (foo) boo)
   ! (foo)
   ! (match &self (= ($f) boo) $f)
''')
print(result) # [[boo], [foo]]
```

The result of `run` is a list of results of all evaluated expressions (following the exclamation mark `!`). Each of these results is also a list.

### Parsing MeTTa Code

The runner has methods for parsing a program code instead of executing it:

```python
from hyperon import MeTTa
metta = MeTTa()
atom = metta.parse_single('(A B)')
print(atom) # (A B)
```

### Accessing the Program Space

One can get a reference to the current program Space and add new atoms into it:

```python
from hyperon import MeTTa
metta = MeTTa()
atom = metta.parse_single('(A B)')
metta.space().add_atom(atom)
print(metta.run("!(match &self (A $x) $x)")) # [[B]]
```

### MeTTa Atoms in Python

#### SymbolAtom
Symbol atoms are intended for representing both procedural and declarative knowledge entities:

```python
from hyperon import S, SymbolAtom, Atom
symbol_atom = S('MyAtom')
print(symbol_atom.get_name()) # MyAtom
print(symbol_atom.get_metatype()) # AtomKind.SYMBOL
```

#### VariableAtom
A VariableAtom represents a variable (typically in an expression):

```python
from hyperon import V
var_atom = V('x')
print(var_atom) # $x
print(var_atom.get_name()) # x
```

#### ExpressionAtom
An ExpressionAtom is a list of Atoms of any kind:

```python
from hyperon import E, S, V, MeTTa

metta = MeTTa()
expr_atom = E(S('Parent'), V('x'), S('Bob'))
print(expr_atom) # (Parent $x Bob)
print(expr_atom.get_children()) # [Parent, $x, Bob]
```

#### GroundedAtom
GroundedAtom makes a connection between the abstract, symbolically represented knowledge within AtomSpace and the external environment:

```python
from hyperon import *
metta = MeTTa()
entry = E(S('my-key'), G({'a': 1, 'b': 2}))
metta.space().add_atom(entry)
result = metta.run('! (match &self (my-key $x) $x)')[0][0]
print(type(result)) # GroundedAtom
print(result.get_object()) # {'a': 1, 'b': 2}
```

## Useful Links

- [MeTTa Documentation](https://metta.readthedocs.io/)
- [Fetch.ai uAgents](https://docs.fetch.ai/)
- [Agentverse](https://agentverse.ai/)
- [ASI:One](https://asi1.ai/)

## Building and Understanding uAgents

### Overview

uAgents is a lightweight Python package designed to help you deploy microservices. These microservices can then be utilized by your AI agents as tools for executing tasks and achieving defined objectives.

### Installing uAgents Framework

Fetch.ai's uAgents Framework package is a Python library running on Ubuntu/Debian, macOS, and Windows systems.

#### Prerequisites
- Python 3.8+
- PIP - Python package manager
- uAgents library

#### Installation Steps

1. **Create a directory**:
```bash
mkdir my_agents_project
cd my_agents_project
```

2. **Initialize and activate a virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Fetch.ai uagents library**:
```bash
pip install uagents
```

4. **Verify the installation**:
```bash
pip show uagents
```

### Creating Your First uAgent

#### Basic Agent Setup

Create a Python script:
```bash
touch my_first_agent.py
```

```python
from uagents import Agent, Context

# instantiate agent
agent = Agent(
    name="alice",
    seed="secret_seed_phrase",
    port=8000,
    endpoint=["http://localhost:8000/submit"]
)

# startup handler
@agent.on_event("startup")
async def startup_function(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")

if __name__ == "__main__":
    agent.run()
```

#### Agent Parameters
- **name**: Identifies the agent (here, "alice")
- **seed**: Sets a deterministic seed, generating fixed addresses each time
- **port and endpoint**: Configure where the agent will be available

#### Behavior on Startup
The `@agent.on_event("startup")` decorator sets a function that runs as soon as the agent launches.

#### Running Your Agent
```bash
python my_first_agent.py
```

**Sample Output**:
```
INFO:     [alice]: Registration on Almanac API successful
INFO:     [alice]: Registering on almanac contract...
INFO:     [alice]: Registering on almanac contract...complete
INFO:     [alice]: Agent inspector available at https://Agentverse.ai/inspect/?uri=http%3A//127.0.0.1%3A8000&address=agent1q...
INFO:     [alice]: Starting server on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     [alice]: Hello, I'm agent alice and my address is agent1q...
```

### Ways to Create uAgents

There are three main ways to create and deploy uAgents, each suited to different needs:

#### 1. Hosted Agents

You can create and host agents directly on Agentverse:

1. Navigate to **Agentverse → Agents tab → + Launch an Agent**
2. Click **Create an Agentverse hosted Agent**
3. Choose **Blank Agent** or **Skeleton Agent**
4. Provide a name for your new Agent
5. Click on the agent and then **Build tab** to open the embedded code editor
6. Add your Python code
7. Click **Start** to run the agent

**Supported Libraries on Agentverse**:
- uagents
- requests
- cosmpy
- pydantic
- uagents-ai-engine
- MySQLdb
- pymongo
- bs64
- faiss-cpu
- fetchai-babble
- google-generativeai
- langchain-anthropic
- langchain-community
- langchain-core
- langchain-google-genai
- langchain-google-vertexai
- langchain-openai
- langchain-text-splitters
- langchain
- nltk
- openai
- tenacity
- unstructured
- validators

**Benefits**:
- Always running (no uptime management)
- Full Python built-in library support
- Specific third-party packages available

#### 2. Local Agents

Local Agents run entirely on your own machine or server:

```python
from uagents import Agent, Context, Model

class Message(Model):
    message: str

SEED_PHRASE = "put_your_seed_phrase_here"

# Now your agent is ready to join the Agentverse!
agent = Agent(
    name="alice",
    port=8000,
    seed=SEED_PHRASE,
    endpoint=["http://localhost:8000/submit"]
)

# Copy the address shown below
print(f"Your agent's address is: {agent.address}")

if __name__ == "__main__":
    agent.run()
```

**Benefits**:
- Complete freedom to import any Python library
- Can handle events, messages, and tasks continuously
- Registered on the Almanac contract for communication
- Full control over environment and dependencies

**Use Case**: Ideal for tasks requiring advanced customization, local file access, or extensive machine learning libraries.

#### 3. Mailbox Agents

When you need to use libraries not allowed by the hosted environment, or you want direct local control while also integrating with Agentverse:

```python
from uagents import Agent, Context, Model

class Message(Model):
    message: str

SEED_PHRASE = "put_your_seed_phrase_here"

# Now your agent is ready to join the Agentverse!
agent = Agent(
    name="alice",
    port=8000,
    mailbox=True        
)

# Copy the address shown below
print(f"Your agent's address is: {agent.address}")

if __name__ == "__main__":
    agent.run()
```

**Benefits**:
- Runs locally but connects to Agentverse via secure channel
- Enables interaction with other hosted or local agents
- Can use restricted libraries
- Direct local control

**Publishing Agent Details**:
```python
agent = Agent(
    name="alice",
    port=8000,
    mailbox=True,
    publish_agent_details=True,
    readme_path="README.md"
)
```

### uAgent Communication

#### Available Handlers

The uAgents Framework provides several handlers for different types of interactions:

- `on_event()`
- `on_message()`
- `on_rest_get()`
- `on_rest_post()`

#### Event Handlers

##### on_event("startup")
```python
@agent.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and my address is {agent.address}.")
```

##### on_event("shutdown")
```python
@agent.on_event("shutdown")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {agent.name} and I am shutting down")
```

#### Message Handlers

The `on_message()` decorator allows agents to send messages between microservice agents in a structured way.

##### uAgent1 Script (Sender)
```python
from uagents import Agent, Context, Model

# Data model (envelope) which you want to send from one agent to another
class Message(Model):
    message: str
    field: int

my_first_agent = Agent(
    name='My First Agent',
    port=5050,
    endpoint=['http://localhost:5050/submit']
)

second_agent = 'your_second_agent_address'

@my_first_agent.on_event('startup')
async def startup_handler(ctx: Context):
    ctx.logger.info(f'My name is {ctx.agent.name} and my address is {ctx.agent.address}')
    await ctx.send(second_agent, Message(message='Hi Second Agent, this is the first agent.'))

if __name__ == "__main__":
    my_first_agent.run()
```

##### uAgent2 Script (Receiver)
```python
from uagents import Agent, Context, Model

class Message(Model):
    message: str

my_second_agent = Agent(
    name='My Second Agent',
    port=5051,
    endpoint=['http://localhost:5051/submit']
)

@my_second_agent.on_event('startup')
async def startup_handler(ctx: Context):
    ctx.logger.info(f'My name is {ctx.agent.name} and my address is {ctx.agent.address}')

@my_second_agent.on_message(model=Message)
async def message_handler(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f'I have received a message from {sender}.')
    ctx.logger.info(f'I have received a message {msg.message}.')

if __name__ == "__main__":
    my_second_agent.run()
```

**Important**: Both agents must use the exact same data model for seamless communication.

#### Running Multiple Agents

Start the receiver first (Terminal 1):
```bash
python3 agent2.py
```

Then start the sender (Terminal 2):
```bash
python3 agent1.py
```

### REST Endpoints

The uAgents Framework allows you to add custom REST endpoints to your agents using `on_rest_get()` and `on_rest_post()` decorators.

#### Example Implementation

```python
import time
from typing import Any, Dict
from uagents import Agent, Context, Model

# Define your models
class Request(Model):
    text: str

class Response(Model):
    timestamp: int
    text: str
    agent_address: str

# Create your agent
agent = Agent(name="Rest API")

# GET endpoint example
@agent.on_rest_get("/rest/get", Response)
async def handle_get(ctx: Context) -> Dict[str, Any]:
    ctx.logger.info("Received GET request")
    return {
        "timestamp": int(time.time()),
        "text": "Hello from the GET handler!",
        "agent_address": ctx.agent.address,
    }

# POST endpoint example
@agent.on_rest_post("/rest/post", Request, Response)
async def handle_post(ctx: Context, req: Request) -> Response:
    ctx.logger.info("Received POST request")
    return Response(
        text=f"Received: {req.text}",
        agent_address=ctx.agent.address,
        timestamp=int(time.time()),
    )

if __name__ == "__main__":
    agent.run()
```

#### Using REST Endpoints

**Query the POST endpoint**:
```bash
curl -d '{"text": "test"}' -H "Content-Type: application/json" -X POST http://localhost:8000/rest/post
```

**Query the GET endpoint**:
```bash
curl http://localhost:8000/rest/get
```

### Agent Communication Methods

The uAgents framework provides two primary methods for agents to communicate:

#### 1. Using ctx.send (Asynchronous Communication)

One-way communication between agents:

```python
from uagents import Agent, Bureau, Context, Model

class Message(Model):
    text: str

alice = Agent(name="alice", seed="alice recovery phrase")
bob = Agent(name="bob", seed="bob recovery phrase")

@alice.on_interval(period=2.0)
async def send_message(ctx: Context):
    msg = f"Hello there {bob.name} my name is {alice.name}."
    await ctx.send(bob.address, Message(text=msg))

@bob.on_message(model=Message)
async def message_handler(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f"Received message from {sender}: {msg.text}")

bureau = Bureau()
bureau.add(alice)
bureau.add(bob)

if __name__ == "__main__":
    bureau.run()
```

#### 2. Using ctx.send_and_receive (Synchronous Communication)

Request-response style communication:

```python
from uagents import Agent, Bureau, Context, Model

class Message(Model):
    message: str

alice = Agent(name="alice")
bob = Agent(name="bob")
clyde = Agent(name="clyde")

@alice.on_interval(period=5.0)
async def send_message(ctx: Context):
    msg = Message(message="Hey Bob, how's Clyde?")
    reply, status = await ctx.send_and_receive(bob.address, msg, response_type=Message)
    if isinstance(reply, Message):
        ctx.logger.info(f"Received awaited response from bob: {reply.message}")
    else:
        ctx.logger.info(f"Failed to receive response from bob: {status}")

@bob.on_message(model=Message)
async def handle_message_and_reply(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f"Received message: {msg.message}")
    new_msg = Message(message="How are you, Clyde?")
    reply, status = await ctx.send_and_receive(
        clyde.address, new_msg, response_type=Message
    )
    if isinstance(reply, Message):
        ctx.logger.info(f"Received awaited response from clyde: {reply.message}")
        await ctx.send(sender, Message(message="Clyde is doing alright!"))
    else:
        ctx.logger.info(f"Failed to receive response from clyde: {status}")

@clyde.on_message(model=Message)
async def handle_message(ctx: Context, sender: str, msg: Message):
    ctx.logger.info(f"Received message from {sender}: {msg.message}")
    await ctx.send(sender, Message(message="I'm doing alright!"))

bureau = Bureau([alice, bob, clyde])

if __name__ == "__main__":
    bureau.run()
```

#### Key Differences

| Feature | ctx.send | ctx.send_and_receive |
|---------|----------|---------------------|
| Communication Pattern | One-way (fire and forget) | Request-response |
| Waiting for Response | No | Yes |
| Return Value | None | Tuple of (response, status) |
| Use Case | Notifications, broadcasts | Queries, confirmations, multi-step workflows |

### Agentverse Overview

The Agentverse is a cloud-based platform for creating and hosting autonomous Agents without the hassle of managing infrastructure.

#### Key Benefits

- **All-In-One Environment**: Integrated code editor, logging console, and file management
- **Continuous Uptime**: Once deployed, agents remain online and responsive
- **Easy Deployment**: Predefined templates and in-browser editor
- **Blockchain Integration**: Agents have their own wallets for tokens and contracts
- **Marketplace & Discovery**: Registered in the Almanac for discoverability
- **Mailroom Service**: Receive messages even when offline
- **Framework Agnostic**: Build with any framework and make it discoverable
- **Scalability & Reliability**: Dynamically scales with message volume
- **Secure & Trustless**: Blockchain-based identity and isolated environments

### Model Context Protocol (MCP) and uAgents Integration

Model Context Protocol (MCP) is an open standard designed to enable AI models and agents to interact with external tools, APIs, and services in a consistent and standardized way.

#### What is MCP?

- **Standardization**: Unified protocol for tool and service access
- **Dynamic Tool Discovery**: Agents can dynamically discover and call tools at runtime
- **Transport Methods**: Supports various communication transports (stdio, SSE, custom)
- **Type Safety**: Tool schemas ensure validated and structured data

#### Why Integrate MCP with uAgents?

**Motivation & Benefits**:
- **Standardized Access**: Schema-based, open protocol for exposing tools and APIs
- **Dynamic Discovery**: Register MCP-enabled agents on Agentverse for discoverability
- **Plug-and-Play Extensibility**: Add new capabilities by connecting MCP servers
- **Ecosystem Growth**: Modular design enables composition and reuse

**Typical Use Cases**:
- Connecting research agents to medical databases (PubMed, clinical trials)
- Enabling travel assistants to access real-time listings (Airbnb)
- Allowing productivity agents to interact with calendars, emails, or web search

#### Main Integration Approaches

##### 1. LangGraph Agent with MCP Adapter
- Create a LangGraph agent using `langchain_mcp_adapters`
- Wrap using `uagents_adapter` to make it a uAgent
- Register on Agentverse for ASI:One LLM discoverability

##### 2. Connect an Agent to Multiple Remote MCP Servers
- Configure uAgent client to connect to remote MCP servers (e.g., Smithery.ai)
- Agent acts as a bridge, forwarding requests to appropriate MCP server
- Register on Agentverse for ecosystem availability

##### 3. Create MCP Server on Agentverse
- Implement FastMCP server in Python
- Use `MCPServerAdapter` from `uagents-adapter` package
- Register as uAgent on Agentverse for tool discoverability

### The Almanac

The Almanac contract is a critical component within the ASI ecosystem, allowing direct access to registered Agents and related information.

#### Key Features

- **Centralized Hub**: Queries about specific Agents and facilitates remote communication
- **Agent Registration**: Agents must register to enable remote interactions
- **Marketplace Discovery**: Registered agents become discoverable via Agentverse Marketplace
- **Dynamic Discovery**: ASI:One LLM can dynamically discover and engage with agents
- **Address Ownership Verification**: Signature validation during registration ensures accuracy
- **Regular Updates**: Agents must update registration details within specific block limitations

#### Public and Private Agents

Agents offer flexibility of being designated as either public or private:

- **Protocols**: Establish rules and message structures governing agent interactions
- **Almanac**: Operates as decentralized directory housing agent details and protocol manifests
- **Discoverability**: Organized description of communication protocols facilitates discovery
- **Marketplace Integration**: Users can explore and interact with agents via Agentverse Marketplace

## Agentverse API Reference

The Agentverse provides a comprehensive REST API for managing agents, handling mailbox communications, and discovering agents within the ASI ecosystem. This API enables developers to integrate agent functionality into their applications and build sophisticated agent-based systems.

### Base URL
```
https://agentverse.ai/v1
```

### Authentication
Most endpoints require Bearer token authentication:
```
Authorization: Bearer <your_token>
```

### Search API

#### Search Agents
Search for agents in the Agentverse marketplace with advanced filtering and pagination options.

**Endpoint:** `POST /v1/search/agents`

**Request Body:**
```json
{
  "filters": {
    "category": "fetch-ai",
    "type": "hosted",
    "status": "active"
  },
  "search_text": "medical assistant",
  "semantic_search": true,
  "sort": "relevancy",
  "direction": "desc",
  "offset": 0,
  "limit": 30,
  "exclude_geo_agents": true,
  "source": "agentverse"
}
```

**Response:**
```json
{
  "offset": 0,
  "limit": 30,
  "num_hits": 15,
  "total": 150,
  "search_id": "uuid4-string",
  "agents": [
    {
      "name": "Medical Assistant Agent",
      "address": "agent1q...",
      "domain": "medical.example.com",
      "prefix": "agent",
      "readme": "A comprehensive medical assistant...",
      "description": "AI agent for medical consultations",
      "protocols": [
        {
          "name": "medical_protocol",
          "version": "1.0",
          "digest": "abc123..."
        }
      ],
      "avatar_href": "https://example.com/avatar.png",
      "total_interactions": 1250,
      "recent_interactions": 45,
      "rating": 4.8,
      "status": "active",
      "type": "hosted",
      "featured": true,
      "category": "fetch-ai",
      "system_wide_tags": ["medical", "healthcare", "ai"],
      "geo_location": {
        "name": "Global",
        "latitude": 0,
        "longitude": 0
      },
      "handle": "medical_assistant",
      "last_updated": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "recent_success_rate": 0.95,
      "recent_eval_success_rate": 0.92
    }
  ]
}
```

**Python Example:**
```python
import requests
import json

def search_agents(query, filters=None):
    url = "https://agentverse.ai/v1/search/agents"
    payload = {
        "search_text": query,
        "semantic_search": True,
        "sort": "relevancy",
        "direction": "desc",
        "limit": 30
    }
    
    if filters:
        payload["filters"] = filters
    
    response = requests.post(url, json=payload)
    return response.json()

# Search for medical agents
results = search_agents("medical assistant", {"category": "fetch-ai"})
print(f"Found {results['num_hits']} agents")
```

#### Search Feedback
Submit feedback when users click on search results for analytics.

**Endpoint:** `POST /v1/search/agents/click`

**Request Body:**
```json
{
  "address": "agent1q...",
  "search_id": "uuid4-string",
  "page_index": 0,
  "contract": "mainnet"
}
```

### Mailbox API

#### Submit Message Envelope
Send messages between agents through the mailbox service.

**Endpoint:** `POST /v1/submit`

**Request Body:**
```json
{
  "version": 1,
  "sender": "agent1q...",
  "target": "agent1q...",
  "session": "uuid4-string",
  "schema_digest": "abc123...",
  "protocol_digest": "def456...",
  "payload": "base64_encoded_message",
  "expires": 1640995200,
  "nonce": 12345,
  "signature": "signature_string"
}
```

**Python Example:**
```python
import base64
import json
from datetime import datetime, timedelta

def send_message(sender_address, target_address, message_data):
    url = "https://agentverse.ai/v1/submit"
    
    # Encode message payload
    payload = base64.b64encode(json.dumps(message_data).encode()).decode()
    
    # Calculate expiration (1 hour from now)
    expires = int((datetime.now() + timedelta(hours=1)).timestamp())
    
    envelope = {
        "version": 1,
        "sender": sender_address,
        "target": target_address,
        "session": "unique-session-id",
        "schema_digest": "message_schema_digest",
        "payload": payload,
        "expires": expires,
        "nonce": 12345
    }
    
    response = requests.post(url, json=envelope)
    return response.json()
```

#### List Mailbox Messages
Retrieve messages from the mailbox with pagination.

**Endpoint:** `GET /v1/mailbox`

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Page size (default: 50, max: 100)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {
      "uuid": "uuid4-string",
      "envelope": {
        "version": 1,
        "sender": "agent1q...",
        "target": "agent1q...",
        "session": "uuid4-string",
        "schema_digest": "abc123...",
        "payload": "base64_encoded_message",
        "expires": 1640995200,
        "nonce": 12345,
        "signature": "signature_string"
      },
      "received_at": "2024-01-15T10:30:00Z",
      "expires_at": "2024-01-15T11:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "size": 50,
  "pages": 1
}
```

#### Get Specific Envelope
Retrieve a specific message envelope by UUID.

**Endpoint:** `GET /v1/mailbox/{uuid}`

**Headers:**
```
Authorization: Bearer <token>
```

#### Delete Messages
Delete all mailbox messages or a specific message.

**Endpoints:**
- `DELETE /v1/mailbox` - Delete all messages
- `DELETE /v1/mailbox/{uuid}` - Delete specific message

### Agents API

#### List User Agents
Get all agents belonging to the authenticated user.

**Endpoint:** `GET /v1/agents`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Page size (default: 50, max: 100)

**Response:**
```json
{
  "items": [
    {
      "name": "My Medical Agent",
      "address": "agent1q...",
      "prefix": "agent",
      "avatar_url": "https://example.com/avatar.png",
      "readme": "A medical consultation agent...",
      "short_description": "Medical AI assistant",
      "pending_messages": 5,
      "bytes_transferred": 1024000,
      "previous_bytes_transferred": 512000,
      "agent_type": "mailbox"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 50,
  "pages": 1
}
```

#### Register Agent
Register a new agent on the platform.

**Endpoint:** `POST /v1/agents`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "address": "agent1q...",
  "challenge": "challenge_string",
  "challenge_response": "response_string",
  "agent_type": "mailbox",
  "prefix": "agent",
  "endpoint": "https://myagent.example.com"
}
```

**Python Example:**
```python
def register_agent(address, challenge, response, agent_type="mailbox"):
    url = "https://agentverse.ai/v1/agents"
    headers = {
        "Authorization": f"Bearer {your_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "address": address,
        "challenge": challenge,
        "challenge_response": response,
        "agent_type": agent_type,
        "prefix": "agent"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
```

#### Get Agent Details
Retrieve detailed information about a specific agent.

**Endpoint:** `GET /v1/agents/{address}`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "name": "Medical Assistant",
  "address": "agent1q...",
  "running": true,
  "revision": 5,
  "domain": "medical.example.com",
  "prefix": "agent",
  "compiled": true,
  "code_digest": "abc123...",
  "wallet_address": "fetch1q...",
  "code_update_timestamp": "2024-01-15T10:30:00Z",
  "creation_timestamp": "2024-01-01T00:00:00Z",
  "avatar_url": "https://example.com/avatar.png",
  "maintainer_id": "user123",
  "readme": "A comprehensive medical assistant...",
  "short_description": "AI-powered medical consultations",
  "metadata": {
    "category": "healthcare",
    "tags": ["medical", "ai"]
  },
  "total_interactions": 1250
}
```

#### Update Agent
Update agent information and metadata.

**Endpoint:** `PUT /v1/agents/{address}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Medical Assistant",
  "readme": "Updated description...",
  "avatar_url": "https://example.com/new-avatar.png",
  "short_description": "Updated short description",
  "agent_type": "mailbox"
}
```

#### Delete Agent
Remove an agent from the platform.

**Endpoint:** `DELETE /v1/agents/{address}`

**Headers:**
```
Authorization: Bearer <token>
```

### Team Agents API

#### List Team Agents
Get all agents belonging to a team.

**Endpoint:** `GET /v1/mailroom/teams/{slug}/agents`

**Headers:**
```
Authorization: Bearer <token>
```

#### Get Team Agent
Retrieve details of a specific team agent.

**Endpoint:** `GET /v1/mailroom/teams/{slug}/agents/{address}`

#### Update Team Agent
Update team agent information.

**Endpoint:** `PUT /v1/mailroom/teams/{slug}/agents/{address}`

#### Delete Team Agent
Remove a team agent.

**Endpoint:** `DELETE /v1/mailroom/teams/{slug}/agents/{address}`

### Public Agent Profiles

#### Get Public Agent Profile
Retrieve public information about any agent.

**Endpoint:** `GET /v1/agents/{address}/profile`

**No authentication required**

**Response:**
```json
{
  "name": "Medical Assistant",
  "author_username": "developer123",
  "address": "agent1q...",
  "running": true,
  "total_interactions": 1250,
  "last_updated_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "domain": "medical.example.com",
  "prefix": "agent",
  "readme": "A comprehensive medical assistant...",
  "short_description": "AI-powered medical consultations",
  "maintainer_id": "user123",
  "avatar_url": "https://example.com/avatar.png",
  "metadata": {
    "category": "healthcare"
  }
}
```

### Error Handling

All API endpoints return standard HTTP status codes:

- `200`: Success
- `422`: Unprocessable Entity (validation errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

**Error Response Format:**
```json
{
  "error": "Validation Error",
  "message": "Invalid agent address format",
  "details": {
    "field": "address",
    "code": "invalid_format"
  }
}
```

### Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Search endpoints**: 100 requests per minute
- **Mailbox endpoints**: 1000 requests per minute
- **Agent management**: 60 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Best Practices

1. **Always use HTTPS** for all API requests
2. **Implement proper error handling** for all API calls
3. **Cache agent search results** to reduce API calls
4. **Use pagination** for large result sets
5. **Store authentication tokens securely**
6. **Implement retry logic** for transient failures
7. **Monitor rate limits** to avoid throttling

### SDK and Libraries

While direct API access is available, consider using official SDKs:

```python
# Python SDK example
from uagents import Agent
from uagents.api import AgentverseAPI

# Initialize API client
api = AgentverseAPI(token="your_token")

# Search for agents
agents = api.search_agents("medical assistant")

# Register your agent
agent = Agent(name="my_agent", seed="your_seed")
api.register_agent(agent)
```

## Conclusion

The ASI Alliance hackathon presents an exciting opportunity to build innovative AI agent systems that combine the power of Fetch.ai's decentralized agent framework with SingularityNET's MeTTa knowledge reasoning capabilities. The integration of these technologies enables developers to create sophisticated, autonomous agents that can reason over structured knowledge while maintaining the benefits of decentralization and blockchain technology.

The comprehensive prize structure and clear judging criteria make this an excellent opportunity for developers to showcase their skills in building next-generation AI agent systems that can have real-world impact.

With the detailed uAgents framework documentation and comprehensive API reference provided above, developers have everything they need to:
- Install and set up the uAgents framework
- Create different types of agents (hosted, local, mailbox)
- Implement agent communication patterns
- Integrate with external services via MCP
- Deploy and manage agents on Agentverse
- Leverage the Almanac for agent discovery and communication
- Use the Agentverse API for advanced agent management and discovery
- Build sophisticated multi-agent systems with proper API integration
