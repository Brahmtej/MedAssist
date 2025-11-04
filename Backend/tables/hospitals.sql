CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0,
    emergency_services BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);