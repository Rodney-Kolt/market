-- ============================================================
-- Market Assistant – Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner')),
  full_name     TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────
-- 2. BUSINESSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  address             TEXT,
  contact_phone       TEXT,
  contact_email       TEXT,
  logo_url            TEXT,
  cuisine_type        TEXT,
  price_range         TEXT CHECK (price_range IN ('$', '$$', '$$$', '$$$$')),
  dietary_options     TEXT[],          -- e.g. ['vegan', 'halal', 'gluten-free']
  rating_avg          NUMERIC(3,2) DEFAULT 0,
  rating_count        INTEGER DEFAULT 0,
  transparency_score  INTEGER DEFAULT 50 CHECK (transparency_score BETWEEN 0 AND 100),
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can insert their business"
  ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their business"
  ON public.businesses FOR UPDATE USING (auth.uid() = owner_id);

-- ─────────────────────────────────────────────
-- 3. MENU ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id         UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT,
  price               NUMERIC(10,2),
  category            TEXT,            -- e.g. 'Mains', 'Drinks', 'Desserts'
  is_available_today  BOOLEAN DEFAULT false,
  dietary_tags        TEXT[],          -- e.g. ['vegan', 'spicy']
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view menu items"
  ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Owners can manage their menu items"
  ON public.menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = menu_items.business_id AND b.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- 4. QUESTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  asker_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can ask questions"
  ON public.questions FOR INSERT WITH CHECK (auth.uid() = asker_id);

-- ─────────────────────────────────────────────
-- 5. ANSWERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.answers (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id             UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answerer_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recommended_business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  answer_text             TEXT NOT NULL,
  upvotes                 INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view answers"
  ON public.answers FOR SELECT USING (true);

CREATE POLICY "Authenticated users can answer"
  ON public.answers FOR INSERT WITH CHECK (auth.uid() = answerer_id);

CREATE POLICY "Answerers can update their answers"
  ON public.answers FOR UPDATE USING (auth.uid() = answerer_id);

-- ─────────────────────────────────────────────
-- 6. RATINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id   UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  rater_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (business_id, rater_id)   -- one rating per user per business
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate"
  ON public.ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update their own rating"
  ON public.ratings FOR UPDATE USING (auth.uid() = rater_id);

-- ─────────────────────────────────────────────
-- 7. PRICE REPORTS (crowdsourced pricing)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.price_reports (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id       UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  menu_item_id      UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  reporter_id       UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reported_price    NUMERIC(10,2) NOT NULL,
  location_verified BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.price_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price reports"
  ON public.price_reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can report prices"
  ON public.price_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ─────────────────────────────────────────────
-- 8. FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-create user profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update business rating_avg and rating_count after a rating is inserted/updated
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses
  SET
    rating_avg   = (SELECT AVG(score) FROM public.ratings WHERE business_id = NEW.business_id),
    rating_count = (SELECT COUNT(*)   FROM public.ratings WHERE business_id = NEW.business_id)
  WHERE id = NEW.business_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- ─────────────────────────────────────────────
-- 9. INDEXES for performance
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_businesses_owner      ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_business   ON public.menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_questions_business    ON public.questions(business_id);
CREATE INDEX IF NOT EXISTS idx_questions_asker       ON public.questions(asker_id);
CREATE INDEX IF NOT EXISTS idx_answers_question      ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_ratings_business      ON public.ratings(business_id);
CREATE INDEX IF NOT EXISTS idx_price_reports_item    ON public.price_reports(menu_item_id);
