-- Migration: create_medical_records_policies
-- Created at: 1761990562

-- Medical Records RLS Policies

-- Patients can view their own medical records
CREATE POLICY "Patients view own records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = medical_records.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Doctors can view and create medical records
CREATE POLICY "Doctors view all records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Doctors create records" ON medical_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
      AND user_id = medical_records.doctor_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Doctors update own records" ON medical_records
  FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR auth.role() IN ('anon', 'service_role')
  );

-- Hospital admin can view records in their hospital
CREATE POLICY "Hospital admin view records" ON medical_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
      AND hospital_id = medical_records.hospital_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );;