-- =============================================================================
-- BringIT Campus Delivery System - Supabase Complete Setup Script
-- Run this entire script in your Supabase SQL Editor (Option B: Fresh Project)
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. DROP EXISTING OBJECTS (for clean reinstall if re-running)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.increment_deliverer_stats(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.update_deliverer_rating(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.increment_requests_posted(UUID) CASCADE;

-- -----------------------------------------------------------------------------
-- 2. CREATE TABLES
-- -----------------------------------------------------------------------------

-- Profiles table (stores university student details and stats)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL DEFAULT '',
  email                TEXT NOT NULL DEFAULT '',
  student_id           TEXT DEFAULT '',
  department           TEXT DEFAULT '',
  batch                TEXT DEFAULT '',
  hall                 TEXT DEFAULT '',
  phone                TEXT DEFAULT '',
  rating               NUMERIC DEFAULT 5.0,
  total_ratings        INTEGER DEFAULT 0,
  deliveries_completed INTEGER DEFAULT 0,
  requests_posted       INTEGER DEFAULT 0,
  total_earnings       INTEGER DEFAULT 0,
  badges               TEXT[] DEFAULT ARRAY['Campus Novice']::TEXT[],
  bookmarked_requests  TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Requests table (peer-to-peer delivery requests)
CREATE TABLE IF NOT EXISTS public.requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item             TEXT NOT NULL,
  pickup           TEXT NOT NULL,
  dropoff          TEXT NOT NULL,
  reward           INTEGER NOT NULL DEFAULT 50,
  urgency          TEXT NOT NULL DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  details          TEXT DEFAULT '',
  status           TEXT NOT NULL DEFAULT 'Open',   -- 'Open', 'Accepted', 'InProgress', 'Completed', 'Cancelled'
  requester_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requester_name   TEXT NOT NULL DEFAULT 'Student',
  accepted_by_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_by_name TEXT,
  accepted_at      TIMESTAMPTZ,
  in_progress_at   TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  payment_method   TEXT DEFAULT 'bKash',          -- 'bKash', 'Nagad', 'Cash'
  payment_status   TEXT DEFAULT 'Unpaid',
  rating           NUMERIC,
  reported_by      TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (real-time chat per delivery request)
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL DEFAULT 'Student',
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  read        BOOLEAN DEFAULT FALSE,
  request_id  UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  type        TEXT DEFAULT 'info',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_accepted ON public.requests(accepted_by_id);
CREATE INDEX IF NOT EXISTS idx_messages_request ON public.messages(request_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 3. STORED PROCEDURES & TRIGGERS
-- -----------------------------------------------------------------------------

-- Trigger function: automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RPC: Increment deliverer statistics and dynamically award badges upon delivery completion
CREATE OR REPLACE FUNCTION public.increment_deliverer_stats(deliverer_id UUID, earning_amount NUMERIC)
RETURNS void AS $$
DECLARE
  p public.profiles%ROWTYPE;
  current_badges TEXT[];
BEGIN
  UPDATE public.profiles
  SET deliveries_completed = COALESCE(deliveries_completed, 0) + 1,
      total_earnings = COALESCE(total_earnings, 0) + earning_amount::INTEGER
  WHERE id = deliverer_id
  RETURNING * INTO p;

  current_badges := COALESCE(p.badges, ARRAY[]::TEXT[]);

  IF p.deliveries_completed >= 5 AND NOT ('Quick Courier' = ANY(current_badges)) THEN
    current_badges := array_append(current_badges, 'Quick Courier');
  END IF;
  IF p.deliveries_completed >= 10 AND NOT ('Reliable' = ANY(current_badges)) THEN
    current_badges := array_append(current_badges, 'Reliable');
  END IF;
  IF p.deliveries_completed >= 25 AND NOT ('Elite Traveler' = ANY(current_badges)) THEN
    current_badges := array_append(current_badges, 'Elite Traveler');
  END IF;
  IF p.rating >= 4.8 AND p.deliveries_completed >= 5 AND NOT ('5-Star Hero' = ANY(current_badges)) THEN
    current_badges := array_append(current_badges, '5-Star Hero');
  END IF;

  UPDATE public.profiles
  SET badges = current_badges
  WHERE id = deliverer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Update deliverer rating after a completed delivery
CREATE OR REPLACE FUNCTION public.update_deliverer_rating(deliverer_id UUID, new_rating NUMERIC)
RETURNS void AS $$
DECLARE
  p public.profiles%ROWTYPE;
  new_total INTEGER;
  new_avg NUMERIC;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE id = deliverer_id;
  IF NOT FOUND THEN RETURN; END IF;

  new_total := COALESCE(p.total_ratings, 0) + 1;
  new_avg := ROUND(((COALESCE(p.rating, 5.0) * COALESCE(p.total_ratings, 0)) + new_rating) / new_total, 1);

  UPDATE public.profiles
  SET rating = new_avg,
      total_ratings = new_total
  WHERE id = deliverer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Increment requests posted count
CREATE OR REPLACE FUNCTION public.increment_requests_posted(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET requests_posted = COALESCE(requests_posted, 0) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated or anonymous can view profiles (needed for leaderboards and request badges)
DROP POLICY IF EXISTS "Profiles read" ON public.profiles;
CREATE POLICY "Profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
CREATE POLICY "Profiles update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles insert own" ON public.profiles;
CREATE POLICY "Profiles insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Requests: Anyone can read all requests (needed for public feed)
DROP POLICY IF EXISTS "Requests read" ON public.requests;
CREATE POLICY "Requests read" ON public.requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Requests insert" ON public.requests;
CREATE POLICY "Requests insert" ON public.requests FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR requester_id IS NULL));

-- Requests update: Strictly enforced for Requester, Deliverer, or Student accepting an open request
DROP POLICY IF EXISTS "Requests update" ON public.requests;
CREATE POLICY "Requests update" ON public.requests FOR UPDATE 
USING (
  (status = 'Open' AND (auth.uid() IS NULL OR auth.uid() != requester_id))
  OR (auth.uid() IS NOT NULL AND (auth.uid() = requester_id OR auth.uid() = accepted_by_id))
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND (auth.uid() = requester_id OR auth.uid() = accepted_by_id))
  OR (status = 'Accepted' AND auth.uid() IS NOT NULL AND auth.uid() = accepted_by_id)
);

-- Messages: Anyone can read and insert chat messages
DROP POLICY IF EXISTS "Messages read" ON public.messages;
CREATE POLICY "Messages read" ON public.messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Messages insert" ON public.messages;
CREATE POLICY "Messages insert" ON public.messages FOR INSERT WITH CHECK (true);

-- Notifications: Users read and manage their notifications
DROP POLICY IF EXISTS "Notifications read" ON public.notifications;
CREATE POLICY "Notifications read" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR true);

DROP POLICY IF EXISTS "Notifications insert" ON public.notifications;
CREATE POLICY "Notifications insert" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications update" ON public.notifications;
CREATE POLICY "Notifications update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR true);

-- -----------------------------------------------------------------------------
-- 5. REALTIME SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 6. VERIFICATION QUERY
-- -----------------------------------------------------------------------------
SELECT 'Setup Successful! Tables created:' AS status, count(*) AS table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'requests', 'messages', 'notifications');
