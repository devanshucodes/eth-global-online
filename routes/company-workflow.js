const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const CMOAgent = require('../agents/CMOAgent');
const CTOAgent = require('../agents/CTOAgent');
const HeadOfEngineeringAgent = require('../agents/HeadOfEngineeringAgent');

// Database connection
const dbPath = process.env.DB_PATH || './database/ai_company.db';
const db = new sqlite3.Database(dbPath);

// Initialize agents
const cmoAgent = new CMOAgent(process.env.ASI_ONE_API_KEY, process.env.AYRSHARE_API_KEY);
const ctoAgent = new CTOAgent(process.env.ASI_ONE_API_KEY);
const headOfEngineeringAgent = new HeadOfEngineeringAgent(process.env.ASI_ONE_API_KEY);

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
        if (workflow.marketing_strategy) {
          workflow.marketing_strategy = JSON.parse(workflow.marketing_strategy);
        }
        if (workflow.technical_strategy) {
          workflow.technical_strategy = JSON.parse(workflow.technical_strategy);
        }
      } catch (parseError) {
        console.error('Error parsing workflow data:', parseError);
      }
      
      res.json({ success: true, workflow });
    }
  );
});

// Vote on company workflow (approve/reject PDR)
router.post('/:companyId/vote', async (req, res) => {
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
          
          // Respond immediately
          res.json({ 
            success: true, 
            message: `Product Development Report ${vote}d successfully!`,
            vote: vote,
            newStep: newStep
          });
          
          // If approved, trigger CMO and CTO workflow in background
          if (vote === 'approve') {
            console.log(`✅ [WORKFLOW] PDR approved for company ${companyId}, starting CMO and CTO agents...`);
            setTimeout(() => {
              triggerMarketingAndTechnicalWorkflow(companyId);
            }, 1000);
          }
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

// Trigger marketing and technical workflow after PDR approval
async function triggerMarketingAndTechnicalWorkflow(companyId) {
  console.log(`🚀 [WORKFLOW] Starting CMO and CTO workflow for company ${companyId}`);
  
  try {
    // Get workflow state with research and product data
    const workflow = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM company_workflow_state WHERE company_id = ?',
        [companyId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!workflow) {
      console.error(`❌ [WORKFLOW] No workflow found for company ${companyId}`);
      return;
    }
    
    // Parse JSON data
    const research = workflow.research_data ? JSON.parse(workflow.research_data) : {};
    const product = workflow.product_data ? JSON.parse(workflow.product_data) : {};
    
    // Get company info for idea
    const company = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM companies WHERE id = ?',
        [companyId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!company) {
      console.error(`❌ [WORKFLOW] No company found for id ${companyId}`);
      return;
    }
    
    const idea = {
      id: companyId,
      title: company.company_idea || company.name,
      description: company.description,
      potential_revenue: '$1M+',
      status: 'approved'
    };
    
    console.log(`📢 [WORKFLOW] Starting CMO Agent for company ${companyId}...`);
    const marketingStrategy = await cmoAgent.developMarketingStrategy(idea, product, research);
    console.log(`✅ [WORKFLOW] CMO completed for company ${companyId}`);
    
    // Generate and post tweet to Twitter/X
    console.log(`🐦 [WORKFLOW] CMO generating Twitter post for company ${companyId}...`);
    await cmoAgent.generateAndPostTweet(product, marketingStrategy);
    
    console.log(`⚙️ [WORKFLOW] Starting CTO Agent for company ${companyId}...`);
    const technicalStrategy = await ctoAgent.developTechnicalStrategy(idea, product, research);
    console.log(`✅ [WORKFLOW] CTO completed for company ${companyId}`);
    
    // Update workflow state with marketing and technical strategies
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE company_workflow_state SET marketing_strategy = ?, technical_strategy = ?, current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
        [JSON.stringify(marketingStrategy), JSON.stringify(technicalStrategy), 'engineering', companyId],
        (err) => {
          if (err) {
            console.error('❌ [WORKFLOW] Error updating workflow state with strategies:', err);
            reject(err);
          } else {
            console.log(`✅ [WORKFLOW] CMO and CTO strategies saved for company ${companyId}`);
            resolve();
          }
        }
      );
    });
    
    // Now trigger Head of Engineering Agent to create Bolt prompt
    console.log(`🔧 [WORKFLOW] Starting Head of Engineering Agent for company ${companyId}...`);
    const boltPrompt = await headOfEngineeringAgent.createBoltPrompt(idea, product, research, marketingStrategy, technicalStrategy);
    console.log(`✅ [WORKFLOW] Head of Engineering completed for company ${companyId}`);
    
    // Save bolt prompt to database
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO bolt_prompts (
          idea_id, website_title, website_description, pages_required,
          functional_requirements, design_guidelines, integration_needs, bolt_prompt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyId,
          boltPrompt.website_title || '',
          boltPrompt.website_description || '',
          JSON.stringify(boltPrompt.pages_required || []),
          JSON.stringify(boltPrompt.functional_requirements || []),
          JSON.stringify(boltPrompt.design_specifications || {}),
          JSON.stringify(boltPrompt.integration_requirements || []),
          boltPrompt.bolt_prompt || ''
        ],
        function(err) {
          if (err) {
            console.error('❌ [WORKFLOW] Error saving bolt prompt:', err);
            reject(err);
          } else {
            console.log(`✅ [WORKFLOW] Bolt prompt saved with ID ${this.lastID} for company ${companyId}`);
            resolve(this.lastID);
          }
        }
      );
    });
    
    // Update workflow to complete
    db.run(
      'UPDATE company_workflow_state SET current_step = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
      ['complete', companyId],
      (err) => {
        if (err) {
          console.error('❌ [WORKFLOW] Error updating workflow to complete:', err);
        } else {
          console.log(`🎉 [WORKFLOW] Complete workflow finished for company ${companyId}! Developer Agent ready.`);
        }
      }
    );
    
  } catch (error) {
    console.error(`❌ [WORKFLOW] Error in CMO/CTO workflow for company ${companyId}:`, error);
    
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
