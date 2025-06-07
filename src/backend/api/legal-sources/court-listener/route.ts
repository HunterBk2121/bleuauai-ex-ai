import { type NextRequest, NextResponse } from "next/server"
import { courtListenerAPI } from "@/src/backend/services/legal-sources/court-listener-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action") || "search"
    const id = searchParams.get("id")

    switch (action) {
      case "search": {
        const query = searchParams.get("q") || ""
        const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
        const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

        const result = await courtListenerAPI.searchOpinions({
          q: query,
          limit,
          offset,
        })

        return NextResponse.json(result)
      }

      case "opinion": {
        if (!id) {
          return NextResponse.json({ error: "Missing opinion ID" }, { status: 400 })
        }

        const opinion = await courtListenerAPI.getOpinion(Number.parseInt(id, 10))
        return NextResponse.json(opinion)
      }

      case "docket": {
        if (!id) {
          return NextResponse.json({ error: "Missing docket ID" }, { status: 400 })
        }

        const docket = await courtListenerAPI.getDocket(Number.parseInt(id, 10))
        return NextResponse.json(docket)
      }

      case "courts": {
        const courts = await courtListenerAPI.getCourts()
        return NextResponse.json({ courts })
      }

      case "court": {
        if (!id) {
          return NextResponse.json({ error: "Missing court ID" }, { status: 400 })
        }

        const court = await courtListenerAPI.getCourt(id)
        return NextResponse.json(court)
      }

      case "judges": {
        const judges = await courtListenerAPI.getJudges()
        return NextResponse.json({ judges })
      }

      case "judge": {
        if (!id) {
          return NextResponse.json({ error: "Missing judge ID" }, { status: 400 })
        }

        const judge = await courtListenerAPI.getJudge(Number.parseInt(id, 10))
        return NextResponse.json(judge)
      }

      case "validate-citation": {
        const reporter = searchParams.get("reporter")
        const volume = searchParams.get("volume")
        const page = searchParams.get("page")

        if (!reporter || !volume || !page) {
          return NextResponse.json({ error: "Missing citation parameters" }, { status: 400 })
        }

        const validation = await courtListenerAPI.validateCitation(
          reporter,
          Number.parseInt(volume, 10),
          Number.parseInt(page, 10),
        )

        return NextResponse.json(validation)
      }

      case "status": {
        const status = await courtListenerAPI.testConnection()
        return NextResponse.json(status)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener API error:", error)

    return NextResponse.json(
      {
        error: "CourtListener API error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params = {} } = body

    switch (action) {
      case "search":
        const result = await courtListenerAPI.searchOpinions(params)
        return NextResponse.json(result)

      case "validate-citation":
        if (!params.reporter || !params.volume || !params.page) {
          return NextResponse.json({ error: "Missing citation parameters" }, { status: 400 })
        }

        const validation = await courtListenerAPI.validateCitation(params.reporter, params.volume, params.page)

        return NextResponse.json(validation)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener API error:", error)

    return NextResponse.json(
      {
        error: "CourtListener API error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
