-- Migration: Transform AI Company to CEO Agents Platform
-- Date: 2024-09-26
-- Description: Add tables for CEO agents marketplace, companies, and token holdings

-- 1. CEO Agents Marketplace Table
CREATE TABLE IF NOT EXISTS ceo_agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- "Steve Jobs AI"
  company_idea TEXT NOT NULL,            -- "Revolutionary EdTech Platform"
  description TEXT,                      -- Detailed description
  ceo_characteristics TEXT,              -- AI personality traits
  creator_wallet TEXT,                   -- Who created this agent
  token_symbol TEXT UNIQUE,              -- "SJOB", "ELON", etc.
  total_tokens INTEGER DEFAULT 100,      -- Total tokens available
  tokens_available INTEGER,              -- Tokens still for sale
  price_per_token REAL DEFAULT 5.0,     -- Price in USD
  status TEXT DEFAULT 'available',       -- 'available', 'sold_out', 'launched'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Running Companies Table (Launched Agents)
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ceo_agent_id INTEGER,                  -- Reference to CEO agent
  name TEXT NOT NULL,                    -- "Steve Jobs AI Company"
  status TEXT DEFAULT 'running',         -- 'launching', 'running', 'paused'
  current_revenue REAL DEFAULT 0,        -- Real revenue generated
  launched_date DATETIME,                -- When company launched
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ceo_agent_id) REFERENCES ceo_agents (id)
);

-- 3. Agent Token Holdings (User Investments)
CREATE TABLE IF NOT EXISTS agent_token_holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_wallet TEXT,                      -- User's wallet address
  ceo_agent_id INTEGER,                  -- Which agent they invested in
  tokens_owned INTEGER,                  -- How many tokens they own
  purchase_price REAL,                   -- Price they paid per token
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ceo_agent_id) REFERENCES ceo_agents (id)
);

-- 4. Add columns to existing token_holders table
ALTER TABLE token_holders ADD COLUMN user_id TEXT;
ALTER TABLE token_holders ADD COLUMN portfolio_value REAL DEFAULT 0;

-- 5. Insert sample CEO agents data
INSERT INTO ceo_agents (name, company_idea, description, ceo_characteristics, creator_wallet, token_symbol, total_tokens, tokens_available, price_per_token, status) VALUES
('Steve Jobs AI', 'Revolutionary EdTech Platform', 'AI-powered personalized learning platform that adapts to individual learning styles', 'Visionary, perfectionist, focuses on user experience and innovation. Demands excellence in design and user interface. Makes bold decisions and thinks different.', '0x1234...5678', 'SJOB', 100, 45, 5.00, 'available'),
('Elon Musk AI', 'Sustainable Energy Solutions', 'AI-driven platform for optimizing renewable energy distribution and storage', 'Ambitious, risk-taker, focuses on solving humanity''s biggest challenges. Thinks at scale, pushes boundaries, and isn''t afraid of failure.', '0x9876...4321', 'ELON', 200, 120, 8.50, 'available'),
('Warren Buffett AI', 'Smart Investment Platform', 'AI-powered investment advisory platform using value investing principles', 'Patient, analytical, focuses on long-term value creation. Conservative approach with deep market understanding.', '0x5555...9999', 'BUFF', 150, 80, 12.00, 'available');

-- 6. Insert sample running companies data
INSERT INTO companies (ceo_agent_id, name, status, current_revenue, launched_date) VALUES
(1, 'Steve Jobs AI Company', 'running', 25000, '2024-01-15'),
(2, 'Sustainable Energy Corp', 'running', 45000, '2024-02-20');

-- 7. Insert sample token holdings data
INSERT INTO agent_token_holdings (user_wallet, ceo_agent_id, tokens_owned, purchase_price) VALUES
('token_holder_abc123', 1, 25, 5.00),
('token_holder_abc123', 2, 40, 8.50),
('token_holder_abc123', 3, 20, 12.00),
('token_holder_def456', 1, 30, 5.00),
('token_holder_def456', 2, 20, 8.50);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ceo_agents_status ON ceo_agents(status);
CREATE INDEX IF NOT EXISTS idx_ceo_agents_creator ON ceo_agents(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_companies_agent ON companies(ceo_agent_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user ON agent_token_holdings(user_wallet);
CREATE INDEX IF NOT EXISTS idx_holdings_agent ON agent_token_holdings(ceo_agent_id);

-- Migration complete
SELECT 'Migration completed successfully!' as result;
