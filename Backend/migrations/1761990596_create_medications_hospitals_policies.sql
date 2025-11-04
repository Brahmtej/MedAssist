-- Migration: create_medications_hospitals_policies
-- Created at: 1761990596

-- Medications RLS Policies
-- Everyone can view active medications
CREATE POLICY "Public view medications" ON medications
  FOR SELECT
  USING (status = 'active' OR auth.role() IN ('anon', 'service_role'));

-- Only service role can insert/update medications
CREATE POLICY "Service role manage medications" ON medications
  FOR ALL
  USING (auth.role() = 'service_role');

-- Hospitals RLS Policies
-- Everyone can view hospitals
CREATE POLICY "Public view hospitals" ON hospitals
  FOR SELECT
  USING (auth.role() IN ('anon', 'service_role') OR true);

-- Hospital admins can update their own hospital
CREATE POLICY "Hospital admin update own hospital" ON hospitals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
      AND hospital_id = hospitals.id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Allow insert via edge function
CREATE POLICY "Allow hospital insert" ON hospitals
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));;