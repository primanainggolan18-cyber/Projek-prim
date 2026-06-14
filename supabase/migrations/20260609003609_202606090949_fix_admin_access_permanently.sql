-- Fix admin access permanently
-- 1. Remove the problematic trigger that may override roles on auth events
-- 2. Ensure admin user exists with correct role
-- 3. Clean up conflicting policies

-- Drop the trigger on auth.users to prevent it from interfering
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger with better logic: only runs on INSERT, not UPDATE
-- and respects existing roles
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
    CASE
      WHEN NEW.email = 'admin@kotamatsum3.go.id' THEN 'admin'
      ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'warga')
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Only attach AFTER INSERT trigger, not AFTER UPDATE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Ensure admin profile has admin role (direct update)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@kotamatsum3.go.id';

-- Also update via auth user metadata for consistency
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('role', 'admin')
WHERE email = 'admin@kotamatsum3.go.id';

-- Drop the overly permissive select_profiles policy
DROP POLICY IF EXISTS "select_profiles" ON public.profiles;

-- Ensure proper SELECT policy exists
DROP POLICY IF EXISTS "select_own_profile" ON public.profiles;
CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Keep the admin view-all policy
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
