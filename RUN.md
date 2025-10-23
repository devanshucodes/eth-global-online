# 🚀 AI Company - Zero-Man Organization - Run Guide

## 📋 **Quick Start (TL;DR)**

```bash
# 1. Setup environment
cp env.example .env
# Edit .env and add your ASI:One API key

# 2. Install dependencies
npm install
cd client && npm install && cd ..

# 3. Initialize database
node database/setup.js

# 4. Start servers (in separate terminals)
PORT=5001 npm start                                           # Backend
REACT_APP_API_URL=http://localhost:5001 PORT=3001 npm run client  # Frontend

# 5. Access your AI Company
# Open: http://localhost:3001
```

---

## 🔧 **Detailed Setup Instructions**

### **Prerequisites**
- Node.js (v14 or higher)
- npm (comes with Node.js)
- ASI:One API key from ASI Alliance
- (Optional) Avalanche wallet private key for blockchain features

### **Step 1: Clone & Navigate**
```bash
cd /path/to/zmc-main
```

### **Step 2: Environment Configuration**
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file with your settings
nano .env  # or use any text editor
```

**Required `.env` Configuration:**
```bash
# REQUIRED: ASI:One API Configuration
ASI_ONE_API_KEY=sk_your-actual-asi-one-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./database/ai_company.db

# OPTIONAL: Web3 Configuration for Revenue Distribution
PRIVATE_KEY=your_avalanche_wallet_private_key_here
CONTRACT_ADDRESS=0x0471AaD869eBa890d63A2f276828879A9a375858
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# OPTIONAL: n8n Integration (for marketing agent)
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

### **Step 3: Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Install Bolt.diy dependencies (for website development)
cd bolt.diy-main
npm install --legacy-peer-deps
cd ..
```

### **Step 4: Initialize Database**
```bash
# Create and setup SQLite database
node database/setup.js
```
**Expected Output:**
```
Database initialized successfully
```

---

## 🖥️ **Running the Application**

### **Method 1: Default Ports (Recommended)**
**If ports 3000/5000/5173 are available:**

```bash
# Terminal 1 - Backend Server
npm start

# Terminal 2 - Frontend Server
npm run client

# Terminal 3 - Bolt.diy (Developer Agent)
cd bolt.diy-main && npm run dev
```

**Access:** 
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Bolt.diy: [http://localhost:5173](http://localhost:5173)

### **Method 2: Custom Ports (If Default Ports Busy)**
**If you have port conflicts:**

```bash
# Terminal 1 - Backend Server (Port 5001)
PORT=5001 npm start

# Terminal 2 - Frontend Server (Port 3001)
REACT_APP_API_URL=http://localhost:5001 PORT=3001 npm run client

# Terminal 3 - Bolt.diy (Developer Agent)
cd bolt.diy-main && npm run dev
```

**Access:**
- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:5001](http://localhost:5001)
- Bolt.diy: [http://localhost:5173](http://localhost:5173)

### **Method 3: Production Build**
```bash
# Build frontend for production
cd client
npm run build
cd ..

# Start backend (serves built frontend)
npm start

# Access: http://localhost:5000
```

---

## 🔍 **Troubleshooting Common Issues**

### **Port Already in Use Error**
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Kill existing processes:**
   ```bash
   pkill -f "node server.js"
   pkill -f "react-scripts"
   ```

2. **Use different ports:**
   ```bash
   PORT=5001 npm start
   PORT=3001 npm run client
   ```

3. **Find what's using the port:**
   ```bash
   lsof -i :5000  # Check port 5000
   lsof -i :3000  # Check port 3000
   ```

### **ASI:One API Key Issues**
```bash
# Test your API key
curl -X GET http://localhost:5001/api/agents/test-api-key
```

**Common Issues:**
- API key doesn't start with `sk-ant-`
- API key has extra spaces or newlines
- API key is not set in `.env` file

### **Database Issues**
```bash
# Reinitialize database
rm database/ai_company.db
node database/setup.js
```

### **Frontend Not Loading**
1. **Clear browser cache:** `Ctrl+Shift+R` (or `Cmd+Shift+R`)
2. **Check console for errors:** F12 → Console tab
3. **Verify backend is running:** Visit `http://localhost:5001/api/agents/test-api-key`

### **Bolt.diy Issues**
```bash
# If Bolt.diy fails to install (memory issues)
cd bolt.diy-main
NODE_OPTIONS="--max-old-space-size=8192" npm install --legacy-peer-deps

# If build fails, try building first
npm run build
npm run dev

# Alternative start methods
npm run start:simple  # Simple start without interactive session
npm run dev          # Development mode (recommended)

# Check if running
curl http://localhost:5173
```

### **"Generate New Idea" Not Working**
**Issue**: Button shows "Generating..." but no ideas appear

**Cause**: Invalid ASI:One API key format

**Fix**:
```bash
# Edit .env file and ensure this line:
ASI_ONE_API_KEY=sk_your-actual-asi-one-api-key-here  # ✅ Correct format

# Then restart the server:
pkill -f "node server.js"
PORT=5001 npm start
```

---

## 🎯 **How to Use the AI Company**

### **1. Generate Business Ideas**
- Click **"Generate New Idea ($1M Potential)"**
- CEO Agent creates innovative business concepts
- Ideas appear in the main dashboard

### **2. Approve & Start Workflow**
- Review generated ideas
- Click **"✅ Approve & Start Research"**
- Watch agents work automatically:
  ```
  CEO → Research → Product → CMO → CTO → Engineering → Developer
  ```

### **3. Monitor Agent Activity**
- Real-time agent activity in terminal-style section
- Track progress through each stage
- See data transfers between agents

### **4. Revenue Dashboard**
- Switch to **"💰 Revenue Dashboard"** tab
- Monitor blockchain transactions
- View token holder dividends
- Track project completions

### **5. Website Development**
- When "Developer Agent" becomes clickable
- Click to open Bolt.diy integration at [http://localhost:5173](http://localhost:5173)
- Automated website creation with ASI:One Mini
- Custom "Team Zero" branding with streamlined interface

---

## 🔗 **API Endpoints**

### **Agent Endpoints**
```bash
POST /api/agents/generate-ideas     # Generate business ideas
POST /api/agents/research          # Research an idea
POST /api/agents/develop-product    # Develop product concept
POST /api/agents/marketing-strategy # Create marketing strategy
POST /api/agents/technical-strategy # Create technical strategy
POST /api/agents/bolt-prompt       # Generate website prompt
GET  /api/agents/test-api-key      # Test ASI:One API key
```

### **Finance Endpoints**
```bash
POST /api/finance/distribute-revenue    # Distribute project revenue
POST /api/finance/complete-project     # Mark project complete
GET  /api/finance/report              # Financial report
GET  /api/finance/contract-info       # Smart contract info
GET  /api/finance/token-holders       # Token holder list
```

### **Testing Endpoints**
```bash
# Test backend
curl http://localhost:5001/api/agents/test-api-key

# Test ASI:One API integration
curl http://localhost:5001/api/agents/test-asi-one-api
```

---

## 📁 **Project Structure**

```
zmc-main/
├── agents/                 # AI Agent implementations
│   ├── ASIOneAgent.js     # Base agent class
│   ├── CEOAgent.js        # CEO agent
│   ├── ResearchAgent.js   # Research agent
│   ├── ProductAgent.js    # Product agent
│   ├── CMOAgent.js        # Marketing agent
│   ├── CTOAgent.js        # Technical agent
│   ├── HeadOfEngineeringAgent.js
│   └── FinanceAgent.js    # Finance/revenue agent
├── routes/                # API routes
│   ├── agents.js          # Agent endpoints
│   ├── finance.js         # Finance endpoints
│   ├── ideas.js           # Idea management
│   └── tokens.js          # Token/voting system
├── database/              # Database setup
│   ├── setup.js           # SQLite initialization
│   └── ai_company.db      # SQLite database
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main dashboard
│   │   ├── App.css        # Professional styling
│   │   ├── AgentFlow.js   # Agent workflow component
│   │   └── RevenueDashboard.js
│   └── package.json
├── services/              # Backend services
│   ├── web3Service.js     # Blockchain integration
│   └── revenueAutomation.js
├── smartcontracts/        # Smart contract code
├── bolt.diy-main/         # Custom Bolt.diy integration
├── server.js              # Express server
├── package.json           # Backend dependencies
├── .env                   # Environment variables
└── RUN.md                 # This file
```

---

## 🔐 **Security Notes**

### **Environment Variables**
- **Never commit `.env` file to git**
- Keep API keys and private keys secure
- Use different keys for development/production

### **API Keys**
- ASI:One API key format: `sk_...`
- Get from: [https://docs.asi1.ai/docs/](https://docs.asi1.ai/docs/)
- Monitor usage to avoid unexpected charges

### **Blockchain**
- Private key is for Avalanche testnet by default
- For mainnet, change `AVALANCHE_RPC_URL`
- Never share private keys publicly

---

## 🚀 **Production Deployment**

### **Railway Deployment**
```bash
# Uses railway.json configuration
railway login
railway up
```

### **Docker Deployment**
```bash
# Build and run with Docker
docker-compose up -d
```

### **Manual Deployment**
1. Set `NODE_ENV=production`
2. Build frontend: `cd client && npm run build`
3. Start server: `npm start`
4. Configure reverse proxy (nginx)

---

## 🔧 **Development Commands**

```bash
# Install all dependencies (backend + frontend + bolt.diy)
npm run install-all

# Start development servers
npm run dev          # Backend with nodemon
npm run client       # Frontend development server

# Build for production
npm run build        # Builds frontend

# Database management
node database/setup.js           # Initialize database
rm database/ai_company.db        # Reset database
```

---

## 📊 **Monitoring & Logs**

### **Backend Logs**
- Server logs show agent activities
- API key validation results
- Database operations
- Web3 transactions

### **Frontend Console**
- Agent workflow progress
- API communication
- Error messages
- State updates

### **Database Inspection**
```bash
# View database contents
sqlite3 database/ai_company.db
.tables
SELECT * FROM ideas;
SELECT * FROM agent_activities;
```

---

## 🆘 **Getting Help**

### **Common Commands**
```bash
# Check running processes
ps aux | grep node

# Kill all node processes
pkill -f node

# Check port usage
lsof -i :3000
lsof -i :5000

# Restart everything fresh
pkill -f node && npm start & npm run client
```

### **Debug Mode**
```bash
NODE_ENV=development DEBUG=* npm start
```

### **Log Files**
- Backend logs: Terminal output
- Frontend logs: Browser console (F12)
- Server errors: `server.log` (if configured)

---

## 🎉 **Success Indicators**

### **Backend Started Successfully**
```bash
Database initialized successfully
✅ Web3 Service initialized successfully
AI Company server running on port 5001
🔑 [SERVER] ASI_ONE_API_KEY exists: true
```

### **Frontend Started Successfully**
```bash
Compiled successfully!
You can now view client in the browser.
Local: http://localhost:3001
```

### **System Working**
- ✅ Frontend loads without errors
- ✅ "Generate New Idea" button works
- ✅ Agent activity shows in terminal section
- ✅ Revenue dashboard accessible
- ✅ No console errors

---

**🚀 Your AI Company - Zero-Man Organization is ready to revolutionize autonomous business operations!**

For support, check the console logs and ensure all environment variables are properly configured.
