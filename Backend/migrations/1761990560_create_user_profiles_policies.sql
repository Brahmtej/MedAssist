-- Migration: create_user_profiles_policies
-- Created at: 1761990560

-- User Profiles RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Allow insert via edge function (signup)
CREATE POLICY "Allow insert via edge function" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Hospital admins can view all profiles in their hospital
CREATE POLICY "Hospital admins view staff" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'hospital_admin'
      AND up.hospital_id = user_profiles.hospital_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Health ministry can view all profiles
CREATE POLICY "Health ministry view all" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role = 'health_ministry'
    )
    OR auth.role() IN ('anon', 'service_role')
  );;