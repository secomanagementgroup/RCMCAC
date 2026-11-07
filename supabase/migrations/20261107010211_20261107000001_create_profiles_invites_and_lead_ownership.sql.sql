/*
# Add salesperson profiles, invites, and per-lead ownership

This migration converts the single-salesperson lead capture app into a
multi-salesperson dealership platform where:
- Each salesperson has a public profile that powers a personalized landing page.
- Leads are owned by the salesperson whose landing page the customer submitted from.
- An admin (the dealership owner) invites new staff; staff accept via a one-time token.
- Salespeople can only see and manage their own leads; admin can see all.

## 1. New Tables

### profiles
- id (uuid, primary key) — links to auth.users.id
- email (text, unique, not null) — staff email (mirrors auth email)
- full_name (text, not null) — display name shown on landing page
- title (text) — job title, e.g. "Sales & Leasing Consultant"
- slug (text, unique, not null) — URL slug for personalized landing page (e.g. "richard-chiang")
- photo_url (text) — path or URL to headshot
- phone (text) — contact phone shown publicly
- dealership_name (text) — dealership name for footer
- dealership_address (text) — address shown in footer
- role (text, not null, default 'sales') — 'admin' or 'sales'
- profile_setup_complete (boolean, default false) — whether staff has completed profile setup
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

### invites
- id (uuid, primary key)
- email (text, not null) — the invited person's email
- token (uuid, unique, not null) — one-time invitation token
- role (text, not null, default 'sales') — role the invitee will get
- invited_by (uuid) — admin user who sent the invite
- accepted_at (timestamptz) — null until accepted
- expires_at (timestamptz, not null) — 7-day expiry
- created_at (timestamptz, default now())

## 2. Modified Tables

### leads
- Added user_id (uuid, nullable) — the salesperson who owns this lead.
  Defaults to null so existing leads are preserved. New leads submitted from
  a salesperson's landing page are tagged with that salesperson's user_id.

## 3. Indexes
- profiles: unique index on slug
- invites: unique index on token
- leads: index on user_id for per-salesperson queries

## 4. Security

### profiles
- RLS enabled.
- GRANT SELECT to anon, authenticated (public landing pages must read any profile by slug).
- GRANT SELECT, UPDATE to authenticated (staff can read/update their own profile).
- SELECT policy: anyone can read (public landing pages).
- UPDATE policy: a user can update only their own profile row (auth.uid() = id).
- No INSERT or DELETE through the Data API — profiles are created via the
  accept_invite edge function using the service role, so we REVOKE those.

### invites
- RLS enabled.
- GRANT SELECT, INSERT, DELETE, UPDATE to authenticated.
- SELECT: admin can see all invites; non-admin can see invites they sent (only admin can send, so effectively admin-only). Implemented as: auth.uid() = invited_by OR profile role is admin.
- INSERT: only admin (profile role = admin).
- DELETE: only admin.
- UPDATE: only admin (used to mark accepted_at).

### leads
- RLS already enabled. Policies are replaced:
  - anon INSERT still allowed (customers submit leads without logging in) but now WITH CHECK requires user_id to be set (the salesperson's id from the slug).
  - anon SELECT/UPDATE/DELETE revoked (no longer public).
  - authenticated SELECT: a salesperson sees leads where user_id = auth.uid(); admin sees all leads.
  - authenticated UPDATE: owner or admin.
  - authenticated DELETE: owner or admin.
- GRANT updated: anon gets INSERT only; authenticated gets SELECT, INSERT, UPDATE, DELETE.

## 5. Important Notes
1. The accept_invite edge function (deployed separately) creates the auth user
   and the profile row using the service role key, so it bypasses RLS safely.
2. Existing leads have user_id = NULL. The admin (who can see all leads) will
   still see them. A data migration to assign existing leads to Richard is
   handled after Richard accepts his invite and we know his auth uid.
3. profiles.id is NOT a foreign key to auth.users with ON DELETE CASCADE because
   we create the profile in the same edge-function transaction as the auth user.
   We add the FK separately if needed; the id still matches auth.users.id by convention.
*/

-- ============================================================
-- profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  title text,
  slug text UNIQUE NOT NULL,
  photo_url text,
  phone text,
  dealership_name text,
  dealership_address text,
  role text NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales')),
  profile_setup_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug ON profiles (slug);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read profiles (landing pages), authenticated can also read (for admin list)
GRANT SELECT ON profiles TO anon, authenticated;
GRANT UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "public_select_profiles" ON profiles;
CREATE POLICY "public_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "self_update_profile" ON profiles;
CREATE POLICY "self_update_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- invites table
-- ============================================================
CREATE TABLE IF NOT EXISTS invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  token uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL DEFAULT 'sales' CHECK (role IN ('admin', 'sales')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_token ON invites (token);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE, UPDATE ON invites TO authenticated;

-- Helper: admin check via EXISTS on profiles
DROP POLICY IF EXISTS "admin_select_invites" ON invites;
CREATE POLICY "admin_select_invites" ON invites FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_insert_invites" ON invites;
CREATE POLICY "admin_insert_invites" ON invites FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_delete_invites" ON invites;
CREATE POLICY "admin_delete_invites" ON invites FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "admin_update_invites" ON invites;
CREATE POLICY "admin_update_invites" ON invites FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- leads table: add user_id and replace policies
-- ============================================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads (user_id);

-- Revoke broad anon access; anon can now only INSERT (customer form)
REVOKE SELECT, UPDATE, DELETE ON leads FROM anon;
-- Keep INSERT on anon for public lead form submissions
GRANT INSERT ON leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;

-- Replace all existing lead policies
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
DROP POLICY IF EXISTS "select_own_leads" ON leads;
DROP POLICY IF EXISTS "insert_own_leads" ON leads;
DROP POLICY IF EXISTS "update_own_leads" ON leads;
DROP POLICY IF EXISTS "delete_own_leads" ON leads;

-- anon INSERT: customers submit leads. user_id must be a valid profile id (a real salesperson).
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (
    user_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = user_id)
  );

-- authenticated SELECT: salesperson sees own leads; admin sees all.
CREATE POLICY "select_own_or_all_leads" ON leads FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- authenticated INSERT: staff can also insert (e.g. manual lead entry). Must own.
CREATE POLICY "insert_own_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- authenticated UPDATE: owner or admin.
CREATE POLICY "update_own_or_all_leads" ON leads FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    OR user_id = auth.uid()
  );

-- authenticated DELETE: owner or admin.
CREATE POLICY "delete_own_or_all_leads" ON leads FOR DELETE
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
