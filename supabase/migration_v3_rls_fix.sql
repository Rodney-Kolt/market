-- ============================================================
-- Market Assistant – Migration v3: RLS Policy Fixes
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── USERS ──────────────────────────────────────────────────
-- Allow authenticated users to read their own row
-- (needed for dashboard page.tsx to fetch the profile)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ── BUSINESSES ─────────────────────────────────────────────
-- Public read for active businesses; owners can write
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can insert their business" ON public.businesses;
CREATE POLICY "Owners can insert their business"
  ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update their business" ON public.businesses;
CREATE POLICY "Owners can update their business"
  ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);

-- ── MENU ITEMS ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners can manage their menu items" ON public.menu_items;
CREATE POLICY "Owners can manage their menu items"
  ON public.menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = menu_items.business_id AND b.owner_id = auth.uid()
    )
  );

-- ── QUESTIONS ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can ask questions" ON public.questions;
CREATE POLICY "Authenticated users can ask questions"
  ON public.questions FOR INSERT WITH CHECK (auth.uid() = asker_id);

-- ── ANSWERS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;
CREATE POLICY "Anyone can view answers"
  ON public.answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can answer" ON public.answers;
CREATE POLICY "Authenticated users can answer"
  ON public.answers FOR INSERT WITH CHECK (auth.uid() = answerer_id);

DROP POLICY IF EXISTS "Answerers can update their answers" ON public.answers;
CREATE POLICY "Answerers can update their answers"
  ON public.answers FOR UPDATE USING (auth.uid() = answerer_id);

-- ── RATINGS ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can rate" ON public.ratings;
CREATE POLICY "Authenticated users can rate"
  ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "Users can update their own rating" ON public.ratings;
CREATE POLICY "Users can update their own rating"
  ON public.ratings FOR UPDATE USING (auth.uid() = rater_id);

-- ── PRICE REPORTS ──────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone can view price reports" ON public.price_reports;
CREATE POLICY "Anyone can view price reports"
  ON public.price_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can report prices" ON public.price_reports;
CREATE POLICY "Authenticated users can report prices"
  ON public.price_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
