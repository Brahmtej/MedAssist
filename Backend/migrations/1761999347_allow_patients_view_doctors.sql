-- Migration: allow_patients_view_doctors
-- Created at: 1761999347

-- Allow all authenticated users to view doctor profiles for appointment booking
CREATE POLICY "Allow viewing doctor profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (role = 'doctor' AND auth.role() = 'authenticated');;