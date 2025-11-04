-- Migration: create_audit_emergency_policies
-- Created at: 1761990595

-- Audit Logs RLS Policies
-- Only service role and health ministry can view audit logs
CREATE POLICY "Service role view audit logs" ON audit_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Health ministry view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'health_ministry'
    )
  );

CREATE POLICY "Allow audit log insert" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));

-- Emergency Access RLS Policies
-- Ambulance staff can create emergency access records
CREATE POLICY "Ambulance create emergency access" ON emergency_access
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'ambulance'
      AND user_id = emergency_access.ambulance_staff_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Ambulance staff can view their own emergency access records
CREATE POLICY "Ambulance view own access" ON emergency_access
  FOR SELECT
  USING (
    ambulance_staff_id = auth.uid()
    OR auth.role() IN ('anon', 'service_role')
  );

-- Hospital admin and health ministry can view all emergency access records
CREATE POLICY "Admin view emergency access" ON emergency_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('hospital_admin', 'health_ministry')
    )
    OR auth.role() IN ('anon', 'service_role')
  );;