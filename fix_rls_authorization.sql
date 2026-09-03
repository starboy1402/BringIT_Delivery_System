-- =============================================================================
-- BringIT: Fix Request Authorization & Role-Based Access Control (RLS)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =============================================================================

-- 1. Ensure RLS is active
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Public Read: Everyone can read the campus dispatch feed
DROP POLICY IF EXISTS "Requests read" ON public.requests;
CREATE POLICY "Requests read" ON public.requests
  FOR SELECT USING (true);

-- 3. Insert: Only authenticated users can create requests for themselves
DROP POLICY IF EXISTS "Requests insert" ON public.requests;
CREATE POLICY "Requests insert" ON public.requests
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND (requester_id = auth.uid() OR requester_id IS NULL)
  );

-- 4. Update: STRICT ROLE-BASED ACCESS CONTROL
--    - Reject any 3rd party bystander trying to modify/complete someone else's order!
--    - Allow:
--        A) A student accepting an Open request (auth.uid() != requester_id)
--        B) The assigned Deliverer (auth.uid() = accepted_by_id)
--        C) The Requester (auth.uid() = requester_id)
DROP POLICY IF EXISTS "Requests update" ON public.requests;
CREATE POLICY "Requests update" ON public.requests
  FOR UPDATE
  USING (
    -- User can update if:
    -- Case 1: Accepting an open request that isn't their own
    (status = 'Open' AND (auth.uid() IS NULL OR auth.uid() != requester_id))
    -- Case 2: User is the requester
    OR (auth.uid() IS NOT NULL AND auth.uid() = requester_id)
    -- Case 3: User is the assigned deliverer
    OR (auth.uid() IS NOT NULL AND auth.uid() = accepted_by_id)
  )
  WITH CHECK (
    -- Verify the resulting state:
    (auth.uid() IS NOT NULL AND (auth.uid() = requester_id OR auth.uid() = accepted_by_id))
    OR (status = 'Accepted' AND auth.uid() IS NOT NULL AND auth.uid() = accepted_by_id)
  );

-- 5. Delete / Cancel: Only requester can delete/cancel their own request
DROP POLICY IF EXISTS "Requests delete own" ON public.requests;
CREATE POLICY "Requests delete own" ON public.requests
  FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = requester_id);

-- 6. Messages: Only requester and assigned deliverer can chat on accepted requests
DROP POLICY IF EXISTS "Messages insert" ON public.messages;
CREATE POLICY "Messages insert" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      sender_id = auth.uid() AND
      EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_id
        AND (r.requester_id = auth.uid() OR r.accepted_by_id = auth.uid())
      )
    )
  );
