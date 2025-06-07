import { type NextRequest, NextResponse } from "next/server"
import { searchMultipleSources } from "@/src/backend/services/legal-sources"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, sources, options = {} } = body

    if (!query || !sources || sources.length === 0) {
      return NextResponse.json({ error: "Query and sources are required" }, { status: 400 })
    }

    const results = await searchMultipleSources(query, sources, options)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error in multi-source search:", error)

    return NextResponse.json(
      {
        error: "Search failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
