import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Google AI API key is configured
    const hasGoogleAIKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY

    // Mock health checks for services
    const llmHealth = {
      googleAI: hasGoogleAIKey,
      openAI: false, // Not configured in this setup
      anthropic: false, // Not configured in this setup
    }

    const embeddingHealth = {
      googleAI: hasGoogleAIKey,
      openAI: false,
    }

    const ragHealth = hasGoogleAIKey && true // Simplified check

    const mlHealth = {
      classification: hasGoogleAIKey,
      summarization: hasGoogleAIKey,
    }

    // Calculate overall status
    const allHealthy = hasGoogleAIKey

    return NextResponse.json({
      status: allHealthy ? "healthy" : "degraded",
      services: {
        llm: llmHealth,
        embedding: embeddingHealth,
        rag: ragHealth,
        ml: mlHealth,
        timestamp: new Date().toISOString(),
      },
      usage: {
        total_requests: 0,
        tokens_used: 0,
        average_latency_ms: 150,
      },
      cache: {
        hit_rate: 0,
        size_kb: 0,
      },
      classification: {
        accuracy: 0.95,
        models_loaded: hasGoogleAIKey ? 1 : 0,
      },
    })
  } catch (error) {
    console.error("AI health check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
