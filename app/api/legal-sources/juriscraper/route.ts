import { type NextRequest, NextResponse } from "next/server"
import { juriscraperIntegration } from "@/lib/legal-sources/juriscraper-integration"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "status":
        const status = await juriscraperIntegration.getScraperStatus()
        return NextResponse.json(status)

      case "courts":
        const courts = await juriscraperIntegration.getAvailableCourts()
        const jurisdiction = searchParams.get("jurisdiction")
        const level = searchParams.get("level")

        let filteredCourts = courts
        if (jurisdiction) {
          filteredCourts = filteredCourts.filter((c) => c.jurisdiction === jurisdiction)
        }
        if (level) {
          filteredCourts = filteredCourts.filter((c) => c.level === level)
        }

        return NextResponse.json({ courts: filteredCourts })

      case "scrape-opinions":
        const courtId = searchParams.get("court_id")
        if (!courtId) {
          return NextResponse.json({ error: "Court ID required" }, { status: 400 })
        }

        const opinionResults = await juriscraperIntegration.scrapeCourtOpinions(courtId)
        return NextResponse.json(opinionResults)

      case "scrape-oral-arguments":
        const oaCourtId = searchParams.get("court_id")
        if (!oaCourtId) {
          return NextResponse.json({ error: "Court ID required" }, { status: 400 })
        }

        const oaResults = await juriscraperIntegration.scrapeCourtOralArguments(oaCourtId)
        return NextResponse.json(oaResults)

      case "test-scraper":
        const testCourtId = searchParams.get("court_id")
        if (!testCourtId) {
          return NextResponse.json({ error: "Court ID required" }, { status: 400 })
        }

        const testResult = await juriscraperIntegration.testScraper(testCourtId)
        return NextResponse.json(testResult)

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Juriscraper API error:", error)
    return NextResponse.json(
      { error: "API request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "bulk-scrape":
        const bulkResults = await juriscraperIntegration.bulkScrape(params)
        return NextResponse.json(bulkResults)

      case "download-document":
        if (!params.url || !params.type) {
          return NextResponse.json({ error: "URL and type required" }, { status: 400 })
        }

        const downloadResult = await juriscraperIntegration.downloadDocument(params.url, params.type)
        return NextResponse.json(downloadResult)

      case "scrape-multiple":
        if (!Array.isArray(params.court_ids)) {
          return NextResponse.json({ error: "court_ids array required" }, { status: 400 })
        }

        const multiResults = await juriscraperIntegration.scrapeMultipleCourts(
          params.court_ids,
          params.include_oral_arguments,
        )
        return NextResponse.json({ results: multiResults })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Juriscraper POST API error:", error)
    return NextResponse.json(
      { error: "Request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
