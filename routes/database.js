const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Database stats endpoint
router.get('/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as count FROM ceo_agents',
    'SELECT COUNT(*) as count FROM companies', 
    'SELECT COUNT(*) as count FROM agent_token_holdings',
    'SELECT COUNT(*) as count FROM ideas'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    })
  ))
  .then(([agents, companies, holdings, ideas]) => {
    res.json({
      success: true,
      agents,
      companies, 
      holdings,
      ideas
    });
  })
  .catch(error => {
    console.error('Database stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  });
});

// Get all CEO agents
router.get('/ceo-agents', (req, res) => {
  const query = `
    SELECT id, name, company_idea, description, ceo_characteristics, 
           creator_wallet, token_symbol, total_tokens, tokens_available, 
           price_per_token, status, created_at, updated_at
    FROM ceo_agents 
    ORDER BY created_at DESC
  `;
  
  db.all(query, (err, agents) => {
    if (err) {
      console.error('Get CEO agents error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: agents });
  });
});

// Get all companies with CEO agent names
router.get('/companies', (req, res) => {
  const query = `
    SELECT c.id, c.name, c.status, c.current_revenue, c.launched_date, c.created_at,
           ca.name as ceo_agent_name, ca.token_symbol
    FROM companies c
    LEFT JOIN ceo_agents ca ON c.ceo_agent_id = ca.id
    ORDER BY c.created_at DESC
  `;
  
  db.all(query, (err, companies) => {
    if (err) {
      console.error('Get companies error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: companies });
  });
});

// Get all token holdings with agent details
router.get('/portfolio/all', (req, res) => {
  const query = `
    SELECT h.id, h.user_wallet, h.tokens_owned, h.purchase_price, h.purchase_date,
           ca.name as agent_name, ca.token_symbol, ca.price_per_token as current_price
    FROM agent_token_holdings h
    LEFT JOIN ceo_agents ca ON h.ceo_agent_id = ca.id
    ORDER BY h.purchase_date DESC
  `;
  
  db.all(query, (err, holdings) => {
    if (err) {
      console.error('Get holdings error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: holdings });
  });
});

// Get recent ideas (for dashboard)
router.get('/ideas', (req, res) => {
  const limit = req.query.limit || 50;
  const query = `
    SELECT id, title, description, status, created_at, updated_at
    FROM ideas 
    ORDER BY created_at DESC 
    LIMIT ?
  `;
  
  db.all(query, [limit], (err, ideas) => {
    if (err) {
      console.error('Get ideas error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, ideas });
  });
});

// Note: POST routes for creating CEO agents and buying tokens are now handled
// exclusively in routes/ceo-agents.js to avoid duplication

module.exports = router;
