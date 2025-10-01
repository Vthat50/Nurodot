import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, phone, campaignId, studyId } = body;

    console.log('Initiating call request:', { patientId, phone, campaignId, studyId });

    // Get Eleven Labs API key from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;

    console.log('Environment check:', {
      hasApiKey: !!elevenLabsApiKey,
      hasAgentId: !!elevenLabsAgentId,
      apiKeyPrefix: elevenLabsApiKey?.substring(0, 10)
    });

    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'Eleven Labs API key not configured' },
        { status: 500 }
      );
    }

    if (!elevenLabsAgentId) {
      return NextResponse.json(
        { error: 'Eleven Labs Agent ID not configured' },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!patientId || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId and phone are required' },
        { status: 400 }
      );
    }

    // Get phone number ID from environment
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

    if (!phoneNumberId) {
      return NextResponse.json(
        { error: 'Eleven Labs Phone Number ID not configured' },
        { status: 500 }
      );
    }

    // Call Eleven Labs API to initiate the call
    // Using Eleven Labs Conversational AI Phone Call API
    const elevenLabsPayload = {
      agent_id: elevenLabsAgentId,
      customer_phone_number: phone,
    };

    console.log('Calling Eleven Labs API with payload:', elevenLabsPayload);
    console.log('Phone Number ID:', phoneNumberId);

    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/convai/phone/${phoneNumberId}/call`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elevenLabsPayload),
    });

    console.log('Eleven Labs response status:', elevenLabsResponse.status);

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error('Eleven Labs API error:', errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          error: 'Failed to initiate call with Eleven Labs',
          details: errorData,
          status: elevenLabsResponse.status
        },
        { status: elevenLabsResponse.status }
      );
    }

    const callData = await elevenLabsResponse.json();
    console.log('Eleven Labs call initiated successfully:', callData);

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      callId: callData.conversation_id || callData.id,
      data: callData,
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
