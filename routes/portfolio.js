const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Get all token holdings with agent details
router.get('/all', (req, res) => {
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

// Get portfolio for specific user
router.get('/:wallet', (req, res) => {
  const userWallet = req.params.wallet;
  
  const query = `
    SELECT h.id, h.user_wallet, h.tokens_owned, h.purchase_price, h.purchase_date,
           ca.name as agent_name, ca.token_symbol, ca.price_per_token as current_price,
           ca.company_idea, ca.description
    FROM agent_token_holdings h
    LEFT JOIN ceo_agents ca ON h.ceo_agent_id = ca.id
    WHERE h.user_wallet = ?
    ORDER BY h.purchase_date DESC
  `;
  
  db.all(query, [userWallet], (err, holdings) => {
    if (err) {
      console.error('Get user portfolio error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    // Calculate portfolio summary
    const totalValue = holdings.reduce((sum, holding) => 
      sum + (holding.tokens_owned * holding.current_price), 0
    );
    
    const totalTokens = holdings.reduce((sum, holding) => 
      sum + holding.tokens_owned, 0
    );
    
    res.json({ 
      success: true, 
      portfolio: {
        user_wallet: userWallet,
        total_value: totalValue,
        total_tokens: totalTokens,
        holdings: holdings
      }
    });
  });
});

module.exports = router;
