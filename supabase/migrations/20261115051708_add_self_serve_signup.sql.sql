/*
# Add self-serve sales signup

## Summary
Modifies the complete_signup function to allow a new salesperson to create
their own account without a per-person invite token. This enables a stable
signup URL (#join) that the admin can share once with any new rep, instead
of generating a unique expiring invite link per person.

## 1. Modified Functions
### complete_signup
- Added parameter `p_self_serve boolean DEFAULT false`.
- When p_self_serve is true AND p_invite_token is null AND an admin already
  exists: creates a profile with role 'sales' (instead of raising an error).
- When p_self_serve is false (default): behavior is unchanged — admin
  bootstrap or invite-based signup only.
- This keeps backward compatibility with the existing AcceptInvite flow
  while adding the self-serve path.

## 2. Security
- The function remains SECURITY DEFINER and still revokes EXECUTE from
  PUBLIC/anon. Only authenticated users can call it.
- Self-serve signups always get role 'sales' — they cannot become admin
  through this path. Admin role is only assigned during bootstrap (when
  no admin exists yet) or via an admin invite token.
- The existing column-level UPDATE grant on profiles does not include
  role, so even if a salesperson somehow tried to escalate, they cannot
  change their role through the Data API.

## 3. Important Notes
1. The frontend self-serve flow will be: supabase.auth.signUp(email,
   password) → supabase.rpc('complete_signup', { p_full_name, p_self_serve:
   true }) → redirect to profile setup.
2. The existing invite-based flow still works unchanged — admins can still
   send per-person invites if they want to pre-assign emails or roles.
3. No new tables or columns are added.
*/

CREATE OR REPLACE FUNCTION complete_signup(
  p_full_name text,
  p_title text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_dealership_name text DEFAULT NULL,
  p_dealership_address text DEFAULT NULL,
  p_invite_token uuid DEFAULT NULL,
  p_self_serve boolean DEFAULT false
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
  v_admin_exists boolean;
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
    -- Check if an admin already exists
    PERFORM 1 FROM profiles WHERE role = 'admin' LIMIT 1;
    v_admin_exists := FOUND;

    IF NOT v_admin_exists THEN
      -- Bootstrap: first user becomes admin
      v_role := 'admin';
    ELSIF p_self_serve THEN
      -- Self-serve signup: always sales role
      v_role := 'sales';
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

REVOKE EXECUTE ON FUNCTION complete_signup(text, text, text, text, text, text, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION complete_signup(text, text, text, text, text, text, uuid, boolean) TO authenticated;
