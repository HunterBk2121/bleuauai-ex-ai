import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response("Messages are required", { status: 400 })
    }

    console.log("V1 Chat query received:", { messageCount: messages.length, sessionId })

    // Check if Google AI API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("Google AI API key not found")
      return new Response(
        JSON.stringify({
          error: "AI service not configured",
          message: "The AI service is not properly configured. Please check your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const systemPrompt = `You are an expert legal research assistant. Provide accurate, well-researched legal information.

IMPORTANT INSTRUCTIONS:
1. Provide clear and helpful legal information
2. Use professional but accessible language
3. Include relevant legal concepts and precedents when applicable
4. Always recommend consulting with a qualified attorney for specific legal advice
5. Format your responses with proper markdown for readability

Remember: You are helping users understand legal concepts for educational purposes.`

    console.log("Generating AI response...")

    const result = streamText({
      model: google("gemini-1.5-flash"),
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.1,
      maxTokens: 2000,
    })

    console.log("AI response generated successfully")

    return result.toDataStreamResponse({
      headers: {
        "X-Session-Id": sessionId || "",
        "X-Model": "gemini-1.5-flash",
      },
    })
  } catch (error) {
    console.error("V1 Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
