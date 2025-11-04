CREATE TABLE lab_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100),
    test_date TIMESTAMP NOT NULL,
    report_url TEXT,
    report_data JSONB,
    result_summary TEXT,
    uploaded_by_user_id UUID NOT NULL,
    hospital_id UUID,
    lab_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);