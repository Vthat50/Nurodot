import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { patientId, phone, campaignId, studyId } = req.body;

    console.log('Initiating call request:', { patientId, phone, campaignId, studyId });

    // Get Eleven Labs API key from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;
    const phoneNumberId = process.env.ELEVENLABS_PHONE_NUMBER_ID;

    console.log('Environment check:', {
      hasApiKey: !!elevenLabsApiKey,
      hasAgentId: !!elevenLabsAgentId,
      hasPhoneId: !!phoneNumberId,
      apiKeyPrefix: elevenLabsApiKey?.substring(0, 10)
    });

    if (!elevenLabsApiKey) {
      return res.status(500).json({ error: 'Eleven Labs API key not configured' });
    }

    if (!elevenLabsAgentId) {
      return res.status(500).json({ error: 'Eleven Labs Agent ID not configured' });
    }

    if (!phoneNumberId) {
      return res.status(500).json({ error: 'Eleven Labs Phone Number ID not configured' });
    }

    if (!patientId || !phone) {
      return res.status(400).json({ error: 'Missing required fields: patientId and phone are required' });
    }

    // Call Eleven Labs API to initiate the call
    const elevenLabsPayload = {
      agent_id: elevenLabsAgentId,
      customer_phone_number: phone,
    };

    console.log('Calling Eleven Labs API with payload:', elevenLabsPayload);

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

      return res.status(elevenLabsResponse.status).json({
        error: 'Failed to initiate call with Eleven Labs',
        details: errorData,
      });
    }

    const callData = await elevenLabsResponse.json();
    console.log('Eleven Labs call initiated successfully:', callData);

    return res.status(200).json({
      success: true,
      message: 'Call initiated successfully',
      callId: callData.conversation_id || callData.id,
      data: callData,
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
