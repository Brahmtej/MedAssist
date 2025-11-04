-- Migration: create_lab_reports_policies
-- Created at: 1761990594

-- Lab Reports RLS Policies

-- Patients can view their own lab reports
CREATE POLICY "Patients view own reports" ON lab_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = lab_reports.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Doctors can view all lab reports
CREATE POLICY "Doctors view reports" ON lab_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Lab attendants can create and view lab reports
CREATE POLICY "Lab attendants view reports" ON lab_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'lab_attendant'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Lab attendants create reports" ON lab_reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'lab_attendant'
      AND user_id = lab_reports.uploaded_by_user_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Lab attendants update reports" ON lab_reports
  FOR UPDATE
  USING (
    uploaded_by_user_id = auth.uid()
    OR auth.role() IN ('anon', 'service_role')
  );;