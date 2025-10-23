const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

router.get('/health-check', (req, res) => {
  // Check database connectivity
  db.get('SELECT 1', (err) => {
    if (err) {
      console.error('Database health check failed:', err);
      return res.status(503).json({ 
        success: false, 
        message: 'Database connection error',
        error: err.message
      });
    }

    res.json({ 
      success: true, 
      message: 'API and database connection healthy', 
      apiVersion: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
});

module.exports = router;