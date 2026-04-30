-- ============================================================
-- Market Assistant – Migration v4: Fix is_active default
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Ensure all existing businesses without is_active set are treated as active
UPDATE public.businesses
SET is_active = true
WHERE is_active IS NULL;

-- Set the column default so future inserts always get true
ALTER TABLE public.businesses
  ALTER COLUMN is_active SET DEFAULT true;

-- Also ensure the column is NOT NULL going forward
ALTER TABLE public.businesses
  ALTER COLUMN is_active SET NOT NULL;
