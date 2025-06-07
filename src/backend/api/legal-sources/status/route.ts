import { type NextRequest, NextResponse } from "next/server"
import { getLegalSourcesStatus } from "@/src/backend/services/legal-sources"

export async function GET(request: NextRequest) {
  try {
    const status = await getLegalSourcesStatus()

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error fetching legal sources status:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch legal sources status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
