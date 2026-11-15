/*
# Add multi-brand support for cross-dealership expansion

## Summary
Expands the app beyond GM-only brands so salespeople at any dealership
can use the platform. Adds a `brands` column to profiles so each rep
specifies which brands they sell, and a `preferred_brand` column to
leads (without a CHECK constraint) so customers can express interest
in any brand. The existing `gm_brand` column is kept untouched for
backward compatibility with existing lead data.

## 1. Modified Tables

### profiles
- Added `brands` (text, nullable) — comma-separated list of brand names
  the rep specializes in (e.g. 'Toyota,Lexus' or 'Chevrolet,Buick,GMC,Cadillac').
  NULL means the rep hasn't selected brands yet; the frontend falls back
  to the default GM brands for display.

### leads
- Added `preferred_brand` (text, nullable) — the customer's preferred
  brand for buying leads. No CHECK constraint so any brand can be stored.
  The existing `gm_brand` column remains for backward compatibility;
  new leads will use `preferred_brand` instead.

## 2. Security
- profiles: the existing `self_update_profile` UPDATE policy
  (auth.uid() = id) covers the new `brands` column. The existing
  column-level GRANT UPDATE needs to include `brands`.
- leads: the existing anon INSERT policy (rep_slug IS NOT NULL) and
  authenticated SELECT/UPDATE/DELETE policies already cover the table
  at row level. The new column inherits these policies automatically.
  anon needs INSERT on the new column — the existing table-level
  GRANT INSERT ON leads TO anon covers it.
- The existing column-level UPDATE grant on profiles is revoked and
  re-issued to include `brands` alongside the existing updatable columns.

## 3. Important Notes
1. No existing data is modified or lost. The `gm_brand` column stays
   in place with its CHECK constraint. New leads will write to
   `preferred_brand` instead.
2. The `brands` column on profiles uses a simple comma-separated format
   rather than an array to keep the TypeScript types simple and avoid
   needing array parsing on the frontend.
3. No new tables, indexes, or policies are created — only additive
   column changes and a grant update.
*/

-- Add brands column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brands text;

-- Add preferred_brand column to leads (no CHECK constraint — any brand allowed)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_brand text;

-- Update the column-level UPDATE grant on profiles to include brands
-- First revoke the old grant, then re-grant with the new column included
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, title, slug, photo_url, phone, dealership_name, dealership_address, profile_setup_complete, theme_palette, brands) ON profiles TO authenticated;
