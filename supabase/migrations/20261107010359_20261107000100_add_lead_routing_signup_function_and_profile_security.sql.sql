/*
# Add lead routing by slug, secure signup function, and column-level profile security

This migration builds on the profiles/invites tables from the previous migration to:
1. Route leads to salespeople by URL slug (not auth user id) so leads can be
   captured even before a salesperson has accepted their invite.
2. Create a SECURITY DEFINER function that handles both admin bootstrap and
   invite acceptance — the only way new accounts are created.
3. Lock down the profiles table so staff can edit their own info but cannot
   change their role or email.

## 1. Modified Tables

### leads
- Added `rep_slug` (text, nullable) — the URL slug of the salesperson whose
  landing page the customer submitted from (e.g. "richard-chiang"). This is the
  primary routing key for leads. Existing lead backfilled to "richard-chiang".

## 2. New Functions

### complete_signup(p_full_name, p_title, p_phone, p_photo_url,
###                 p_dealership_name, p_dealership_address, p_invite_token)
- SECURITY DEFINER — runs as the migration owner (postgres), bypassing RLS.
- Called by the frontend AFTER supabase.auth.signUp() succeeds.
- If p_invite_token is NULL and no admin profile exists: creates an admin
  profile (bootstrap flow).
- If p_invite_token is provided: validates the token, creates a profile with
  the invite's role, marks the invite as accepted.
- Generates a unique URL slug from the full name.
- Returns the new profile row.
- REVOKE EXECUTE from PUBLIC/anon so only authenticated users can call it.

### validate_invite(p_token)
- SECURITY DEFINER — lets an invitee look up their invite details by token
  without needing admin-level RLS access to the invites table.
- Returns email, role, expires_at, accepted_at for the matching invite.

## 3. Security Changes

### profiles
- REVOKE table-level UPDATE from authenticated.
- GRANT column-level UPDATE on (full_name, title, slug, photo_url, phone,
  dealership_name, dealership_address, profile_setup_complete) to authenticated.
- role, email, and id are NOT updatable by users — only the complete_signup
  function (SECURITY DEFINER) can set them.

### leads
- All policies rewritten to use rep_slug for ownership checks instead of user_id:
  - anon INSERT: allowed if rep_slug is not null.
  - authenticated SELECT/UPDATE/DELETE: a salesperson sees leads where
    rep_slug matches their profile slug; admin sees all.

## 4. Important Notes
1. The frontend flow is: supabase.auth.signUp(email, password) →
   supabase.rpc('complete_signup', {...}) → redirect to profile setup.
2. validate_invite is called before showing the invite acceptance form so the
   invitee sees their email and role. The authoritative validation happens in
   complete_signup.
3. The existing lead in the database is backfilled with rep_slug = 'richard-chiang'
   so it appears in Richard's dashboard once he accepts his invite.
*/

-- ============================================================
-- leads: add rep_slug and backfill existing data
-- ============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rep_slug text;
CREATE INDEX IF NOT EXISTS idx_leads_rep_slug ON leads (rep_slug);

-- Backfill the existing lead to Richard's slug
UPDATE leads SET rep_slug = 'richard-chiang' WHERE rep_slug IS NULL;

-- Replace all lead policies to use rep_slug
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "select_own_or_all_leads" ON leads;
DROP POLICY IF EXISTS "insert_own_leads" ON leads;
DROP POLICY IF EXISTS "update_own_or_all_leads" ON leads;
DROP POLICY IF EXISTS "delete_own_or_all_leads" ON leads;

-- anon INSERT: customers submit leads. rep_slug must be present.
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (rep_slug IS NOT NULL);

-- authenticated SELECT: salesperson sees leads matching their slug; admin sees all.
CREATE POLICY "select_own_or_all_leads" ON leads FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.slug = leads.rep_slug)
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- authenticated INSERT: staff can insert for their own slug, admin for any.
CREATE POLICY "insert_own_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.slug = leads.rep_slug)
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- authenticated UPDATE: owner or admin.
CREATE POLICY "update_own_or_all_leads" ON leads FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.slug = leads.rep_slug)
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.slug = leads.rep_slug)
  );

-- authenticated DELETE: owner or admin.
CREATE POLICY "delete_own_or_all_leads" ON leads FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.slug = leads.rep_slug)
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- profiles: column-level UPDATE security
-- ============================================================
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, title, slug, photo_url, phone, dealership_name, dealership_address, profile_setup_complete) ON profiles TO authenticated;

-- ============================================================
-- Function: validate_invite
-- Lets an invitee look up their invite by token (no admin needed)
-- ============================================================
CREATE OR REPLACE FUNCTION validate_invite(p_token uuid)
RETURNS TABLE (email text, role text, expires_at timestamptz, accepted_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT i.email, i.role, i.expires_at, i.accepted_at
  FROM invites i
  WHERE i.token = p_token;
END;
$$;

REVOKE EXECUTE ON FUNCTION validate_invite(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION validate_invite(uuid) TO anon, authenticated;

-- ============================================================
-- Function: complete_signup
-- Creates a profile for the authenticated user. Handles bootstrap + invite.
-- ============================================================
CREATE OR REPLACE FUNCTION complete_signup(
  p_full_name text,
  p_title text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_dealership_name text DEFAULT NULL,
  p_dealership_address text DEFAULT NULL,
  p_invite_token uuid DEFAULT NULL
)
RETURNS profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile profiles%ROWTYPE;
  v_role text := 'sales';
  v_slug text;
  v_base_slug text;
  v_count int;
  v_invite RECORD;
  v_user_email text;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- If profile already exists for this user, return it
  SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
  IF FOUND THEN
    RETURN v_profile;
  END IF;

  -- Get the user's email from auth.users
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Auth user not found';
  END IF;

  -- Determine role
  IF p_invite_token IS NULL THEN
    -- Bootstrap: only allow if no admin exists yet
    PERFORM 1 FROM profiles WHERE role = 'admin' LIMIT 1;
    IF NOT FOUND THEN
      v_role := 'admin';
    ELSE
      RAISE EXCEPTION 'Public signup is not available. An invitation is required.';
    END IF;
  ELSE
    -- Validate invite token
    SELECT * INTO v_invite FROM invites
    WHERE token = p_invite_token
      AND accepted_at IS NULL
      AND expires_at > now()
    LIMIT 1;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired invitation token.';
    END IF;
    v_role := v_invite.role;
    -- Verify the email matches the invite
    IF v_invite.email IS NOT NULL AND v_invite.email <> v_user_email THEN
      RAISE EXCEPTION 'The email address does not match the invitation.';
    END IF;
  END IF;

  -- Generate unique slug from full name
  v_base_slug := lower(regexp_replace(p_full_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_base_slug := trim(both '-' from v_base_slug);
  IF v_base_slug = '' THEN
    v_base_slug := 'rep-' || substring(v_user_id::text, 1, 8);
  END IF;

  v_slug := v_base_slug;
  v_count := 1;
  LOOP
    PERFORM 1 FROM profiles WHERE slug = v_slug LIMIT 1;
    EXIT WHEN NOT FOUND;
    v_count := v_count + 1;
    v_slug := v_base_slug || '-' || v_count::text;
  END LOOP;

  -- Create the profile
  INSERT INTO profiles (id, email, full_name, title, slug, photo_url, phone, dealership_name, dealership_address, role, profile_setup_complete)
  VALUES (v_user_id, v_user_email, p_full_name, p_title, v_slug, p_photo_url, p_phone, p_dealership_name, p_dealership_address, v_role, false)
  RETURNING * INTO v_profile;

  -- Mark invite as accepted
  IF p_invite_token IS NOT NULL THEN
    UPDATE invites SET accepted_at = now() WHERE id = v_invite.id;
  END IF;

  RETURN v_profile;
END;
$$;

REVOKE EXECUTE ON FUNCTION complete_signup(text, text, text, text, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION complete_signup(text, text, text, text, text, text, uuid) TO authenticated;
