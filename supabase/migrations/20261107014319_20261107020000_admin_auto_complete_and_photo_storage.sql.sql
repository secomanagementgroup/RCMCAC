/*
# Admin auto-complete profile setup + storage bucket for profile photos

## 1. Modified Functions

### complete_signup
- When creating an admin profile (bootstrap, no invite token), the profile is
  now automatically marked as profile_setup_complete = true. Admins don't have
  a customer-facing landing page, so they skip the profile setup screen entirely.
- Sales reps (invited via token) still get profile_setup_complete = false so
  they go through the profile setup flow.

## 2. Storage

### Bucket: profile-photos
- Public bucket (anyone can read, including unauthenticated visitors viewing
  a sales rep's landing page).
- Authenticated users can upload to their own folder (profile-id/).
- File size limit: 5MB. Allowed MIME types: images only.

### Storage Policies
- SELECT (read): public — anyone can view profile photos.
- INSERT (upload): authenticated users only, files must be in a folder named
  after their own auth.uid().
- UPDATE: authenticated, own folder only.
- DELETE: authenticated, own folder only.
*/

-- ============================================================
-- Update complete_signup to auto-complete admin profiles
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
  v_setup_complete boolean := false;
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
      v_setup_complete := true;
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

  -- Create the profile (admin auto-completes setup)
  INSERT INTO profiles (id, email, full_name, title, slug, photo_url, phone, dealership_name, dealership_address, role, profile_setup_complete)
  VALUES (v_user_id, v_user_email, p_full_name, p_title, v_slug, p_photo_url, p_phone, p_dealership_name, p_dealership_address, v_role, v_setup_complete)
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

-- ============================================================
-- Storage bucket: profile-photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read: anyone can view profile photos (landing pages are public)
DROP POLICY IF EXISTS "public_read_profile_photos" ON storage.objects;
CREATE POLICY "public_read_profile_photos" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'profile-photos');

-- Upload: authenticated users can upload to their own folder (auth.uid()/filename)
DROP POLICY IF EXISTS "auth_upload_own_profile_photo" ON storage.objects;
CREATE POLICY "auth_upload_own_profile_photo" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: own folder only
DROP POLICY IF EXISTS "auth_update_own_profile_photo" ON storage.objects;
CREATE POLICY "auth_update_own_profile_photo" ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: own folder only
DROP POLICY IF EXISTS "auth_delete_own_profile_photo" ON storage.objects;
CREATE POLICY "auth_delete_own_profile_photo" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
