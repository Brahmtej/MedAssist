Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { fileData, fileName, patientId, testName, testType, resultSummary, hospitalId, labName } = await req.json();

        if (!fileData || !fileName || !patientId || !testName) {
            throw new Error('File data, filename, patient ID, and test name are required');
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

        // Verify user is a lab attendant
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
        if (!profiles || profiles.length === 0 || profiles[0].role !== 'lab_attendant') {
            throw new Error('Unauthorized: Only lab attendants can upload lab reports');
        }

        // Extract base64 data from data URL
        const base64Data = fileData.split(',')[1];
        const mimeType = fileData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generate storage path with timestamp
        const timestamp = Date.now();
        const storagePath = `${timestamp}-${fileName}`;

        // Upload to Supabase Storage (lab-reports bucket)
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/lab-reports/${storagePath}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': mimeType,
                'x-upsert': 'true'
            },
            body: binaryData
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Upload failed: ${errorText}`);
        }

        // Get public URL
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/lab-reports/${storagePath}`;

        // Save lab report to database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/lab_reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                patient_id: patientId,
                test_name: testName,
                test_type: testType || 'General',
                test_date: new Date().toISOString(),
                report_url: publicUrl,
                result_summary: resultSummary || '',
                uploaded_by_user_id: userId,
                hospital_id: hospitalId || null,
                lab_name: labName || 'Hospital Laboratory',
                status: 'completed'
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const labReportData = await insertResponse.json();

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
                action: 'UPLOAD_LAB_REPORT',
                table_name: 'lab_reports',
                record_id: labReportData[0].id,
                description: `Lab report uploaded for test: ${testName}`,
                role: 'lab_attendant',
                success: true
            })
        });

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                labReport: labReportData[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Lab report upload error:', error);

        const errorResponse = {
            error: {
                code: 'LAB_REPORT_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
