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

// Create new CEO agent
router.post('/ceo-agents', (req, res) => {
  const {
    name,
    company_idea,
    description,
    ceo_characteristics,
    creator_wallet,
    token_symbol,
    total_tokens = 100,
    price_per_token = 5.0
  } = req.body;

  // Validate required fields
  if (!name || !company_idea || !description || !ceo_characteristics || !token_symbol) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, company_idea, description, ceo_characteristics, token_symbol'
    });
  }

  const query = `
    INSERT INTO ceo_agents (
      name, company_idea, description, ceo_characteristics, 
      creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const tokens_available = total_tokens; // All tokens available initially

  db.run(query, [
    name, company_idea, description, ceo_characteristics,
    creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token
  ], function(err) {
    if (err) {
      console.error('Create CEO agent error:', err);
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'Token symbol already exists. Please choose a different symbol.'
        });
      }
      return res.status(500).json({ success: false, error: err.message });
    }

    // Return the created agent
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [this.lastID], (err, agent) => {
      if (err) {
        console.error('Get created agent error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.status(201).json({
        success: true,
        message: 'CEO Agent created successfully!',
        agent
      });
    });
  });
});

// Buy tokens in a CEO agent
router.post('/ceo-agents/:id/buy-tokens', (req, res) => {
  const agentId = req.params.id;
  const { user_wallet, tokens_to_buy } = req.body;

  if (!user_wallet || !tokens_to_buy || tokens_to_buy <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request. Need user_wallet and positive tokens_to_buy.'
    });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check if enough tokens available
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!agent) {
        db.run('ROLLBACK');
        return res.status(404).json({ success: false, error: 'CEO Agent not found' });
      }

      if (agent.tokens_available < tokens_to_buy) {
        db.run('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `Not enough tokens available. Only ${agent.tokens_available} tokens left.`
        });
      }

      // Update agent tokens_available
      db.run(
        'UPDATE ceo_agents SET tokens_available = tokens_available - ? WHERE id = ?',
        [tokens_to_buy, agentId],
        (err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ success: false, error: err.message });
          }

          // Record the token purchase
          db.run(
            `INSERT INTO agent_token_holdings (user_wallet, ceo_agent_id, tokens_owned, purchase_price)
             VALUES (?, ?, ?, ?)`,
            [user_wallet, agentId, tokens_to_buy, agent.price_per_token],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, error: err.message });
              }

              db.run('COMMIT');
              res.json({
                success: true,
                message: `Successfully purchased ${tokens_to_buy} ${agent.token_symbol} tokens!`,
                purchase: {
                  tokens_bought: tokens_to_buy,
                  price_per_token: agent.price_per_token,
                  total_cost: tokens_to_buy * agent.price_per_token,
                  agent_name: agent.name
                }
              });
            }
          );
        }
      );
    });
  });
});

module.exports = router;
