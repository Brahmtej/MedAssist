-- Migration: create_appointments_policies
-- Created at: 1761990594

-- Appointments RLS Policies

-- Patients can view and create their own appointments
CREATE POLICY "Patients view own appointments" ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Patients create appointments" ON appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Patients update own appointments" ON appointments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = appointments.patient_id
      AND p.user_id = auth.uid()
    )
    OR auth.role() IN ('anon', 'service_role')
  );

-- Doctors can view and manage their appointments
CREATE POLICY "Doctors view appointments" ON appointments
  FOR SELECT
  USING (
    doctor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'doctor'
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Doctors update appointments" ON appointments
  FOR UPDATE
  USING (
    doctor_id = auth.uid()
    OR auth.role() IN ('anon', 'service_role')
  );

-- Hospital admin can view and manage all appointments in their hospital
CREATE POLICY "Hospital admin view appointments" ON appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
      AND hospital_id = appointments.hospital_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY "Hospital admin manage appointments" ON appointments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'hospital_admin'
      AND hospital_id = appointments.hospital_id
    )
    OR auth.role() IN ('anon', 'service_role')
  );;