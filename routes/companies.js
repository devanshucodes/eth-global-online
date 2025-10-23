const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Get all companies with CEO agent details
router.get('/', (req, res) => {
  const query = `
    SELECT id, name, status, current_revenue, launched_date, created_at,
           ceo_agent_name, token_symbol, company_idea, description, 
           ceo_characteristics, total_tokens, price_per_token, time_duration
    FROM companies
    ORDER BY created_at DESC
  `;
  
  db.all(query, (err, companies) => {
    if (err) {
      console.error('Get companies error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: companies });
  });
});

// Get single company
router.get('/:id', (req, res) => {
  const companyId = req.params.id;
  
  const query = `
    SELECT * FROM companies WHERE id = ?
  `;
  
  db.get(query, [companyId], (err, company) => {
    if (err) {
      console.error('Get company error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }
    
    res.json({ success: true, company });
  });
});

module.exports = router;
