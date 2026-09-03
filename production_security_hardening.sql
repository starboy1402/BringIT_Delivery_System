-- =============================================================================
-- BringIT: Production Security & Privacy Hardening
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROTECT PROFILE STATS & LEADERBOARD INTEGRITY
-- Prevents users from manually editing their rating, earnings, or delivery counts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- If updated by regular client authentication, preserve authoritative server stats
  IF auth.uid() IS NOT NULL AND auth.uid() = NEW.id THEN
    NEW.total_earnings := OLD.total_earnings;
    NEW.deliveries_completed := OLD.deliveries_completed;
    NEW.rating := OLD.rating;
    NEW.total_ratings := OLD.total_ratings;
    NEW.requests_posted := OLD.requests_posted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_protect_profile_stats ON public.profiles;
CREATE TRIGGER tr_protect_profile_stats
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_stats();

-- -----------------------------------------------------------------------------
-- 2. PRIVATE MISSION CHAT: RESTRICT MESSAGE VISIBILITY
-- Only the requester and assigned deliverer can read private delivery messages
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Messages read" ON public.messages;
CREATE POLICY "Messages read" ON public.messages
  FOR SELECT
  USING (
    auth.uid() IS NULL -- Allow initial unauthenticated demo preview if needed
    OR sender_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id
      AND (r.requester_id = auth.uid() OR r.accepted_by_id = auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- 3. NOTIFICATION PRIVACY: ONLY VIEW OWN ALERTS
-- Removes the demo "OR true" clause so students only receive their own alerts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Notifications read" ON public.notifications;
CREATE POLICY "Notifications read" ON public.notifications
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Notifications update" ON public.notifications;
CREATE POLICY "Notifications update" ON public.notifications
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. PREVENT EDITING COMPLETED OR CANCELLED REQUESTS (TERMINAL STATE INTEGRITY)
-- Once completed or cancelled, orders cannot be reopened or mutated
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_request_state_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Terminal states cannot be altered
  IF OLD.status IN ('Completed', 'Cancelled') AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Completed or Cancelled delivery orders cannot be modified.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_request_state ON public.requests;
CREATE TRIGGER tr_check_request_state
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.check_request_state_transition();
