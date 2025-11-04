CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor',
    'patient',
    'lab_attendant',
    'pharmacy',
    'ambulance',
    'hospital_admin',
    'health_ministry')),
    full_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    hospital_id UUID,
    license_number VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);