-- ============================================================
-- Market Assistant – Migration v2
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add `category` column to businesses (general business category)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Add `service_name` to price_reports (for non-menu businesses)
ALTER TABLE public.price_reports
  ADD COLUMN IF NOT EXISTS service_name TEXT;

-- 3. Index for category search
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

-- 4. Update RLS: allow public read for businesses (including inactive for owners)
-- Drop and recreate to ensure correct policy
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;

CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT USING (is_active = true);

-- 5. Ensure answers are publicly readable
DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;
CREATE POLICY "Anyone can view answers"
  ON public.answers FOR SELECT USING (true);

-- 6. Ensure questions are publicly readable
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT USING (true);

-- 7. Allow upsert on ratings (for role-switch safe updates)
DROP POLICY IF EXISTS "Users can update their own rating" ON public.ratings;
CREATE POLICY "Users can update their own rating"
  ON public.ratings FOR UPDATE USING (auth.uid() = rater_id);

-- 8. Allow users to update their own profile (role switching)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);
