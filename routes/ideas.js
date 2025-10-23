const express = require('express');
const router = express.Router();
const db = require('../database/setup');

// Get all ideas
router.get('/', (req, res) => {
  db.all('SELECT * FROM ideas ORDER BY created_at DESC', (err, ideas) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, ideas });
  });
});

// Get single idea with research and product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM ideas WHERE id = ?', [id], (err, idea) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!idea) {
      return res.status(404).json({ success: false, error: 'Idea not found' });
    }
    
    // Get research for this idea
    db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [id], (err, research) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      // Get product for this idea
      db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [id], (err, product) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        // Get bolt prompt for this idea
        db.get('SELECT * FROM bolt_prompts WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [id], (err, boltPrompt) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          res.json({ 
            success: true, 
            idea: {
              ...idea,
              research: research ? {
                ...research,
                research_data: JSON.parse(research.research_data || '{}'),
                competitor_analysis: JSON.parse(research.competitor_analysis || '[]'),
                market_opportunity: JSON.parse(research.market_opportunity || '{}')
              } : null,
              product: product ? {
                ...product,
                features: JSON.parse(product.features || '[]'),
                target_market: JSON.parse(product.target_market || '{}')
              } : null,
              boltPrompt: boltPrompt ? {
                ...boltPrompt,
                pages_required: JSON.parse(boltPrompt.pages_required || '[]'),
                functional_requirements: JSON.parse(boltPrompt.functional_requirements || '[]'),
                integration_needs: JSON.parse(boltPrompt.integration_needs || '[]')
              } : null
            }
          });
        });
      });
    });
  });
});

// Update idea status
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE ideas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    res.json({ success: true, message: 'Status updated' });
  });
});

module.exports = router;
