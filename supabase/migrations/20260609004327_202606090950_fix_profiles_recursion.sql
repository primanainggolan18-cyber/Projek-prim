-- Fix infinite recursion in profiles RLS policy
-- The admins_view_all_profiles policy subqueries profiles itself causing recursion
-- Solution: use auth.users raw_user_meta_data instead

-- Drop the problematic policy
DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.profiles;

-- Create a non-recursive version using auth.users metadata
CREATE POLICY "admins_view_all_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id
    OR (
      SELECT (raw_user_meta_data->>'role')::text
      FROM auth.users
      WHERE id = auth.uid()
    ) IN ('admin', 'lurah', 'operator')
  );
