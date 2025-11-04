CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(50),
    category VARCHAR(100),
    description TEXT,
    side_effects TEXT,
    contraindications TEXT,
    requires_prescription BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);