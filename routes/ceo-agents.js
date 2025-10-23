const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const ResearchAgent = require('../agents/ResearchAgent');
const ProductAgent = require('../agents/ProductAgent');

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Initialize agents
const researchAgent = new ResearchAgent(process.env.ASI_ONE_API_KEY);
const productAgent = new ProductAgent(process.env.ASI_ONE_API_KEY);

// Schedule pending agent launches on server start
function schedulePendingLaunches() {
  db.all('SELECT * FROM ceo_agents WHERE launch_date IS NOT NULL', [], (err, agents) => {
    if (err) {
      console.error('Error loading pending launches:', err);
      return;
    }
    
    const now = Date.now();
    agents.forEach(agent => {
      try {
        const launchTime = new Date(agent.launch_date).getTime();
        const delay = Math.max(0, launchTime - now);
        
        if (delay === 0) {
          // Already past launch time, launch immediately
          console.log(`⏰ Launching overdue agent ${agent.id} (${agent.name})`);
          launchAgentById(agent.id).then(result => {
            if (result && result.company) {
              console.log(`✅ Auto-launched overdue agent ${agent.id}`);
            }
          }).catch(err => console.error('Overdue launch error:', err));
        } else {
          // Schedule future launch
          console.log(`⏰ Scheduling agent ${agent.id} (${agent.name}) to launch in ${Math.round(delay/1000)}s`);
          setTimeout(() => {
            launchAgentById(agent.id).then(result => {
              if (result && result.company) {
                console.log(`✅ Auto-launched scheduled agent ${agent.id}`);
              }
            }).catch(err => console.error('Scheduled launch error:', err));
          }, delay);
        }
      } catch (e) {
        console.error('Error scheduling agent launch:', e);
      }
    });
  });
}

// Run on module load
schedulePendingLaunches();

// Get all CEO agents
router.get('/', (req, res) => {
  const query = `
    SELECT id, name, company_idea, description, ceo_characteristics, 
           creator_wallet, token_symbol, total_tokens, tokens_available, 
           price_per_token, status, created_at, updated_at, launch_timeline, launch_date, time_duration
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

// Helper: launch an agent by id (returns a Promise)
function launchAgentById(agentId) {
  return new Promise((resolve, reject) => {
    // Check if agent already has a company
    db.get('SELECT * FROM companies WHERE ceo_agent_id = ?', [agentId], (err, existingCompany) => {
      if (err) return reject(err);
      if (existingCompany) return resolve({ alreadyLaunched: true, company: existingCompany });

      // Get agent
      db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
        if (err) return reject(err);
        if (!agent) return resolve({ alreadyLaunched: true });

        const companyQuery = `
          INSERT INTO companies (
            ceo_agent_id, name, status, current_revenue, launched_date,
            ceo_agent_name, token_symbol, company_idea, description, ceo_characteristics,
            total_tokens, price_per_token, time_duration
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const companyName = `${agent.name} Company`;
        const launchedDate = new Date().toISOString();

        db.run(companyQuery, [
          agentId, companyName, 'running', 0, launchedDate,
          agent.name, agent.token_symbol, agent.company_idea, agent.description, agent.ceo_characteristics,
          agent.total_tokens, agent.price_per_token, agent.time_duration || agent.launch_timeline
        ], function(err) {
          if (err) return reject(err);

          const companyId = this.lastID;
          // Initialize workflow state (best-effort)
          db.run(
            'INSERT INTO company_workflow_state (company_id, current_step, status) VALUES (?, ?, ?)',
            [companyId, 'research', 'active'],
            (err) => {
              if (err) {
                console.error('Create workflow state error (auto-launch):', err);
              } else {
                // Auto-start background workflow
                setTimeout(() => startCompanyWorkflow(companyId, agent), 2000);
              }
            }
          );

          // Delete the agent from ceo_agents table (moved to companies)
          db.run('DELETE FROM ceo_agents WHERE id = ?', [agentId], (err) => {
            if (err) return reject(err);
            resolve({ company: { id: companyId, name: companyName, ceo_agent_id: agentId, status: 'running', launched_date: launchedDate } });
          });
        });
      });
    });
  });
}

// Get single CEO agent
router.get('/:id', (req, res) => {
  const agentId = req.params.id;
  
  db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
    if (err) {
      console.error('Get CEO agent error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (!agent) {
      return res.status(404).json({ success: false, error: 'CEO Agent not found' });
    }
    
    res.json({ success: true, agent });
  });
});

// Create new CEO agent
router.post('/', (req, res) => {
  const {
    name,
    company_idea,
    description,
    ceo_characteristics,
    creator_wallet,
    token_symbol,
    total_tokens = 100,
    price_per_token = 5.0,
    launch_timeline = 10,
    time_duration
  } = req.body;
  
  // Use launch_timeline for time_duration if not provided
  const agentTimeDuration = time_duration || launch_timeline;

  // Validate required fields
  if (!name || !company_idea || !description || !ceo_characteristics || !token_symbol) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: name, company_idea, description, ceo_characteristics, token_symbol'
    });
  }

  // Calculate launch date (in minutes for demo)
  const launch_date = new Date();
  launch_date.setMinutes(launch_date.getMinutes() + launch_timeline);
  const launch_date_string = launch_date.toISOString();

  const query = `
    INSERT INTO ceo_agents (
      name, company_idea, description, ceo_characteristics, 
      creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token,
      status, launch_timeline, launch_date, time_duration
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const tokens_available = total_tokens; // All tokens available initially

  db.run(query, [
    name, company_idea, description, ceo_characteristics,
    creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token,
    'available', launch_timeline, launch_date_string, agentTimeDuration
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
      
      // Schedule auto-launch for this agent at its launch_date
      try {
        const launchTime = new Date(agent.launch_date).getTime();
        const now = Date.now();
        const delay = Math.max(0, launchTime - now);
        setTimeout(() => {
          launchAgentById(agent.id).then(result => {
            if (result && result.company) {
              console.log(`Auto-launched agent ${agent.id} at scheduled time`);
            }
          }).catch(err => console.error('Scheduled launch error:', err));
        }, delay);
      } catch (e) {
        // ignore scheduling errors
      }
    });
  });
});

// Buy tokens in a CEO agent
router.post('/:id/buy-tokens', (req, res) => {
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

// Launch CEO agent (move to companies table)
router.post('/:id/launch', (req, res) => {
  const agentId = req.params.id;
  
  // First, check if agent already has a company (prevent duplicates)
  db.get('SELECT * FROM companies WHERE ceo_agent_id = ?', [agentId], (err, existingCompany) => {
    if (err) {
      console.error('Check existing company error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    
    if (existingCompany) {
      console.log(`Agent ${agentId} already has company ${existingCompany.id}, skipping launch`);
      return res.json({
        success: true,
        message: 'Agent already launched!',
        company: existingCompany
      });
    }
    
    // Also check if agent still exists (might have been deleted already)
    db.get('SELECT * FROM ceo_agents WHERE id = ?', [agentId], (err, agent) => {
      if (err) {
        console.error('Get agent error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      
      if (!agent) {
        console.log(`Agent ${agentId} not found, might already be launched`);
        return res.json({
          success: true,
          message: 'Agent already launched!'
        });
      }
      
      // Create company entry with CEO agent details
      const companyQuery = `
        INSERT INTO companies (
          ceo_agent_id, name, status, current_revenue, launched_date,
          ceo_agent_name, token_symbol, company_idea, description, ceo_characteristics,
          total_tokens, price_per_token, time_duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const companyName = `${agent.name} Company`;
      const launchedDate = new Date().toISOString();
      
      db.run(companyQuery, [
        agentId, companyName, 'running', 0, launchedDate,
        agent.name, agent.token_symbol, agent.company_idea, agent.description, agent.ceo_characteristics,
        agent.total_tokens, agent.price_per_token, agent.time_duration || agent.launch_timeline
      ], function(err) {
        if (err) {
          console.error('Create company error:', err);
          return res.status(500).json({ success: false, error: err.message });
        }
        
        // Initialize company workflow state
        const companyId = this.lastID;
        db.run(
          'INSERT INTO company_workflow_state (company_id, current_step, status) VALUES (?, ?, ?)',
          [companyId, 'research', 'active'],
          (err) => {
            if (err) {
              console.error('Create workflow state error:', err);
              // Continue anyway - workflow state is not critical for launch
            } else {
              console.log(`✅ [WORKFLOW] Initialized workflow state for company ${companyId}`);
              
              // Auto-start research workflow in background
              setTimeout(() => {
                startCompanyWorkflow(companyId, agent);
              }, 2000);
            }
          }
        );
        
        // Delete the agent from ceo_agents table (move to companies only)
        db.run(
          'DELETE FROM ceo_agents WHERE id = ?',
          [agentId],
          (err) => {
            if (err) {
              console.error('Delete agent error:', err);
              return res.status(500).json({ success: false, error: err.message });
            }
            
            res.json({
              success: true,
              message: 'Agent launched successfully!',
              company: {
                id: companyId,
                name: companyName,
                ceo_agent_id: agentId,
                status: 'running',
                launched_date: launchedDate
              }
            });
          }
        );
      });
    });
  });
});

// Auto-start company workflow function
async function startCompanyWorkflow(companyId, agent) {
  console.log(`🚀 [WORKFLOW] Starting auto-workflow for company ${companyId}`);
  
  try {
    // Create idea object from agent data
    const idea = {
      id: companyId,
      title: agent.company_idea,
      description: agent.description,
      potential_revenue: "$1M+",
      status: 'approved'
    };
    
    console.log(`🔍 [WORKFLOW] Starting research for: ${idea.title}`);
    
    // Step 1: Research Agent
    const researchData = await researchAgent.researchIdea(idea);
    console.log(`✅ [WORKFLOW] Research completed for company ${companyId}`);
    
    // Update workflow state with research data
    db.run(
      'UPDATE company_workflow_state SET research_data = ?, current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
      [JSON.stringify(researchData), 'product', companyId],
      (err) => {
        if (err) {
          console.error('Error updating workflow state with research:', err);
        } else {
          console.log(`📊 [WORKFLOW] Updated workflow state for company ${companyId} - research completed`);
        }
      }
    );
    
    // Step 2: Product Agent
    console.log(`🚀 [WORKFLOW] Starting product development for company ${companyId}`);
    const productData = await productAgent.developProduct(idea, researchData);
    console.log(`✅ [WORKFLOW] Product development completed for company ${companyId}`);
    
    // Update workflow state with product data and move to voting
    db.run(
      'UPDATE company_workflow_state SET product_data = ?, current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
      [JSON.stringify(productData), 'voting', companyId],
      (err) => {
        if (err) {
          console.error('Error updating workflow state with product:', err);
        } else {
          console.log(`📊 [WORKFLOW] Updated workflow state for company ${companyId} - product completed, waiting for approval`);
        }
      }
    );
    
    console.log(`🎯 [WORKFLOW] Company ${companyId} workflow completed - PDR ready for voting`);
    
  } catch (error) {
    console.error(`❌ [WORKFLOW] Error in auto-workflow for company ${companyId}:`, error);
    
    // Update workflow state to error
    db.run(
      'UPDATE company_workflow_state SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
      ['error', companyId],
      (err) => {
        if (err) {
          console.error('Error updating workflow state to error:', err);
        }
      }
    );
  }
}

module.exports = router;
