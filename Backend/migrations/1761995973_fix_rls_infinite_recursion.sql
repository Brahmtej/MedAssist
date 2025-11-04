-- Migration: fix_rls_infinite_recursion
-- Created at: 1761995973

-- Drop the policies causing infinite recursion
DROP POLICY IF EXISTS "Hospital admins view staff" ON user_profiles;
DROP POLICY IF EXISTS "Health ministry view all" ON user_profiles;

-- The basic "Users can view own profile" policy is sufficient for authentication to work
-- We can add back role-based policies later using a different approach that doesn't cause recursion
;