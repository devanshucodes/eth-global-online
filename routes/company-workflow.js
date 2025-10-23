const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Get company workflow state
router.get('/:companyId', (req, res) => {
  const companyId = req.params.companyId;
  
  db.get(
    'SELECT * FROM company_workflow_state WHERE company_id = ?',
    [companyId],
    (err, workflow) => {
      if (err) {
        console.error('Error fetching workflow state:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow state not found' });
      }
      
      // Parse JSON data
      try {
        if (workflow.research_data) {
          workflow.research_data = JSON.parse(workflow.research_data);
        }
        if (workflow.product_data) {
          workflow.product_data = JSON.parse(workflow.product_data);
        }
      } catch (parseError) {
        console.error('Error parsing workflow data:', parseError);
      }
      
      res.json({ success: true, workflow });
    }
  );
});

// Vote on company workflow (approve/reject PDR)
router.post('/:companyId/vote', (req, res) => {
  const companyId = req.params.companyId;
  const { vote, feedback, voterId } = req.body;
  
  if (!vote || !['approve', 'reject'].includes(vote)) {
    return res.status(400).json({ success: false, error: 'Invalid vote. Must be approve or reject.' });
  }
  
  // Record the vote
  db.run(
    'INSERT INTO company_workflow_votes (company_id, vote_type, vote, voter_id, feedback) VALUES (?, ?, ?, ?, ?)',
    [companyId, 'product_approval', vote, voterId || 'anonymous', feedback || ''],
    function(err) {
      if (err) {
        console.error('Error recording vote:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      // Update workflow state based on vote
      let newStep = vote === 'approve' ? 'approved' : 'rejected';
      let newStatus = vote === 'approve' ? 'active' : 'paused';
      
      db.run(
        'UPDATE company_workflow_state SET current_step = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
        [newStep, newStatus, companyId],
        (err) => {
          if (err) {
            console.error('Error updating workflow state:', err);
            return res.status(500).json({ success: false, error: err.message });
          }
          
          res.json({ 
            success: true, 
            message: `Product Development Report ${vote}d successfully!`,
            vote: vote,
            newStep: newStep
          });
        }
      );
    }
  );
});

// Get votes for a company
router.get('/:companyId/votes', (req, res) => {
  const companyId = req.params.companyId;
  
  db.all(
    'SELECT * FROM company_workflow_votes WHERE company_id = ? ORDER BY created_at DESC',
    [companyId],
    (err, votes) => {
      if (err) {
        console.error('Error fetching votes:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.json({ success: true, votes });
    }
  );
});

// Get voting summary for a company
router.get('/:companyId/votes/summary', (req, res) => {
  const companyId = req.params.companyId;
  
  db.all(
    'SELECT vote, COUNT(*) as count FROM company_workflow_votes WHERE company_id = ? GROUP BY vote',
    [companyId],
    (err, results) => {
      if (err) {
        console.error('Error fetching vote summary:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      const summary = {
        approve: 0,
        reject: 0,
        total: 0
      };
      
      results.forEach(row => {
        summary[row.vote] = row.count;
        summary.total += row.count;
      });
      
      res.json({ success: true, summary });
    }
  );
});

module.exports = router;
