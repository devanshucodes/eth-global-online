const ASIOneAgent = require('./ASIOneAgent');
const web3Service = require('../services/web3Service');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class FinanceAgent extends ASIOneAgent {
  constructor(apiKey) {
    super('Finance Agent', 'Financial analysis and revenue distribution', apiKey);
    this.db = new sqlite3.Database(process.env.DB_PATH || './database/ai_company.db');
  }

  /**
   * Process revenue distribution for a completed project
   */
  async processProjectRevenue(projectId, projectType, revenueAmount, completionData = {}) {
    try {
      console.log(`💰 Finance Agent: Processing revenue for ${projectType} ${projectId}`);
      
      // Record project completion
      await this.recordProjectCompletion(projectId, projectType, revenueAmount, completionData);
      
      // Distribute revenue via smart contract
      const distributionResult = await web3Service.distributeRevenue(revenueAmount, projectId);
      
      if (distributionResult.success) {
        // Record successful distribution
        await this.recordRevenueDistribution(
          projectId,
          projectType,
          distributionResult.totalAmount,
          distributionResult.ownerShare,
          distributionResult.dividendShare,
          distributionResult.transactionHash,
          distributionResult.blockNumber,
          'completed'
        );

        // Update token holder balances
        await this.updateTokenHolderData();

        // Log activity
        await this.logActivity('Revenue Distributed', {
          projectId,
          projectType,
          totalAmount: distributionResult.totalAmount,
          ownerShare: distributionResult.ownerShare,
          dividendShare: distributionResult.dividendShare,
          transactionHash: distributionResult.transactionHash
        });

        console.log(`✅ Finance Agent: Revenue distribution completed for project ${projectId}`);
        return distributionResult;

      } else {
        // Record failed distribution
        await this.recordRevenueDistribution(
          projectId,
          projectType,
          revenueAmount,
          revenueAmount * 0.8,
          revenueAmount * 0.2,
          null,
          null,
          'failed'
        );

        console.error(`❌ Finance Agent: Revenue distribution failed for project ${projectId}`);
        return distributionResult;
      }

    } catch (error) {
      console.error('Finance Agent error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze revenue potential for a project using ASI:One
   */
  async analyzeRevenueProjection(ideaData, productData = null) {
    try {
      const prompt = `
        As the Finance Agent for an AI company, analyze the revenue potential for this project:
        
        IDEA: ${JSON.stringify(ideaData, null, 2)}
        ${productData ? `PRODUCT: ${JSON.stringify(productData, null, 2)}` : ''}
        
        Please provide:
        1. Estimated revenue range (minimum, maximum, most likely)
        2. Revenue timeline (when revenue might be generated)
        3. Revenue sources (how money would be made)
        4. Risk factors that could impact revenue
        5. Recommended pricing strategy
        
        Format your response as JSON with these fields:
        {
          "revenue_projection": {
            "minimum": number,
            "maximum": number,
            "most_likely": number,
            "currency": "AVAX"
          },
          "timeline": "string describing when revenue is expected",
          "revenue_sources": ["source1", "source2"],
          "risk_factors": ["risk1", "risk2"],
          "pricing_strategy": "description",
          "confidence_level": "high/medium/low"
        }
      `;

      const analysis = await this.generateResponse(prompt);
      
      // Log the analysis
      await this.logActivity('Revenue Analysis', {
        ideaId: ideaData.id,
        analysis: analysis
      });

      return analysis;

    } catch (error) {
      console.error('Finance Agent analysis error:', error);
      return null;
    }
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport() {
    try {
      const [revenueData, tokenHolderData, contractInfo] = await Promise.all([
        this.getRevenueHistory(),
        this.getTokenHolderSummary(),
        web3Service.getContractInfo()
      ]);

      const prompt = `
        As the Finance Agent, create a comprehensive financial report based on this data:
        
        REVENUE HISTORY: ${JSON.stringify(revenueData, null, 2)}
        TOKEN HOLDERS: ${JSON.stringify(tokenHolderData, null, 2)}
        CONTRACT INFO: ${JSON.stringify(contractInfo, null, 2)}
        
        Generate a professional financial report including:
        1. Total revenue generated
        2. Total dividends distributed
        3. Token holder performance
        4. Growth metrics
        5. Recommendations for improvement
        
        Format as a markdown report.
      `;

      const report = await this.generateResponse(prompt);
      
      await this.logActivity('Financial Report Generated', {
        reportDate: new Date().toISOString(),
        dataPoints: {
          totalRevenue: revenueData.totalRevenue,
          totalDividends: revenueData.totalDividends,
          tokenHolders: tokenHolderData.count
        }
      });

      return report;

    } catch (error) {
      console.error('Finance Agent report error:', error);
      return null;
    }
  }

  /**
   * Record project completion in database
   */
  async recordProjectCompletion(ideaId, completionType, estimatedRevenue, completionData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO project_completions 
         (idea_id, completion_type, estimated_revenue, completion_data) 
         VALUES (?, ?, ?, ?)`,
        [ideaId, completionType, estimatedRevenue, JSON.stringify(completionData)],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Record revenue distribution in database
   */
  async recordRevenueDistribution(projectId, projectType, revenueAmount, ownerShare, dividendShare, txHash, blockNumber, status) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO revenue_distributions 
         (project_id, project_type, revenue_amount, owner_share, dividend_share, transaction_hash, block_number, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [projectId, projectType, revenueAmount, ownerShare, dividendShare, txHash, blockNumber, status],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Update token holder data from smart contract
   */
  async updateTokenHolderData() {
    try {
      // Get all token holders from database
      const tokenHolders = await new Promise((resolve, reject) => {
        this.db.all(
          "SELECT * FROM token_holders",
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      // Update each token holder's data
      for (const holder of tokenHolders) {
        const dividendInfo = await web3Service.getDividendInfo(holder.wallet_address);
        
        if (dividendInfo) {
          await new Promise((resolve, reject) => {
            this.db.run(
              `UPDATE token_holders 
               SET token_balance = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE wallet_address = ?`,
              [parseFloat(dividendInfo.tokenBalance), holder.wallet_address],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      console.log(`📊 Updated data for ${tokenHolders.length} token holders`);

    } catch (error) {
      console.error('Error updating token holder data:', error);
    }
  }

  /**
   * Get revenue history
   */
  async getRevenueHistory() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
           COUNT(*) as total_distributions,
           SUM(revenue_amount) as total_revenue,
           SUM(dividend_share) as total_dividends,
           SUM(owner_share) as total_owner_share,
           AVG(revenue_amount) as avg_revenue
         FROM revenue_distributions 
         WHERE status = 'completed'`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0] || {});
        }
      );
    });
  }

  /**
   * Get token holder summary
   */
  async getTokenHolderSummary() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
           COUNT(*) as count,
           SUM(token_balance) as total_tokens,
           AVG(token_balance) as avg_tokens,
           SUM(total_dividends_earned) as total_dividends_earned
         FROM token_holders`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows[0] || {});
        }
      );
    });
  }

  /**
   * Add new token holder
   */
  async addTokenHolder(walletAddress, initialTokens = 0) {
    try {
      await new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR IGNORE INTO token_holders (wallet_address, token_balance) 
           VALUES (?, ?)`,
          [walletAddress, initialTokens],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Mint tokens if specified
      if (initialTokens > 0) {
        const mintResult = await web3Service.mintTokens(walletAddress, initialTokens);
        
        if (mintResult.success) {
          console.log(`🪙 Minted ${initialTokens} tokens for ${walletAddress}`);
          await this.logActivity('Tokens Minted', {
            walletAddress,
            amount: initialTokens,
            transactionHash: mintResult.transactionHash
          });
        }
      }

      return true;

    } catch (error) {
      console.error('Error adding token holder:', error);
      return false;
    }
  }
}

module.exports = FinanceAgent;
