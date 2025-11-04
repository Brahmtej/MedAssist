-- Migration: force_schema_reload
-- Created at: 1761995799

-- Force PostgREST schema reload
COMMENT ON TABLE user_profiles IS 'User profile information for all roles in the MedAssist platform';
COMMENT ON TABLE patients IS 'Patient demographic and health information';
;