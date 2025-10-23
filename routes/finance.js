const express = require('express');
const router = express.Router();
const FinanceAgent = require('../agents/FinanceAgent');
const web3Service = require('../services/web3Service');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.DB_PATH || './database/ai_company.db');
const financeAgent = new FinanceAgent();

// Distribute revenue for a completed project
router.post('/distribute-revenue', async (req, res) => {
  try {
    const { projectId, projectType, revenueAmount, completionData } = req.body;
    
    if (!projectId || !projectType || !revenueAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields: projectId, projectType, revenueAmount' 
      });
    }

    const result = await financeAgent.processProjectRevenue(
      projectId, 
      projectType, 
      parseFloat(revenueAmount), 
      completionData || {}
    );

    res.json(result);

  } catch (error) {
    console.error('Revenue distribution error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze revenue projection for a project
router.post('/analyze-revenue/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea data
    const idea = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Get product data if exists
    const product = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE idea_id = ?', [ideaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const analysis = await financeAgent.analyzeRevenueProjection(idea, product);
    
    res.json({ 
      success: true, 
      analysis,
      ideaId: parseInt(ideaId)
    });

  } catch (error) {
    console.error('Revenue analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get financial report
router.get('/report', async (req, res) => {
  try {
    const report = await financeAgent.generateFinancialReport();
    res.json({ success: true, report });

  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contract information
router.get('/contract-info', async (req, res) => {
  try {
    const contractInfo = await web3Service.getContractInfo();
    const contractBalance = await web3Service.getContractBalance();
    
    res.json({ 
      success: true, 
      contractInfo: {
        ...contractInfo,
        balance: contractBalance
      }
    });

  } catch (error) {
    console.error('Contract info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get revenue history
router.get('/revenue-history', async (req, res) => {
  try {
    const history = await new Promise((resolve, reject) => {
      db.all(
        `SELECT rd.*, pc.completion_type, pc.completion_data
         FROM revenue_distributions rd
         LEFT JOIN project_completions pc ON rd.project_id = pc.idea_id
         ORDER BY rd.created_at DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const summary = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           COUNT(*) as total_distributions,
           SUM(revenue_amount) as total_revenue,
           SUM(dividend_share) as total_dividends,
           SUM(owner_share) as total_owner_share,
           AVG(revenue_amount) as avg_revenue
         FROM revenue_distributions 
         WHERE status = 'completed'`,
        [],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || {});
        }
      );
    });

    res.json({ 
      success: true, 
      history,
      summary
    });

  } catch (error) {
    console.error('Revenue history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get token holders
router.get('/token-holders', async (req, res) => {
  try {
    const tokenHolders = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM token_holders ORDER BY token_balance DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // Get updated dividend info for each holder
    const holdersWithDividends = await Promise.all(
      tokenHolders.map(async (holder) => {
        const dividendInfo = await web3Service.getDividendInfo(holder.wallet_address);
        return {
          ...holder,
          current_dividend_info: dividendInfo
        };
      })
    );

    res.json({ 
      success: true, 
      tokenHolders: holdersWithDividends
    });

  } catch (error) {
    console.error('Token holders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new token holder
router.post('/token-holders', async (req, res) => {
  try {
    const { walletAddress, initialTokens } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const success = await financeAgent.addTokenHolder(
      walletAddress, 
      parseFloat(initialTokens) || 0
    );

    if (success) {
      res.json({ 
        success: true, 
        message: 'Token holder added successfully',
        walletAddress,
        initialTokens: parseFloat(initialTokens) || 0
      });
    } else {
      res.status(500).json({ error: 'Failed to add token holder' });
    }

  } catch (error) {
    console.error('Add token holder error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dividend info for specific address
router.get('/dividend-info/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const dividendInfo = await web3Service.getDividendInfo(address);
    
    if (dividendInfo) {
      res.json({ success: true, dividendInfo });
    } else {
      res.status(404).json({ error: 'Address not found or invalid' });
    }

  } catch (error) {
    console.error('Dividend info error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual project completion (for testing)
router.post('/complete-project', async (req, res) => {
  try {
    const { ideaId, completionType, revenueAmount, completionData } = req.body;
    
    if (!ideaId || !completionType || !revenueAmount) {
      return res.status(400).json({ 
        error: 'Missing required fields: ideaId, completionType, revenueAmount' 
      });
    }

    // Record completion and distribute revenue
    const result = await financeAgent.processProjectRevenue(
      ideaId,
      completionType,
      parseFloat(revenueAmount),
      completionData || {}
    );

    res.json(result);

  } catch (error) {
    console.error('Project completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
