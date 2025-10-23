-- Migration: Add CEO agent details to companies table
-- Date: 2024-12-19
-- Description: Add CEO agent details to companies table for launched agents

-- Add CEO agent details columns to companies table
ALTER TABLE companies ADD COLUMN ceo_agent_name TEXT;
ALTER TABLE companies ADD COLUMN token_symbol TEXT;
ALTER TABLE companies ADD COLUMN company_idea TEXT;
ALTER TABLE companies ADD COLUMN description TEXT;
ALTER TABLE companies ADD COLUMN ceo_characteristics TEXT;
ALTER TABLE companies ADD COLUMN total_tokens INTEGER;
ALTER TABLE companies ADD COLUMN price_per_token REAL;
ALTER TABLE companies ADD COLUMN time_duration INTEGER;

-- Migration complete
SELECT 'CEO agent details columns added to companies table successfully!' as result;
