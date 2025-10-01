import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patientId, phone, campaignId, studyId } = body;

    // Get Eleven Labs API key from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: 'Eleven Labs API key not configured' },
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

    // Call Eleven Labs API to initiate the call
    // Using Eleven Labs Conversational AI API
    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Agent configuration
        agent_id: process.env.ELEVENLABS_AGENT_ID || 'default-agent',

        // Call configuration
        phone_number: phone,

        // Metadata for tracking
        metadata: {
          patient_id: patientId,
          campaign_id: campaignId,
          study_id: studyId,
        },

        // Initial context for the AI agent
        system_prompt: `You are a clinical research coordinator calling to screen a patient for the ${studyId} clinical trial.
Be professional, empathetic, and clear. Verify patient information, explain the study, and assess initial eligibility.`,
      }),
    });

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.json();
      console.error('Eleven Labs API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initiate call with Eleven Labs', details: errorData },
        { status: elevenLabsResponse.status }
      );
    }

    const callData = await elevenLabsResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      callId: callData.conversation_id || callData.id,
      data: callData,
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
