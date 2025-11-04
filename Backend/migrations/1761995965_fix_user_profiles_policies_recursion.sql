-- Migration: fix_user_profiles_policies_recursion
-- Created at: 1761995965

-- Drop the problematic policies
DROP POLICY IF EXISTS "Hospital admins view staff" ON user_profiles;
DROP POLICY IF EXISTS "Health ministry view all" ON user_profiles;

-- Create a security definer function to check user role without triggering RLS
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Recreate policies without recursion
CREATE POLICY "Hospital admins view staff" ON user_profiles
  FOR SELECT
  USING (
    (auth.user_role() = 'hospital_admin' AND hospital_id = (
      SELECT hospital_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1
    ))
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Health ministry view all" ON user_profiles
  FOR SELECT
  USING (
    auth.user_role() = 'health_ministry'
    OR auth.role() IN ('anon', 'service_role')
  );
;