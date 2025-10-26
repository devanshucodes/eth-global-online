const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH || './database/ai_company.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(process.env.DB_PATH || './database/ai_company.db');

// Create tables
db.serialize(() => {
  // Ideas table
  db.run(`
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      potential_revenue TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Research table
  db.run(`
    CREATE TABLE IF NOT EXISTS research (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      research_data TEXT,
      competitor_analysis TEXT,
      market_opportunity TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas (id)
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      product_name TEXT,
      product_description TEXT,
      features TEXT,
      target_market TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas (id)
    )
  `);

  // Token holder votes
  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_holder_id TEXT,
      item_type TEXT, -- 'idea', 'product', 'research'
      item_id INTEGER,
      vote TEXT, -- 'approve', 'reject'
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Agent activities log
  db.run(`
    CREATE TABLE IF NOT EXISTS agent_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT,
      activity TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bolt prompts table
  db.run(`
    CREATE TABLE IF NOT EXISTS bolt_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      website_title TEXT,
      website_description TEXT,
      pages_required TEXT,
      functional_requirements TEXT,
      design_guidelines TEXT,
      integration_needs TEXT,
      bolt_prompt TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas (id)
    )
  `);

  // Revenue tracking table
  db.run(`
    CREATE TABLE IF NOT EXISTS revenue_distributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT,
      project_type TEXT, -- 'idea', 'product', 'website'
      revenue_amount REAL,
      owner_share REAL,
      dividend_share REAL,
      transaction_hash TEXT,
      block_number INTEGER,
      status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Token holders table
  db.run(`
    CREATE TABLE IF NOT EXISTS token_holders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT UNIQUE,
      token_balance REAL DEFAULT 0,
      total_dividends_earned REAL DEFAULT 0,
      last_dividend_claim DATETIME,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Project completions table
  db.run(`
    CREATE TABLE IF NOT EXISTS project_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      completion_type TEXT, -- 'website_deployed', 'marketing_completed', 'product_launched'
      estimated_revenue REAL,
      actual_revenue REAL,
      revenue_distributed BOOLEAN DEFAULT 0,
      completion_data TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (idea_id) REFERENCES ideas (id)
    )
  `);

  // Posts table - store drafts/published posts and platform responses
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER,
      agent_name TEXT,
      content TEXT,
      platforms TEXT,
      media_urls TEXT,
      status TEXT DEFAULT 'draft', -- draft | published | failed
      ayr_response TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // CEO agents table (routes expect this)
  db.run(`
    CREATE TABLE IF NOT EXISTS ceo_agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      company_idea TEXT,
      description TEXT,
      ceo_characteristics TEXT,
      creator_wallet TEXT,
      token_symbol TEXT UNIQUE,
      total_tokens INTEGER DEFAULT 100,
      tokens_available INTEGER DEFAULT 100,
      price_per_token REAL DEFAULT 5.0,
      status TEXT DEFAULT 'available',
      launch_timeline INTEGER,
      launch_date DATETIME,
      time_duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Companies table (basic fields used by routes)
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      ceo_agent_id INTEGER,
      status TEXT DEFAULT 'launching',
      current_revenue REAL DEFAULT 0,
      launched_date DATETIME,
      ceo_agent_name TEXT,
      token_symbol TEXT,
      company_idea TEXT,
      description TEXT,
      ceo_characteristics TEXT,
      total_tokens INTEGER,
      price_per_token REAL,
      time_duration INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ceo_agent_id) REFERENCES ceo_agents (id)
    )
  `);

  // Agent token holdings (used when buying tokens)
  db.run(`
    CREATE TABLE IF NOT EXISTS agent_token_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_wallet TEXT,
      ceo_agent_id INTEGER,
      tokens_owned INTEGER,
      purchase_price REAL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ceo_agent_id) REFERENCES ceo_agents (id)
    )
  `);

  // Company workflow state table
  db.run(`
    CREATE TABLE IF NOT EXISTS company_workflow_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      current_step TEXT DEFAULT 'research',
      research_data TEXT,
      product_data TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id)
    )
  `);

  // Company workflow votes table
  db.run(`
    CREATE TABLE IF NOT EXISTS company_workflow_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      vote_type TEXT NOT NULL,
      vote TEXT NOT NULL,
      voter_id TEXT,
      feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id)
    )
  `);
});

console.log('Database initialized successfully');

module.exports = db;
