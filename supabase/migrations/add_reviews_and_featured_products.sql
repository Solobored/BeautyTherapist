-- Migration: Add custom_reviews and featured_product_ids to brands table
-- Run this in Supabase SQL Editor to add the new columns

-- Add custom_reviews column (JSONB array to store customer reviews)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS custom_reviews JSONB DEFAULT '[]'::jsonb;

-- Add featured_product_ids column (JSONB array to store featured product IDs)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS featured_product_ids JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the columns
COMMENT ON COLUMN brands.custom_reviews IS 'Array of customer reviews added by the seller. Each review has: id, customerName, text, rating';
COMMENT ON COLUMN brands.featured_product_ids IS 'Array of product IDs that the seller wants to feature prominently on their brand page';
