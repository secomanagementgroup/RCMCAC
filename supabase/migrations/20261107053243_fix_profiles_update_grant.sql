/*
# Fix missing UPDATE grant on profiles table

## Problem
The original migration included `GRANT UPDATE ON profiles TO authenticated;`
but the grant was not actually applied to the live database. As a result,
authenticated users (sales reps) cannot update their own profile row.
This blocks the entire profile setup flow: the photo uploads to storage
successfully, but saving the profile (photo_url, profile_setup_complete, etc.)
fails silently, leaving the user stuck on the profile setup screen.

## Fix
- Re-grant UPDATE on public.profiles to authenticated.
- This is the same grant from the original migration; it is idempotent.
- RLS still enforces that a user can only update their own row (auth.uid() = id).
*/

GRANT UPDATE ON profiles TO authenticated;