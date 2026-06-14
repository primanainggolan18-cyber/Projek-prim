-- Fix profiles RLS without recursion and without querying auth.users directly
-- Create a helper function that returns the current user's role

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;

-- Create a working version using the helper function
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR public.get_my_role() IN ('admin', 'lurah', 'operator')
  );
