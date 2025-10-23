const FinanceAgent = require('../agents/FinanceAgent');
const sqlite3 = require('sqlite3').verbose();

class RevenueAutomationService {
  constructor() {
    this.db = new sqlite3.Database(process.env.DB_PATH || './database/ai_company.db');
    this.financeAgent = new FinanceAgent();
  }

  /**
   * Automatically trigger revenue distribution when a website is deployed
   */
  async onWebsiteDeployment(ideaId, deploymentData) {
    try {
      console.log(`🚀 Website deployed for idea ${ideaId}. Triggering revenue distribution...`);

      // Get idea and product data to estimate revenue
      const projectData = await this.getProjectData(ideaId);
      
      if (!projectData.idea) {
        console.error(`❌ Idea ${ideaId} not found`);
        return { success: false, error: 'Idea not found' };
      }

      // Calculate revenue based on project type and complexity
      const estimatedRevenue = this.calculateWebsiteRevenue(projectData, deploymentData);

      // Process revenue distribution
      const result = await this.financeAgent.processProjectRevenue(
        ideaId,
        'website_deployment',
        estimatedRevenue,
        {
          ...deploymentData,
          deployment_type: 'automated',
          estimated: true
        }
      );

      if (result.success) {
        console.log(`✅ Revenue distributed for website deployment: ${estimatedRevenue} AVAX`);
        
        // Update project status
        await this.updateProjectStatus(ideaId, 'revenue_distributed');
      }

      return result;

    } catch (error) {
      console.error('Revenue automation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger revenue distribution for marketing campaign completion
   */
  async onMarketingCampaignComplete(ideaId, campaignData) {
    try {
      console.log(`📢 Marketing campaign completed for idea ${ideaId}. Triggering revenue distribution...`);

      const projectData = await this.getProjectData(ideaId);
      const estimatedRevenue = this.calculateMarketingRevenue(projectData, campaignData);

      const result = await this.financeAgent.processProjectRevenue(
        ideaId,
        'marketing_campaign',
        estimatedRevenue,
        {
          ...campaignData,
          campaign_type: 'automated',
          estimated: true
        }
      );

      if (result.success) {
        console.log(`✅ Revenue distributed for marketing campaign: ${estimatedRevenue} AVAX`);
      }

      return result;

    } catch (error) {
      console.error('Marketing revenue automation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger revenue distribution for product launch
   */
  async onProductLaunch(ideaId, launchData) {
    try {
      console.log(`🎉 Product launched for idea ${ideaId}. Triggering revenue distribution...`);

      const projectData = await this.getProjectData(ideaId);
      const estimatedRevenue = this.calculateProductLaunchRevenue(projectData, launchData);

      const result = await this.financeAgent.processProjectRevenue(
        ideaId,
        'product_launch',
        estimatedRevenue,
        {
          ...launchData,
          launch_type: 'automated',
          estimated: true
        }
      );

      if (result.success) {
        console.log(`✅ Revenue distributed for product launch: ${estimatedRevenue} AVAX`);
      }

      return result;

    } catch (error) {
      console.error('Product launch revenue automation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate estimated revenue for website deployment
   */
  calculateWebsiteRevenue(projectData, deploymentData) {
    let baseRevenue = 0.1; // Base 0.1 AVAX for any website deployment

    // Adjust based on project complexity
    if (projectData.product) {
      const features = projectData.product.features;
      if (typeof features === 'string') {
        try {
          const featuresArray = JSON.parse(features);
          baseRevenue += featuresArray.length * 0.02; // 0.02 AVAX per feature
        } catch (e) {
          // If parsing fails, use string length as complexity indicator
          baseRevenue += Math.min(features.length / 100, 0.1);
        }
      }
    }

    // Adjust based on potential revenue mentioned in idea
    if (projectData.idea.potential_revenue) {
      const potentialMatch = projectData.idea.potential_revenue.match(/\$?([\d,]+)/);
      if (potentialMatch) {
        const potential = parseInt(potentialMatch[1].replace(/,/g, ''));
        if (potential > 100000) baseRevenue += 0.05; // High potential projects
        if (potential > 1000000) baseRevenue += 0.1; // Million dollar projects
      }
    }

    // Add deployment complexity bonus
    if (deploymentData && deploymentData.pages_count > 5) {
      baseRevenue += 0.03;
    }

    return Math.min(baseRevenue, 0.5); // Cap at 0.5 AVAX
  }

  /**
   * Calculate estimated revenue for marketing campaigns
   */
  calculateMarketingRevenue(projectData, campaignData) {
    let baseRevenue = 0.05; // Base 0.05 AVAX for marketing completion

    // Adjust based on campaign scope
    if (campaignData && campaignData.channels) {
      baseRevenue += campaignData.channels.length * 0.01;
    }

    return Math.min(baseRevenue, 0.2); // Cap at 0.2 AVAX
  }

  /**
   * Calculate estimated revenue for product launches
   */
  calculateProductLaunchRevenue(projectData, launchData) {
    let baseRevenue = 0.2; // Base 0.2 AVAX for product launch

    // This would be the highest revenue event
    // Adjust based on launch scope and features
    if (projectData.product) {
      const features = projectData.product.features;
      if (typeof features === 'string') {
        try {
          const featuresArray = JSON.parse(features);
          baseRevenue += featuresArray.length * 0.05; // 0.05 AVAX per feature
        } catch (e) {
          baseRevenue += Math.min(features.length / 50, 0.2);
        }
      }
    }

    return Math.min(baseRevenue, 1.0); // Cap at 1.0 AVAX
  }

  /**
   * Get project data (idea, product, research)
   */
  async getProjectData(ideaId) {
    const idea = await new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const product = await new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM products WHERE idea_id = ?', [ideaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const research = await new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM research WHERE idea_id = ?', [ideaId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    return { idea, product, research };
  }

  /**
   * Update project status
   */
  async updateProjectStatus(ideaId, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE ideas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, ideaId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Check for projects ready for revenue distribution
   */
  async checkPendingDistributions() {
    try {
      // Get completed projects that haven't distributed revenue yet
      const pendingProjects = await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT pc.*, i.title, i.description 
           FROM project_completions pc
           JOIN ideas i ON pc.idea_id = i.id
           WHERE pc.revenue_distributed = 0
           ORDER BY pc.completed_at DESC`,
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      console.log(`📊 Found ${pendingProjects.length} projects pending revenue distribution`);

      for (const project of pendingProjects) {
        console.log(`💰 Processing pending revenue for project ${project.idea_id} (${project.completion_type})`);
        
        let result;
        switch (project.completion_type) {
          case 'website_deployed':
            result = await this.onWebsiteDeployment(project.idea_id, JSON.parse(project.completion_data || '{}'));
            break;
          case 'marketing_completed':
            result = await this.onMarketingCampaignComplete(project.idea_id, JSON.parse(project.completion_data || '{}'));
            break;
          case 'product_launched':
            result = await this.onProductLaunch(project.idea_id, JSON.parse(project.completion_data || '{}'));
            break;
          default:
            console.log(`⚠️  Unknown completion type: ${project.completion_type}`);
            continue;
        }

        if (result && result.success) {
          // Mark as distributed
          await new Promise((resolve, reject) => {
            this.db.run(
              'UPDATE project_completions SET revenue_distributed = 1, actual_revenue = ? WHERE id = ?',
              [result.totalAmount, project.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

    } catch (error) {
      console.error('Error checking pending distributions:', error);
    }
  }
}

module.exports = new RevenueAutomationService();
