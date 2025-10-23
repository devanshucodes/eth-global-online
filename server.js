const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS configuration for multiple ports
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:5001',
    'http://127.0.0.1:5001'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Add Cross-Origin-Isolated headers for SharedArrayBuffer support
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Import routes
const healthRoutes = require('./routes/health');
const agentRoutes = require('./routes/agents');
const ideaRoutes = require('./routes/ideas');
const tokenRoutes = require('./routes/tokens');
const financeRoutes = require('./routes/finance');
const databaseRoutes = require('./routes/database');
const ceoAgentRoutes = require('./routes/ceo-agents');
const companyRoutes = require('./routes/companies');
const portfolioRoutes = require('./routes/portfolio');
const companyWorkflowRoutes = require('./routes/company-workflow');

// Import Web3 service to initialize
const web3Service = require('./services/web3Service');

// API Routes (before static files)
app.use('/api/health-check', healthRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/finance', financeRoutes);

// Database API routes
app.use('/api/database', databaseRoutes);
app.use('/api/ceo-agents', ceoAgentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/company-workflow', companyWorkflowRoutes);

// Serve database dashboard
app.get('/database-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'database-dashboard.html'));
});

// Serve static files from React app build (if it exists)
const buildPath = path.join(__dirname, 'client/build');
if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // Serve React app for non-API routes
  app.get('*', (req, res) => {
    // Don't serve React app for API routes or dashboard
    if (req.path.startsWith('/api/') || req.path === '/database-dashboard') {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  console.log('⚠️  React build not found. Only serving API and dashboard.');
  
  // Simple fallback for non-API routes
  app.get('/', (req, res) => {
    res.redirect('/database-dashboard');
  });
  
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path === '/database-dashboard') {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.redirect('/database-dashboard');
  });
}

app.listen(PORT, () => {
  console.log(`AI Company server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`🔑 [SERVER] ASI_ONE_API_KEY exists: ${!!process.env.ASI_ONE_API_KEY}`);
  console.log(`🔑 [SERVER] ASI_ONE_API_KEY length: ${process.env.ASI_ONE_API_KEY?.length || 0}`);
});
