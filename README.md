# 🤖 AI Company - Fully Automated Organization

An AI-powered company platform with hierarchical AI agents and token holder governance.

## 🚀 How to Run

### Prerequisites
- Node.js 18+ 
- Python 3.9+

### Installation

1. **Install dependencies:**
```bash
npm install
cd client && npm install && cd ..
```

2. **Configure environment:**
```bash
cp env.example .env
# Edit .env and add your API key
```

3. **Initialize database:**
```bash
node database/setup-with-fallback.js
```

4. **Start the system:**
```bash
# Terminal 1 - Backend server
npm start

# Terminal 2 - Python agents
cd ai_uagents
python3 ceo_uagent.py &
python3 research_uagent.py &
python3 product_uagent.py &
python3 cmo_uagent.py &
python3 cto_uagent.py &
python3 head_engineering_uagent.py &
python3 finance_uagent.py &
python3 orchestrator_uagent.py &

# Terminal 3 - Frontend
npm run client
```

5. **Access the platform:**
- **Backend**: http://localhost:5001
- **Frontend**: http://localhost:3000
- **Agents**: Ports 8001-8008

## 🎯 How It Works

### Workflow
1. **Generate Ideas**: CEO Agent creates business ideas
2. **Token Holder Vote**: Approve/reject ideas via dashboard
3. **Research Phase**: Research Agent analyzes approved ideas
4. **Product Development**: Product Agent creates detailed concepts
5. **CEO Validation**: CEO Agent evaluates product concepts
6. **Token Holder Vote**: Approve/reject product concepts
7. **Marketing Strategy**: CMO Agent develops marketing plans
8. **Technical Strategy**: CTO Agent creates technical architecture
9. **Marketing Agent**: Executes campaigns
10. **Head of Engineering**: Creates development prompts
11. **Developer Agent**: Opens development interface

### Agent Hierarchy
```
CEO Agent (Idea Generation & Validation)
├── Research Agent (Market Analysis)
├── Product Agent (Product Development)
├── CMO Agent (Marketing Strategy)
│   └── Marketing Agent (Campaign Execution)
├── CTO Agent (Technical Strategy)
│   └── Head of Engineering Agent (Development Prompts)
│       └── Developer Agent (Website Development)
└── Finance Agent (Revenue Distribution)
    └── Smart Contract (Profit Sharing)
```

## 🛠️ Features

- **CEO Agent**: Generates business ideas
- **Research Agent**: Market research and competitive analysis
- **Product Agent**: Product concept development
- **Finance Agent**: Revenue analysis and distribution
- **Token Holder Dashboard**: Voting and approval interface
- **Revenue Dashboard**: Real-time tracking and monitoring
- **Smart Contract Integration**: Automated profit sharing
- **Database**: SQLite storage
- **API Server**: RESTful API for agent communication

## 📁 Project Structure

```
team-zero/
├── agents/                 # AI Agent implementations
│   ├── ASIOneAgent.js     # Base agent class
│   ├── CEOAgent.js        # CEO agent
│   ├── ResearchAgent.js   # Research agent
│   └── ProductAgent.js    # Product agent
├── routes/                # API routes
│   ├── agents.js          # Agent endpoints
│   ├── ideas.js           # Idea management
│   └── tokens.js          # Voting system
├── database/              # Database setup
│   └── setup.js           # SQLite initialization
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main dashboard
│   │   └── App.css        # Styling
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md              # This file
```

## 🔧 API Endpoints

- `POST /api/agents/generate-ideas` - Generate business ideas
- `POST /api/agents/research/:ideaId` - Research an idea
- `POST /api/agents/develop-product/:ideaId` - Develop product
- `GET /api/agents/activities` - Get agent activity
- `GET /api/ideas` - Get all ideas
- `PUT /api/ideas/:id/status` - Update idea status
- `POST /api/tokens/vote` - Vote on ideas/products
- `POST /api/finance/distribute-revenue` - Distribute revenue
- `GET /api/finance/report` - Generate financial report

## 🎮 Usage

1. **Start the system** (see How to Run above)
2. **Generate idea**: Click "Generate New Idea" button
3. **Approve idea**: Click "Approve & Start Research"
4. **Watch agents work**: See real-time agent activity
5. **Monitor progress**: Track all agent activities in dashboard

## 🔑 Environment Variables

```bash
# Required
API_KEY=your_api_key_here

# Blockchain Configuration
PRIVATE_KEY=your_wallet_private_key_here
CONTRACT_ADDRESS=your_contract_address
RPC_URL=your_rpc_url

# Optional
PORT=5000
NODE_ENV=development
DB_PATH=./database/ai_company.db
```

## � Project Structure

```
eth-global2025/
├── agents/                 # AI Agent implementations
├── routes/                # API routes
├── database/              # Database setup
├── client/                # React frontend
├── ai_uagents/           # Python agents
├── services/              # Backend services
├── smartcontracts/        # Smart contracts
└── server.js              # Express server
```

---

**Building an AI-powered autonomous company platform with hierarchical agents and token governance.**
