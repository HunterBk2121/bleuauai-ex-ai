import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Connection test successful",
    timestamp: new Date().toISOString(),
  })
}
