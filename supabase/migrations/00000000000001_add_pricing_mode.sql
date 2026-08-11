-- Add pricing_mode to quotation_items
ALTER TABLE quotation_items ADD COLUMN pricing_mode TEXT DEFAULT 'manual';
