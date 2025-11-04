-- Migration: create_prescriptions_policies
-- Created at: 1761990564

-- Prescriptions RLS Policies

-- Patients can view their own prescriptions
CREATE POLICY "Patients view own prescriptions" ON prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = prescriptions.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Doctors can create and view prescriptions
CREATE POLICY "Doctors view prescriptions" ON prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Doctors create prescriptions" ON prescriptions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
      AND user_id = prescriptions.doctor_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Doctors update own prescriptions" ON prescriptions
  FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR auth.role() IN ('anon', 'service_role')
  );

-- Pharmacy can view active prescriptions
CREATE POLICY "Pharmacy view prescriptions" ON prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'pharmacy'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Pharmacy can update prescription status (when dispensed)
CREATE POLICY "Pharmacy update status" ON prescriptions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'pharmacy'
    )
    OR auth.role() IN ('anon', 'service_role')
  );;