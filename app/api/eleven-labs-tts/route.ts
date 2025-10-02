import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice_id, model_id } = await request.json()

    // Check if Eleven Labs API key is available
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      console.log("[Landing Demo] No API key found")
      return NextResponse.json({ error: "Eleven Labs API key not configured", fallback: true }, { status: 500 })
    }

    console.log("[Landing Demo] API key found, attempting TTS...")

    // Voice configuration - using voices that exist in your account
    const voiceIds = {
      female: "d3MFdIuCfbAIwiu7jC4a", // Custom voice for AI
      male: "29vD33N1CtxCmqQRPOHJ", // Drew - for Patient (verified working)
      fallback: "pNInz6obpgDQGcFmaJgB", // Adam - most universal
    }

    // Use the voice ID
    let finalVoiceId = voice_id || voiceIds.fallback

    if (voice_id === "ai_voice") {
      finalVoiceId = voiceIds.female // Custom voice for AI
    } else if (voice_id === "patient_voice") {
      finalVoiceId = voiceIds.male // Drew for Patient
    }

    console.log("[Landing Demo] Using voice ID:", finalVoiceId)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: model_id || "eleven_monolingual_v1", // Most basic model (same as nurodot.com)
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.log("[Landing Demo] Eleven Labs API error:", response.status, errorBody)

      if (response.status === 401) {
        console.log("[Landing Demo] Permission error - check API key permissions in Eleven Labs dashboard")
        return NextResponse.json(
          {
            error: "API key needs text_to_speech permission",
            fallback: true,
            details: "Please check your Eleven Labs API key permissions",
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to generate speech",
          fallback: true,
        },
        { status: response.status },
      )
    }

    const audioBuffer = await response.arrayBuffer()
    console.log("[Landing Demo] Successfully generated audio, size:", audioBuffer.byteLength)

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.log("[Landing Demo] Eleven Labs TTS error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate speech",
        fallback: true,
      },
      { status: 500 },
    )
  }
}
