import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  // In a real implementation, you might check session status in a database
  return NextResponse.json({
    status: "active",
    sessionId,
    timestamp: new Date().toISOString(),
    mode: "polling",
  })
}
