-- Add company workflow state tables
-- This migration adds tables to track workflow state for each company

-- Company workflow state table
CREATE TABLE IF NOT EXISTS company_workflow_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  current_step TEXT DEFAULT 'research', -- 'research', 'product', 'voting', 'approved', 'rejected'
  research_data TEXT, -- JSON string of research results
  product_data TEXT, -- JSON string of product development report
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Company workflow votes table
CREATE TABLE IF NOT EXISTS company_workflow_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL, -- 'product_approval', 'research_approval'
  vote TEXT NOT NULL, -- 'approve', 'reject'
  voter_id TEXT, -- token holder ID
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_workflow_company_id ON company_workflow_state (company_id);
CREATE INDEX IF NOT EXISTS idx_company_workflow_votes_company_id ON company_workflow_votes (company_id);
CREATE INDEX IF NOT EXISTS idx_company_workflow_votes_type ON company_workflow_votes (vote_type);
