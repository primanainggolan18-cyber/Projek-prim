/*
# Fix admin role assignment on signup trigger

The previous trigger defaulted all new users to 'warga'.
This updates the trigger to respect the 'role' field in raw_user_meta_data,
and also ensures admin@kotamatsum3.go.id always has role 'admin'.
*/

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

-- Ensure the existing admin account has correct role
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@kotamatsum3.go.id' AND role != 'admin';
