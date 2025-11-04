import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://oawwgrubzeqxpxubjptl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hd3dncnViemVxeHB4dWJqcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NTk2MjMsImV4cCI6MjA3NzUzNTYyM30.MisjM2wo-L8EzYiBI8T39uR6VjAPrkcmakIfUBgPiog"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'doctor' | 'patient' | 'lab_attendant' | 'pharmacy' | 'ambulance' | 'hospital_admin' | 'health_ministry'

export interface UserProfile {
  id: string
  user_id: string
  email: string
  role: UserRole
  full_name: string
  contact_number?: string
  hospital_id?: string
  license_number?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id?: string
  health_id: string
  full_name: string
  date_of_birth: string
  gender?: string
  blood_type?: string
  contact_number?: string
  email?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  emergency_contact_name?: string
  emergency_contact_number?: string
  emergency_contact_relation?: string
  insurance_provider?: string
  insurance_policy_number?: string
  allergies?: string
  chronic_conditions?: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  hospital_id?: string
  visit_date: string
  chief_complaint?: string
  diagnosis?: string
  treatment_plan?: string
  notes?: string
  vital_signs?: any
  follow_up_date?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medical_record_id?: string
  prescription_text: string
  ocr_text?: string
  image_url?: string
  date_issued: string
  valid_until?: string
  status: 'active' | 'dispensed' | 'expired' | 'cancelled'
  pharmacy_dispensed_id?: string
  dispensed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LabReport {
  id: string
  patient_id: string
  test_name: string
  test_type?: string
  test_date: string
  report_url?: string
  report_data?: any
  result_summary?: string
  uploaded_by_user_id: string
  hospital_id?: string
  lab_name?: string
  status: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  hospital_id: string
  appointment_date: string
  appointment_time: string
  appointment_datetime: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  appointment_type: string
  chief_complaint?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  state: string
  postal_code?: string
  contact_number: string
  email?: string
  registration_number: string
  total_beds: number
  available_beds: number
  emergency_services: boolean
  created_at: string
  updated_at: string
}
