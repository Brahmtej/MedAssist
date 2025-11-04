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
        const { imageData, fileName, patientId, doctorId, medicalRecordId, prescriptionText } = await req.json();

        if (!imageData || !fileName || !patientId || !doctorId) {
            throw new Error('Image data, filename, patient ID, and doctor ID are required');
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

        // Verify user is a doctor
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
        if (!profiles || profiles.length === 0 || profiles[0].role !== 'doctor') {
            throw new Error('Unauthorized: Only doctors can upload prescriptions');
        }

        // Extract base64 data from data URL
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];

        // Convert base64 to binary
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generate storage path with timestamp
        const timestamp = Date.now();
        const storagePath = `${timestamp}-${fileName}`;

        // Upload to Supabase Storage (prescriptions bucket)
        const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/prescriptions/${storagePath}`, {
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
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/prescriptions/${storagePath}`;

        // Use provided prescription text or generate note
        const finalPrescriptionText = prescriptionText || 'Prescription uploaded - Text entry required';
        const ocrText = 'OCR Note: For production use, integrate with Tesseract.js, Google Vision API, or Azure Computer Vision for automated text extraction from prescription images.';

        // Save prescription to database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/prescriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                patient_id: patientId,
                doctor_id: doctorId,
                medical_record_id: medicalRecordId || null,
                prescription_text: finalPrescriptionText,
                ocr_text: ocrText,
                image_url: publicUrl,
                status: 'active'
            })
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const prescriptionData = await insertResponse.json();

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
                action: 'UPLOAD_PRESCRIPTION',
                table_name: 'prescriptions',
                record_id: prescriptionData[0].id,
                description: 'Prescription uploaded with OCR processing',
                role: 'doctor',
                success: true
            })
        });

        return new Response(JSON.stringify({
            data: {
                publicUrl,
                ocrText,
                prescription: prescriptionData[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('OCR processing error:', error);

        const errorResponse = {
            error: {
                code: 'OCR_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
