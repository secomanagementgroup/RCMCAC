/*
# Fix profiles UPDATE grant to include updated_at column

## Problem
The column-level UPDATE grant on profiles was re-issued during the
multi-brand migration to include `brands`, but `updated_at` was not
included in the allowed column list. When a column-level grant exists,
Postgres denies UPDATE on any column not explicitly listed. The
ProfileSetup form writes `updated_at` on every save, so the entire
UPDATE fails with "permission denied for table profiles" — blocking
reps from saving their profile (including brand selection).

## Fix
- Revoke the current column-level UPDATE grant on profiles.
- Re-issue GRANT UPDATE with `updated_at` added to the allowed columns:
  full_name, title, slug, photo_url, phone, dealership_name,
  dealership_address, profile_setup_complete, theme_palette, brands,
  updated_at.
- RLS still enforces that a user can only update their own row
  (auth.uid() = id). Role and email remain non-updatable (not in the
  grant list), preserving the security boundary.

## Notes
1. This is idempotent — safe to re-run.
2. No data is modified or lost.
3. No new tables, columns, or policies are created.
*/

REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, title, slug, photo_url, phone, dealership_name, dealership_address, profile_setup_complete, theme_palette, brands, updated_at) ON profiles TO authenticated;