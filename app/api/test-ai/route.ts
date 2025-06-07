import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function GET() {
  try {
    console.log("Testing AI service...")

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({
        success: false,
        error: "Google AI API key not configured",
        message: "Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable",
      })
    }

    // Test AI generation
    const result = await generateText({
      model: google("gemini-1.5-flash"),
      messages: [
        {
          role: "user",
          content: "Say 'AI service is working correctly' if you can respond.",
        },
      ],
      maxTokens: 50,
    })

    console.log("AI test successful:", result.text)

    return Response.json({
      success: true,
      message: "AI service is working correctly",
      response: result.text,
      model: "gemini-1.5-flash",
    })
  } catch (error) {
    console.error("AI test failed:", error)
    return Response.json({
      success: false,
      error: "AI service test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
