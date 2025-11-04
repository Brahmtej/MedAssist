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
        const { message, context } = await req.json();

        if (!message) {
            throw new Error('Message is required');
        }

        const messageLower = message.toLowerCase();
        let response = '';

        // Simple rule-based chatbot responses
        // In production, this would use OpenAI API for more sophisticated responses
        
        if (messageLower.includes('login') || messageLower.includes('sign in')) {
            response = "To login to MedAssist:\n\n1. Click the 'Login' button in the top right corner\n2. Enter your registered email and password\n3. Select your role (Doctor, Patient, Lab Attendant, Pharmacy, Ambulance, Hospital Admin, or Health Ministry)\n4. Click 'Sign In'\n\nIf you forgot your password, use the 'Forgot Password' link.";
        } else if (messageLower.includes('register') || messageLower.includes('sign up') || messageLower.includes('create account')) {
            response = "To register for MedAssist:\n\n1. Click the 'Sign Up' button\n2. Fill in your details (name, email, phone number)\n3. Choose your role in the healthcare system\n4. For healthcare professionals, provide your license number\n5. Submit the form\n6. Verify your email address\n\nYour account will be activated after verification.";
        } else if (messageLower.includes('appointment') || messageLower.includes('book')) {
            response = "To book an appointment:\n\n1. Login to your patient account\n2. Go to 'Appointments' section\n3. Select a hospital and doctor\n4. Choose an available date and time\n5. Add your chief complaint\n6. Confirm the appointment\n\nYou'll receive a confirmation notification.";
        } else if (messageLower.includes('prescription')) {
            response = "About Prescriptions:\n\nPatients: View and download your prescriptions from the 'My Prescriptions' section.\n\nDoctors: Create prescriptions for patients after consultations. You can upload prescription images which will be processed with OCR.\n\nPharmacy: Access verified e-prescriptions to dispense medications.";
        } else if (messageLower.includes('lab report') || messageLower.includes('test result')) {
            response = "About Lab Reports:\n\nPatients: View and download your lab reports from 'My Lab Reports' section.\n\nDoctors: Access patient lab reports when needed for diagnosis.\n\nLab Attendants: Upload lab reports for patients after tests are completed.";
        } else if (messageLower.includes('emergency')) {
            response = "Emergency Access:\n\nAmbulance staff can access critical patient information during emergencies by entering the patient's Health ID. This includes:\n- Blood type\n- Allergies\n- Chronic conditions\n- Emergency contact information\n\nAll emergency access is logged for security and audit purposes.";
        } else if (messageLower.includes('role') || messageLower.includes('who can')) {
            response = "MedAssist User Roles:\n\n1. Patient: View health records, book appointments, access prescriptions and lab reports\n2. Doctor: View patient history, create prescriptions, manage appointments\n3. Lab Attendant: Upload lab reports for patients\n4. Pharmacy: Access and verify e-prescriptions\n5. Ambulance: Emergency access to critical patient data\n6. Hospital Admin: Manage hospital operations and staff\n7. Health Ministry: Access national healthcare analytics";
        } else if (messageLower.includes('help') || messageLower.includes('how') || messageLower.includes('what')) {
            response = "I can help you with:\n\n- Login and registration\n- Booking appointments\n- Understanding prescriptions\n- Lab reports\n- Emergency access\n- User roles and permissions\n\nWhat would you like to know more about?";
        } else {
            response = "Hello! I'm the MedAssist healthcare assistant. I can help you with:\n\n- Account login and registration\n- Booking appointments\n- Accessing prescriptions and lab reports\n- Understanding different user roles\n- Emergency access procedures\n\nHow can I assist you today?";
        }

        // In production, you would use OpenAI API like this:
        // const openaiKey = Deno.env.get('OPENAI_API_KEY');
        // const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${openaiKey}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         model: 'gpt-3.5-turbo',
        //         messages: [
        //             { role: 'system', content: 'You are a helpful healthcare assistant for MedAssist platform.' },
        //             { role: 'user', content: message }
        //         ]
        //     })
        // });

        return new Response(JSON.stringify({
            data: {
                message: response,
                timestamp: new Date().toISOString()
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chatbot error:', error);

        const errorResponse = {
            error: {
                code: 'CHATBOT_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
