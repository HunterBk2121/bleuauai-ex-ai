import { type NextRequest, NextResponse } from "next/server"
import { caseLawLibraryManager } from "@/lib/legal-sources/case-law-libraries"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "sources":
        const sources = await caseLawLibraryManager.getAvailableSources()
        return NextResponse.json({ sources })

      case "search":
        const query = searchParams.get("query") || ""
        const jurisdiction = searchParams.get("jurisdiction") || undefined
        const court = searchParams.get("court") || undefined
        const source = searchParams.get("source") || undefined
        const limit = Number.parseInt(searchParams.get("limit") || "20")

        const searchOptions = {
          query,
          jurisdiction,
          court,
          limit,
        }

        let results
        if (source) {
          const sourceResults = await caseLawLibraryManager.searchSpecificSource(source, searchOptions)
          results = {
            results: sourceResults,
            sources: { [source]: { count: sourceResults.length, errors: [] } },
          }
        } else {
          results = await caseLawLibraryManager.searchAllSources(searchOptions)
        }

        return NextResponse.json(results)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Case law libraries API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "save_results":
        const { saved, errors } = await caseLawLibraryManager.downloadAndSave(data.results)
        return NextResponse.json({ saved, errors })

      case "bulk_search":
        const { sources, options } = data
        const bulkResults = await Promise.all(
          sources.map(async (sourceId: string) => {
            try {
              const results = await caseLawLibraryManager.searchSpecificSource(sourceId, options)
              return { sourceId, results, success: true }
            } catch (error) {
              return {
                sourceId,
                results: [],
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
              }
            }
          }),
        )
        return NextResponse.json({ results: bulkResults })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Case law libraries POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
