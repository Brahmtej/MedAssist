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
        const { patientHealthId, purpose, emergencyType, locationCoordinates } = await req.json();

        if (!patientHealthId || !purpose || !emergencyType) {
            throw new Error('Patient health ID, purpose, and emergency type are required');
        }

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

        // Verify user is ambulance staff
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
        if (!profiles || profiles.length === 0 || profiles[0].role !== 'ambulance') {
            throw new Error('Unauthorized: Only ambulance staff can access emergency data');
        }

        // Find patient by health ID
        const patientResponse = await fetch(
            `${supabaseUrl}/rest/v1/patients?health_id=eq.${patientHealthId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        if (!patientResponse.ok) {
            throw new Error('Failed to fetch patient data');
        }

        const patients = await patientResponse.json();
        if (!patients || patients.length === 0) {
            throw new Error('Patient not found');
        }

        const patient = patients[0];

        // Get critical patient data
        const criticalData = {
            full_name: patient.full_name,
            blood_type: patient.blood_type,
            allergies: patient.allergies,
            chronic_conditions: patient.chronic_conditions,
            emergency_contact_name: patient.emergency_contact_name,
            emergency_contact_number: patient.emergency_contact_number
        };

        // Log emergency access
        const accessLogResponse = await fetch(`${supabaseUrl}/rest/v1/emergency_access`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                ambulance_staff_id: userId,
                patient_id: patient.id,
                purpose: purpose,
                emergency_type: emergencyType,
                critical_data_accessed: criticalData,
                location_coordinates: locationCoordinates || null
            })
        });

        if (!accessLogResponse.ok) {
            const errorText = await accessLogResponse.text();
            throw new Error(`Failed to log emergency access: ${errorText}`);
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
                action: 'EMERGENCY_ACCESS',
                table_name: 'patients',
                record_id: patient.id,
                description: `Emergency access by ambulance staff for ${emergencyType}`,
                role: 'ambulance',
                success: true
            })
        });

        return new Response(JSON.stringify({
            data: {
                patient: criticalData,
                access_granted: true
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Emergency access error:', error);

        const errorResponse = {
            error: {
                code: 'EMERGENCY_ACCESS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
