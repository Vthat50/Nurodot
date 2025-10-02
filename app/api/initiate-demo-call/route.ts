import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, age, gender, location, language } = body

    console.log('[Demo Call] Initiating call request:', { phone_number, age, gender, location, language })

    // Get Eleven Labs API credentials from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY
    const agentId = 'agent_8701k6jxhdnrey5r15q82zhqfc0s'
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID

    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Eleven Labs API key not configured' }, { status: 500 })
    }

    if (!phoneNumberId) {
      return NextResponse.json({ error: 'Eleven Labs Phone Number ID not configured' }, { status: 500 })
    }

    if (!phone_number) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Prepare metadata to pass to the agent
    const metadata = {
      age: age || 'not provided',
      gender: gender || 'not provided',
      location: location || 'not provided',
    }

    // Add language to metadata if provided
    if (language) {
      metadata.language = language
    }

    // Call Eleven Labs API to initiate the call
    const elevenLabsPayload = {
      agent_id: agentId,
      agent_phone_number_id: phoneNumberId,
      to_number: phone_number,
      metadata: metadata,
    }

    console.log('[Demo Call] Calling Eleven Labs API with payload:', elevenLabsPayload)

    const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/convai/twilio/outbound-call', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(elevenLabsPayload),
    })

    console.log('[Demo Call] Eleven Labs response status:', elevenLabsResponse.status)

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error('[Demo Call] Eleven Labs API error:', errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        errorData = { message: errorText }
      }

      return NextResponse.json(
        {
          error: 'Failed to initiate call with Eleven Labs',
          details: errorData,
        },
        { status: elevenLabsResponse.status }
      )
    }

    const callData = await elevenLabsResponse.json()
    console.log('[Demo Call] Call initiated successfully:', callData)

    return NextResponse.json({
      success: true,
      message: 'Call initiated successfully',
      callId: callData.conversation_id,
      data: callData,
    })

  } catch (error) {
    console.error('[Demo Call] Error initiating call:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
