const express = require('express');
const router = express.Router();
const axios = require('axios');
const CMOAgent = require('../agents/CMOAgent_v2');
const { postToSocial } = require('../agents/ayrsharePoster');
const db = require('../database/setup');

// Initialize only Marketing agent (Node.js) - DeveloperAgent removed since bolt.diy handles website creation
// Other agents (CEO, Research, Product, CTO, Head of Engineering, Finance) run as uAgents
console.log('🔑 [DEBUG] ASI_ONE_API_KEY exists:', !!process.env.ASI_ONE_API_KEY);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY length:', process.env.ASI_ONE_API_KEY?.length || 0);
console.log('🔑 [DEBUG] ASI_ONE_API_KEY starts with sk_:', process.env.ASI_ONE_API_KEY?.startsWith('sk_') || false);
const cmoAgent = new CMOAgent(process.env.ASI_ONE_API_KEY);

// Small DB promise helpers
function dbRunAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function dbGetAsync(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, function(err, row) {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Reusable marketing runner: develops strategy and optionally publishes via Ayrshare.
async function runMarketingFor(idea, product, researchData = {}, publish = true, linkInfo = null) {
  console.log('🎯 [MARKETING] Starting runMarketingFor:', { 
    ideaTitle: idea?.title, 
    productName: product?.product_name, 
    publish,
    linkId: linkInfo?.linkId 
  });
  
  const result = { strategy: null, postResp: {} };

  console.log('🤖 [MARKETING] Calling CMO Agent...');
  const strategyData = await cmoAgent.developMarketingStrategy(idea, product, researchData);
  result.strategy = strategyData;
  console.log('✅ [MARKETING] CMO Agent returned strategy with channels:', strategyData.marketing_channels?.length || 0);

  if (!publish) {
    console.log('⏭️  [MARKETING] Publish flag is false, skipping social posting');
    return result;
  }

  // Build texts
  const twitterText = (strategyData.post_text_twitter || strategyData.short_post || '').trim();
  const linkedinText = (strategyData.post_text_linkedin || strategyData.long_post || '').trim();
  const defaultText = `${product.product_name}${strategyData.tagline ? ' - ' + strategyData.tagline : ''}`;

  console.log('📝 [MARKETING] Post texts prepared:', {
    twitterLength: twitterText?.length || 0,
    linkedinLength: linkedinText?.length || 0,
    defaultLength: defaultText?.length || 0
  });

  // Helper to persist post with optional link id
  async function persistPost(ideaId, agentName, content, platforms, mediaUrls, status, ayrResponse) {
    try {
      console.log('💾 [MARKETING] Persisting post to DB:', { ideaId, platforms, status });
      await dbRunAsync(`INSERT INTO posts (idea_id, agent_name, content, platforms, media_urls, status, ayr_response) VALUES (?, ?, ?, ?, ?, ?, ?)`, [ideaId, agentName, content, JSON.stringify(platforms), JSON.stringify(mediaUrls || []), status, JSON.stringify(ayrResponse || {})]);
      console.log('✅ [MARKETING] Post persisted successfully');
    } catch (e) {
      console.error('❌ [MARKETING] Error persisting post:', e);
    }
  }

  // When linkInfo provided, try to use linkInfo.linkId as idea_id in posts for traceability
  const persistentIdeaId = linkInfo && linkInfo.linkId ? linkInfo.linkId : null;

  // Publish Twitter
  if (twitterText || defaultText) {
    try {
      console.log('🐦 [MARKETING] Publishing to Twitter...');
      const tw = await postToSocial({ text: twitterText || defaultText, platforms: ['twitter'], mediaUrls: strategyData.image_urls || [] });
      console.log('✅ [MARKETING] Twitter post successful:', tw.status || tw.success);
      result.postResp.twitter = tw;
      await dbRunAsync(`INSERT INTO agent_activities (agent_name, activity, data) VALUES (?, ?, ?)`, ['CMO Agent', 'Posted to twitter', JSON.stringify({ text: twitterText || defaultText, resp: tw })]);
      await persistPost(persistentIdeaId, 'CMO Agent', twitterText || defaultText, ['twitter'], strategyData.image_urls || [], 'published', tw);
    } catch (e) {
      console.error('❌ [MARKETING] Twitter post failed:', e?.message || e);
      result.postResp.twitter_error = e?.message || String(e);
      await persistPost(persistentIdeaId, 'CMO Agent', twitterText || defaultText, ['twitter'], strategyData.image_urls || [], 'failed', { error: e?.message || String(e) });
    }
  } else {
    console.log('⚠️  [MARKETING] No Twitter text available, skipping Twitter post');
  }

  // Publish LinkedIn
  if (linkedinText || defaultText) {
    try {
      console.log('💼 [MARKETING] Publishing to LinkedIn...');
      const li = await postToSocial({ text: linkedinText || defaultText, platforms: ['linkedin'], mediaUrls: strategyData.image_urls || [] });
      console.log('✅ [MARKETING] LinkedIn post successful:', li.status || li.success);
      result.postResp.linkedin = li;
      await dbRunAsync(`INSERT INTO agent_activities (agent_name, activity, data) VALUES (?, ?, ?)`, ['CMO Agent', 'Posted to linkedin', JSON.stringify({ text: linkedinText || defaultText, resp: li })]);
      await persistPost(persistentIdeaId, 'CMO Agent', linkedinText || defaultText, ['linkedin'], strategyData.image_urls || [], 'published', li);
    } catch (e) {
      console.error('❌ [MARKETING] LinkedIn post failed:', e?.message || e);
      result.postResp.linkedin_error = e?.message || String(e);
      await persistPost(persistentIdeaId, 'CMO Agent', linkedinText || defaultText, ['linkedin'], strategyData.image_urls || [], 'failed', { error: e?.message || String(e) });
    }
  } else {
    console.log('⚠️  [MARKETING] No LinkedIn text available, skipping LinkedIn post');
  }

  console.log('🎉 [MARKETING] Marketing complete! Results:', {
    twitterStatus: result.postResp.twitter?.status || result.postResp.twitter_error,
    linkedinStatus: result.postResp.linkedin?.status || result.postResp.linkedin_error
  });

  return result;
}

// ===== MARKETING AGENT ROUTES (Node.js) =====

// Develop marketing strategy (simple version without ID)
router.post('/marketing-strategy', async (req, res) => {
  try {
    const { idea, product } = req.body;
    console.log('📢 [ROUTE] Marketing strategy endpoint called for product:', product?.product_name);

    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product data are required' });
    }

    // Enrich with Research uAgent if available
    console.log('📢 [ROUTE] Calling Research uAgent to enrich idea...');
    let researchData = {};
    try {
      const researchResp = await axios.post('http://localhost:8002/research-idea', { idea }, { timeout: 120000 });
      researchData = researchResp.data || {};
      console.log('📢 [ROUTE] Research uAgent returned:', {
        competitors: (researchData.competitors || []).length || 0,
        market_analysis: !!researchData.market_analysis
      });
    } catch (e) {
      console.warn('⚠️ [ROUTE] Research uAgent call failed, continuing without research:', e?.message || e);
      researchData = {};
    }

    const publish = req.body.publish !== false;
    const result = await runMarketingFor(idea, product, researchData, publish, null);

    res.json({ success: true, strategy: result.strategy, postResp: result.postResp });
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

// ===== PDR (Product Decision Record) Routes =====

// Create a new PDR
router.post('/pdrs', async (req, res) => {
  try {
    const { idea, product } = req.body;
    if (!idea || !product) {
      return res.status(400).json({ success: false, error: 'Idea and product are required' });
    }

    const row = await dbRunAsync(`INSERT INTO pdrs (idea_json, product_json, status) VALUES (?, ?, ?)`, [JSON.stringify(idea), JSON.stringify(product), 'draft']);
    res.json({ success: true, pdrId: row.lastID });
  } catch (err) {
    console.error('Error creating PDR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get a PDR
router.get('/pdrs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pdr = await dbGetAsync(`SELECT * FROM pdrs WHERE id = ?`, [id]);
    if (!pdr) return res.status(404).json({ success: false, error: 'PDR not found' });
    // parse JSON fields
    pdr.idea = pdr.idea_json ? JSON.parse(pdr.idea_json) : null;
    pdr.product = pdr.product_json ? JSON.parse(pdr.product_json) : null;
    delete pdr.idea_json;
    delete pdr.product_json;
    res.json({ success: true, pdr });
  } catch (err) {
    console.error('Error fetching PDR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve a PDR and trigger marketing automatically
router.post('/pdrs/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('✅ [PDR_APPROVAL] Approval request received for PDR ID:', id);
    
    const pdr = await dbGetAsync(`SELECT * FROM pdrs WHERE id = ?`, [id]);
    if (!pdr) {
      console.error('❌ [PDR_APPROVAL] PDR not found:', id);
      return res.status(404).json({ success: false, error: 'PDR not found' });
    }
    
    if (pdr.status === 'approved') {
      console.log('⚠️  [PDR_APPROVAL] PDR already approved:', id);
      return res.json({ success: true, message: 'PDR already approved' });
    }

    // Mark as approved
    console.log('📝 [PDR_APPROVAL] Marking PDR as approved...');
    await dbRunAsync(`UPDATE pdrs SET status = ?, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, ['approved', id]);
    console.log('✅ [PDR_APPROVAL] PDR marked as approved');

    // Parse stored idea/product
    const idea = pdr.idea_json ? JSON.parse(pdr.idea_json) : null;
    const product = pdr.product_json ? JSON.parse(pdr.product_json) : null;
    
    console.log('📦 [PDR_APPROVAL] Parsed PDR data:', {
      hasIdea: !!idea,
      hasProduct: !!product,
      ideaTitle: idea?.title,
      productName: product?.product_name
    });

    // Enrich with research if available
    let researchData = {};
    try {
      console.log('🔬 [PDR_APPROVAL] Calling Research uAgent...');
      const researchResp = await axios.post('http://localhost:8002/research-idea', { idea }, { timeout: 120000 });
      researchData = researchResp.data || {};
      console.log('✅ [PDR_APPROVAL] Research uAgent returned data');
    } catch (e) {
      console.warn('⚠️  [PDR_APPROVAL] Research uAgent call failed, continuing without research:', e?.message || e);
      researchData = {};
    }

    // Trigger marketing and publish
    console.log('🚀 [PDR_APPROVAL] Triggering marketing workflow...');
    const marketingResult = await runMarketingFor(idea, product, researchData, true, { linkId: id });

    // Save marketing response to PDR record
    console.log('💾 [PDR_APPROVAL] Saving marketing results to PDR...');
    await dbRunAsync(`UPDATE pdrs SET marketing_posted = ?, marketing_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [1, JSON.stringify(marketingResult.postResp || {}), id]);
    console.log('✅ [PDR_APPROVAL] Marketing results saved to PDR');

    console.log('🎉 [PDR_APPROVAL] PDR approval complete! Marketing posted:', {
      twitter: marketingResult.postResp?.twitter?.status,
      linkedin: marketingResult.postResp?.linkedin?.status
    });

    res.json({ success: true, strategy: marketingResult.strategy, postResp: marketingResult.postResp });
  } catch (err) {
    console.error('❌ [PDR_APPROVAL] Error approving PDR:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ success: false, error: err.message });
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