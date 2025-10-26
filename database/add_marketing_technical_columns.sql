-- Add marketing and technical strategy columns to company_workflow_state

ALTER TABLE company_workflow_state ADD COLUMN marketing_strategy TEXT;
ALTER TABLE company_workflow_state ADD COLUMN technical_strategy TEXT;
