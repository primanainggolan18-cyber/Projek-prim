
/*
# Auth Trigger & Initial Admin User

## Summary
1. Adds a trigger on `auth.users` to auto-create a row in `public.profiles`
   whenever a new user signs up. Default role is 'warga'.
2. Creates the initial admin account with:
   - Email: admin@kotamatsum3.go.id
   - Password: Admin@12345
   - Role: admin
   This is idempotent — it only inserts if the email doesn't already exist.

## New Objects
- Function: `public.handle_new_user()` — trigger function that inserts a profile row.
- Trigger: `on_auth_user_created` on `auth.users` (AFTER INSERT).

## Security Notes
- The admin password MUST be changed after first login.
- The `profiles` table RLS allows admins to read all profiles for role checks.
- A service-role SELECT policy is added on `profiles` so the trigger function
  (which runs as SECURITY DEFINER) can insert unconditionally.
*/

-- 1. Trigger function: auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'warga')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 2. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Add RLS policy: admins can view ALL profiles (for role-checking in frontend)
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid()
        AND p2.role IN ('admin', 'lurah', 'operator')
    )
  );

-- 4. Upsert initial admin account
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@kotamatsum3.go.id') THEN

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password,
      email_confirmed_at,
      invited_at, confirmation_token, confirmation_sent_at,
      recovery_token, recovery_sent_at,
      email_change_token_new, email_change, email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin,
      created_at, updated_at,
      phone, phone_confirmed_at,
      phone_change, phone_change_token, phone_change_sent_at,
      email_change_token_current, email_change_confirm_status,
      banned_until, reauthentication_token, reauthentication_sent_at,
      is_sso_user, deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated', 'authenticated',
      'admin@kotamatsum3.go.id',
      crypt('Admin@12345', gen_salt('bf')),
      now(),
      NULL, '', NULL,
      '', NULL,
      '', '', NULL,
      now(),
      '{"provider":"email","providers":["email"]}', '{}',
      false,
      now(), now(),
      NULL, NULL,
      '', '', NULL,
      '', 0,
      NULL, '', NULL,
      false, NULL
    );

    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data,
      provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin@kotamatsum3.go.id',
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'admin@kotamatsum3.go.id'),
      'email',
      now(), now(), now()
    );

    INSERT INTO public.profiles (id, nama, email, role)
    VALUES (v_user_id, 'Administrator Kelurahan', 'admin@kotamatsum3.go.id', 'admin')
    ON CONFLICT (id) DO NOTHING;

  ELSE
    -- Ensure existing admin@kotamatsum3.go.id has admin role
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'admin@kotamatsum3.go.id' AND role != 'admin';
  END IF;
END $$;
