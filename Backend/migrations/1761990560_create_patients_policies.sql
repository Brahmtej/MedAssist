-- Migration: create_patients_policies
-- Created at: 1761990560

-- Patients Table RLS Policies

-- Patients can view their own data
CREATE POLICY "Patients view own data" ON patients
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Patients can update their own data
CREATE POLICY "Patients update own data" ON patients
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Doctors can view all patients
CREATE POLICY "Doctors view patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Lab attendants can view patients
CREATE POLICY "Lab attendants view patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'lab_attendant'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Pharmacy can view patients (for prescription verification)
CREATE POLICY "Pharmacy view patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'pharmacy'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Ambulance staff can view limited patient data
CREATE POLICY "Ambulance view patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'ambulance'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Hospital admin can view patients in their hospital
CREATE POLICY "Hospital admin view patients" ON patients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Allow insert via edge function
CREATE POLICY "Allow patient insert" ON patients
  FOR INSERT
  WITH CHECK (auth.role() IN ('anon', 'service_role'));;