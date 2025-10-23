const express = require('express');
const router = express.Router();
const axios = require('axios');
const CMOAgent = require('../agents/CMOAgent');
const db = require('../database/setup');

// Initialize only Marketing agent (Node.js) - DeveloperAgent removed since bolt.diy handles website creation
// Other agents (CEO, Research, Product, CTO, Head of Engineering, Finance) run as uAgents
console.log('🔑 [DEBUG] ASI_ONE_API_KEY exists:', !!process.env.ASI_ONE_API_KEY);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY length:', process.env.ASI_ONE_API_KEY?.length || 0);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY starts with sk_:', process.env.ASI_ONE_API_KEY?.startsWith('sk_') || false);
const cmoAgent = new CMOAgent(process.env.ASI_ONE_API_KEY);

// ===== MARKETING AGENT ROUTES (Node.js) =====

// Develop marketing strategy (simple version without ID)
router.post('/marketing-strategy', async (req, res) => {
  try {
    const { idea, product } = req.body;
    console.log('📢 [ROUTE] Marketing strategy endpoint called for product:', product?.product_name);
    
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }
    
    console.log('📢 [ROUTE] Calling CMO Agent...');
    const strategyData = await cmoAgent.developMarketingStrategy(idea, product, {});
    
    console.log('📢 [ROUTE] CMO Agent returned:', {
      channels_count: strategyData.marketing_channels?.length || 0,
      target_segments: strategyData.target_segments?.length || 0,
      has_launch_plan: !!strategyData.launch_plan
    });
    
    res.json({ success: true, strategy: strategyData });
  } catch (error) {
    console.error('Error developing marketing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Develop marketing strategy (legacy version with ID)
router.post('/marketing-strategy/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea, research, and product
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, product) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          const researchData = research ? JSON.parse(research.research_data) : {};
          const productData = product ? {
            ...product,
            features: JSON.parse(product.features || '[]'),
            target_market: JSON.parse(product.target_market || '{}')
          } : {};
          
          const strategy = await cmoAgent.developMarketingStrategy(idea, productData, researchData);
          
          res.json({ success: true, strategy });
        });
      });
    });
  } catch (error) {
    console.error('Error developing marketing strategy:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== DEVELOPER AGENT ROUTES (Node.js) =====

// Create Bolt prompt for website development (simple version without ID)
router.post('/bolt-prompt', async (req, res) => {
  try {
    const { idea, product, research, marketingStrategy, technicalStrategy } = req.body;
    console.log('🔧 [ROUTE] Bolt prompt endpoint called for product:', product?.product_name);
    
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }
    
    console.log('🔧 [ROUTE] DeveloperAgent removed - using bolt.diy instead');
    // DeveloperAgent removed since bolt.diy handles website creation
    const boltPromptData = {
      website_title: `${product.product_name} - Website`,
      pages_required: ['Home', 'About', 'Services', 'Contact'],
      functional_requirements: ['Responsive design', 'Contact form', 'SEO optimization'],
      bolt_prompt: `Create a website for ${product.product_name} with modern design and user-friendly interface`
    };
    
    console.log('🔧 [ROUTE] Developer Agent returned:', {
      website_title: boltPromptData.website_title,
      pages_count: boltPromptData.pages_required?.length || 0,
      features_count: boltPromptData.functional_requirements?.length || 0
    });
    
    res.json({ success: true, boltPrompt: boltPromptData });
  } catch (error) {
    console.error('Error creating Bolt prompt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Bolt prompt for website development (legacy version with ID)
router.post('/bolt-prompt/:ideaId', async (req, res) => {
  try {
    const { ideaId } = req.params;
    
    // Get idea, research, product, marketing strategy, and technical strategy
    db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], async (err, idea) => {
      if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!idea) {
        return res.status(404).json({ success: false, error: 'Idea not found' });
      }
      
      db.get('SELECT * FROM research WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, research) => {
        if (err) {
          return res.status(500).json({ success: false, error: err.message });
        }
        
        db.get('SELECT * FROM products WHERE idea_id = ? ORDER BY created_at DESC LIMIT 1', [ideaId], async (err, product) => {
          if (err) {
            return res.status(500).json({ success: false, error: err.message });
          }
          
          const researchData = research ? JSON.parse(research.research_data) : {};
          const productData = product ? {
            ...product,
            features: JSON.parse(product.features || '[]'),
            target_market: JSON.parse(product.target_market || '{}')
          } : {};
          
          // For now, we'll use placeholder marketing and technical strategies
          // In a real implementation, these would be fetched from the database
          const marketingStrategy = {
            brand_positioning: 'Innovative solution for modern problems',
            key_messages: ['Revolutionary approach', 'User-friendly design'],
            target_segments: [{ segment: 'Tech professionals', characteristics: 'Innovation-focused' }],
            marketing_channels: [{ channel: 'Digital Marketing', strategy: 'Online presence' }]
          };
          
          const technicalStrategy = {
            technology_stack: { frontend: 'React', backend: 'Node.js' },
            architecture: { overview: 'Modern web architecture' },
            timeline: { phases: [{ phase: 'Development', duration: '3 months' }] }
          };
          
          // DeveloperAgent removed - using bolt.diy instead
          const boltPrompt = {
            website_title: `${productData.product_name} - Website`,
            pages_required: ['Home', 'About', 'Services', 'Contact'],
            functional_requirements: ['Responsive design', 'Contact form', 'SEO optimization'],
            bolt_prompt: `Create a website for ${productData.product_name} with modern design and user-friendly interface`
          };
          
          // Save bolt prompt to database
          const stmt = db.prepare(`
            INSERT INTO bolt_prompts (
              idea_id, website_title, website_description, pages_required,
              functional_requirements, design_guidelines, integration_needs, bolt_prompt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          stmt.run([
            ideaId,
            boltPrompt.website_title || '',
            boltPrompt.website_description || '',
            JSON.stringify(boltPrompt.pages_required || []),
            JSON.stringify(boltPrompt.functional_requirements || []),
            boltPrompt.design_guidelines || '',
            JSON.stringify(boltPrompt.integration_needs || []),
            boltPrompt.bolt_prompt || ''
          ], function(err) {
            if (err) {
              console.error('Error saving bolt prompt:', err);
              return res.status(500).json({ success: false, error: err.message });
            }
            
            console.log(`Bolt prompt saved for idea ${ideaId}, prompt ID: ${this.lastID}`);
            res.json({ success: true, boltPrompt });
          });
          
          stmt.finalize();
        });
      });
    });
  } catch (error) {
    console.error('Error creating Bolt prompt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== uAGENT INTEGRATION ROUTES =====

// Complete workflow endpoint - calls the orchestrator uAgent
router.post('/process-complete-workflow', async (req, res) => {
  try {
    const { user_input, idea_count = 1 } = req.body;
    console.log('🎯 [ROUTE] Complete workflow endpoint called for:', user_input);
    
    if (!user_input) {
      return res.status(400).json({ success: false, error: 'User input is required' });
    }
    
    console.log('🎯 [ROUTE] Calling Workflow Orchestrator uAgent...');
    const response = await axios.post('http://localhost:8008/process-business-idea', {
      user_input,
      idea_count
    }, {
      timeout: 600000 // 10 minutes timeout
    });
    
    console.log('🎯 [ROUTE] Orchestrator returned:', {
      success: response.data.success,
      selected_idea: response.data.data?.idea?.title,
      workflow_status: response.data.data?.workflow_summary?.workflow_status
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('❌ [ROUTE] Error in complete workflow:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Complete workflow failed'
    });
  }
});

// ===== UTILITY ROUTES =====

// Test ASI:One API directly
router.get('/test-asi-one-api', async (req, res) => {
  const axios = require('axios');
  const apiKey = process.env.ASI_ONE_API_KEY;
  
  try {
    console.log('🔑 [ASI_ONE_TEST] Testing ASI:One API directly...');
    console.log('🔑 [ASI_ONE_TEST] API Key length:', apiKey?.length);
    console.log('🔑 [ASI_ONE_TEST] API Key starts with sk_:', apiKey?.startsWith('sk_'));
    
    const response = await axios.post('https://api.asi1.ai/v1/chat/completions', {
      model: 'asi1-mini',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message.'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔑 [ASI_ONE_TEST] ASI:One API response:', response.data);
    res.json({ success: true, response: response.data });
    
  } catch (error) {
    console.error('🔑 [ASI_ONE_TEST] ASI:One API error:', error.response?.data || error.message);
    res.json({ 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status
    });
  }
});

// Get agent activities
router.get('/activities', (req, res) => {
  db.all('SELECT * FROM agent_activities ORDER BY created_at DESC LIMIT 50', (err, activities) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, activities });
  });
});

module.exports = router;