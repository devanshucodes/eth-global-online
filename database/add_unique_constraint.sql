-- Migration: Add unique constraint to prevent duplicate companies
-- Date: 2024-12-19
-- Description: Add unique constraint on ceo_agent_id in companies table

-- First, remove any existing duplicates
DELETE FROM companies WHERE id NOT IN (
  SELECT MIN(id) FROM companies GROUP BY ceo_agent_id
);

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_ceo_agent_id ON companies(ceo_agent_id);

-- Migration complete
SELECT 'Unique constraint added successfully!' as result;
