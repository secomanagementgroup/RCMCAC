/*
# Add theme palette column to profiles

## Summary
Adds a `theme_palette` column to the `profiles` table so each salesperson
can choose a color scheme for their customer-facing landing page.
The value is a short text key (e.g. 'gold', 'crimson', 'emerald') that
the frontend maps to a full color set. NULL means "use the default
gold-and-charcoal palette" (Richard's page), so existing profiles are
unaffected.

## 1. Modified Tables
### profiles
- Added `theme_palette` (text, nullable) — stores the palette key chosen
  by the salesperson in the Edit Profile screen. No CHECK constraint so
  new palettes can be added on the frontend without a migration.

## 2. Security
- No new tables or policies. The existing `self_update_profile` UPDATE
  policy (auth.uid() = id) already covers this column, and
  `public_select_profiles` SELECT policy already allows the anon role
  to read profiles for public landing pages.
- The existing `GRANT UPDATE ON profiles TO authenticated` covers the
  new column automatically.
- The existing `GRANT SELECT ON profiles TO anon, authenticated` covers
  reading the new column.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_palette text;
