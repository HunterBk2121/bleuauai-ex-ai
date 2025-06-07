import { NextResponse } from "next/server"

export async function GET() {
  // Return immediately for fast response time
  return NextResponse.json({
    success: true,
    timestamp: Date.now(),
    message: "Fast response endpoint",
  })
}
