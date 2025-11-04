Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { reportType, startDate, endDate, region } = await req.json();

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token and get user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Verify user is health ministry
        const profileResponse = await fetch(
            `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${userId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const profiles = await profileResponse.json();
        if (!profiles || profiles.length === 0 || profiles[0].role !== 'health_ministry') {
            throw new Error('Unauthorized: Only health ministry can access analytics');
        }

        let analyticsData = {};

        // Generate different types of reports based on request
        switch (reportType) {
            case 'patient_demographics':
                // Anonymized patient demographics
                const patientsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/patients?select=gender,blood_type,city,state`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );
                const patients = await patientsResponse.json();
                
                analyticsData = {
                    total_patients: patients.length,
                    gender_distribution: patients.reduce((acc, p) => {
                        acc[p.gender] = (acc[p.gender] || 0) + 1;
                        return acc;
                    }, {}),
                    blood_type_distribution: patients.reduce((acc, p) => {
                        if (p.blood_type) acc[p.blood_type] = (acc[p.blood_type] || 0) + 1;
                        return acc;
                    }, {}),
                    regional_distribution: patients.reduce((acc, p) => {
                        if (p.state) acc[p.state] = (acc[p.state] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;

            case 'appointments_statistics':
                // Appointment statistics
                const appointmentsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/appointments?select=status,appointment_type,appointment_date`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );
                const appointments = await appointmentsResponse.json();
                
                analyticsData = {
                    total_appointments: appointments.length,
                    status_distribution: appointments.reduce((acc, a) => {
                        acc[a.status] = (acc[a.status] || 0) + 1;
                        return acc;
                    }, {}),
                    type_distribution: appointments.reduce((acc, a) => {
                        acc[a.appointment_type] = (acc[a.appointment_type] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;

            case 'prescription_analytics':
                // Prescription analytics
                const prescriptionsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/prescriptions?select=status,date_issued`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );
                const prescriptions = await prescriptionsResponse.json();
                
                analyticsData = {
                    total_prescriptions: prescriptions.length,
                    status_distribution: prescriptions.reduce((acc, p) => {
                        acc[p.status] = (acc[p.status] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;

            case 'hospital_capacity':
                // Hospital capacity analytics
                const hospitalsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/hospitals?select=name,city,state,total_beds,available_beds,emergency_services`,
                    {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    }
                );
                const hospitals = await hospitalsResponse.json();
                
                analyticsData = {
                    total_hospitals: hospitals.length,
                    total_beds: hospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0),
                    available_beds: hospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0),
                    emergency_services_count: hospitals.filter(h => h.emergency_services).length,
                    regional_distribution: hospitals.reduce((acc, h) => {
                        if (h.state) acc[h.state] = (acc[h.state] || 0) + 1;
                        return acc;
                    }, {})
                };
                break;

            default:
                throw new Error('Invalid report type');
        }

        // Create audit log
        await fetch(`${supabaseUrl}/rest/v1/audit_logs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                action: 'GENERATE_ANALYTICS',
                description: `Generated ${reportType} analytics report`,
                role: 'health_ministry',
                success: true
            })
        });

        return new Response(JSON.stringify({
            data: {
                report_type: reportType,
                generated_at: new Date().toISOString(),
                analytics: analyticsData
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics generation error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_GENERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
