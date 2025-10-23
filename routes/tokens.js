const express = require('express');
const router = express.Router();
const db = require('../database/setup');

// Vote on an idea
router.post('/vote', (req, res) => {
  const { tokenHolderId, itemType, itemId, vote, feedback } = req.body;
  
  if (!tokenHolderId || !itemType || !itemId || !vote) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  
  if (!['approve', 'reject'].includes(vote)) {
    return res.status(400).json({ success: false, error: 'Vote must be approve or reject' });
  }
  
  db.run(
    'INSERT INTO votes (token_holder_id, item_type, item_id, vote, feedback) VALUES (?, ?, ?, ?, ?)',
    [tokenHolderId, itemType, itemId, vote, feedback || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      // Update item status based on vote
      let updateQuery = '';
      let newStatus = '';
      
      if (itemType === 'idea') {
        updateQuery = 'UPDATE ideas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        newStatus = vote === 'approve' ? 'approved' : 'rejected';
      } else if (itemType === 'product') {
        updateQuery = 'UPDATE products SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        newStatus = vote === 'approve' ? 'approved' : 'rejected';
      }
      
      if (updateQuery) {
        db.run(updateQuery, [newStatus, itemId], function(err) {
          if (err) {
            console.error('Error updating status:', err);
          }
        });
      }
      
      res.json({ success: true, message: 'Vote recorded' });
    }
  );
});

// Get votes for an item
router.get('/votes/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params;
  
  db.all(
    'SELECT * FROM votes WHERE item_type = ? AND item_id = ? ORDER BY created_at DESC',
    [itemType, itemId],
    (err, votes) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      res.json({ success: true, votes });
    }
  );
});

// Get voting summary for an item
router.get('/summary/:itemType/:itemId', (req, res) => {
  const { itemType, itemId } = req.params;
  
  db.all(
    'SELECT vote, COUNT(*) as count FROM votes WHERE item_type = ? AND item_id = ? GROUP BY vote',
    [itemType, itemId],
    (err, results) => {
      if (err) {
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
