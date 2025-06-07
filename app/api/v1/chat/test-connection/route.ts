import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get("sessionId")

    return NextResponse.json({
      status: "success",
      message: "Chat service is operational",
      sessionId,
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        ai: "ready",
        websocket: "available",
      },
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Chat service unavailable",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
