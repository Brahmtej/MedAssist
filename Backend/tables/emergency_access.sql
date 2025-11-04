CREATE TABLE emergency_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambulance_staff_id UUID NOT NULL,
    patient_id UUID NOT NULL,
    access_time TIMESTAMP DEFAULT NOW(),
    purpose TEXT NOT NULL,
    critical_data_accessed JSONB,
    location_coordinates VARCHAR(100),
    emergency_type VARCHAR(100),
    notes TEXT,
    authorized_by UUID
);