import { type NextRequest, NextResponse } from "next/server"
import { CourtListenerAPI, normalizePacerDocId } from "@/lib/legal-sources/court-listener-api"

const courtListener = new CourtListenerAPI()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "status":
        const status = await courtListener.testConnection()
        return NextResponse.json(status)

      case "api-root":
        const apiRoot = await courtListener.getApiRoot()
        return NextResponse.json(apiRoot)

      case "courts":
        const jurisdiction = searchParams.get("jurisdiction")
        const courts = await courtListener.getCourts({
          jurisdiction: jurisdiction || undefined,
          in_use: true,
        })
        return NextResponse.json(courts)

      case "trending":
        const days = Number.parseInt(searchParams.get("days") || "30")
        const limit = Number.parseInt(searchParams.get("limit") || "50")
        const trending = await courtListener.getTrendingCases(days, limit)
        return NextResponse.json({ results: trending })

      case "search":
        const query = searchParams.get("q") || ""
        const court = searchParams.get("court")
        const judge = searchParams.get("judge")
        const searchLimit = Number.parseInt(searchParams.get("limit") || "20")
        const type = searchParams.get("type") as "o" | "r" | "p" | "d" | "oa" | undefined

        const searchResults = await courtListener.searchOpinions({
          q: query,
          court: court || undefined,
          judge: judge || undefined,
          type: type || "o",
          page_size: searchLimit,
        })

        return NextResponse.json(searchResults)

      case "opinion-cluster":
        const clusterId = searchParams.get("id")
        if (!clusterId) {
          return NextResponse.json({ error: "Cluster ID required" }, { status: 400 })
        }

        const cluster = await courtListener.getOpinionCluster(Number.parseInt(clusterId))
        return NextResponse.json(cluster)

      case "opinion":
        const opinionId = searchParams.get("id")
        if (!opinionId) {
          return NextResponse.json({ error: "Opinion ID required" }, { status: 400 })
        }

        const opinion = await courtListener.getOpinion(Number.parseInt(opinionId))
        return NextResponse.json(opinion)

      case "docket":
        const docketId = searchParams.get("id")
        if (!docketId) {
          return NextResponse.json({ error: "Docket ID required" }, { status: 400 })
        }

        const docket = await courtListener.getDocket(Number.parseInt(docketId))
        return NextResponse.json(docket)

      case "docket-entries":
        const docketEntryDocketId = searchParams.get("docket_id")
        if (!docketEntryDocketId) {
          return NextResponse.json({ error: "Docket ID required" }, { status: 400 })
        }

        const docketEntries = await courtListener.getDocketEntries(Number.parseInt(docketEntryDocketId), {
          order_by: searchParams.get("order_by") || undefined,
          page_size: searchParams.get("page_size") ? Number.parseInt(searchParams.get("page_size")!) : undefined,
        })
        return NextResponse.json(docketEntries)

      case "parties":
        const partiesDocketId = searchParams.get("docket_id")
        if (!partiesDocketId) {
          return NextResponse.json({ error: "Docket ID required" }, { status: 400 })
        }

        const parties = await courtListener.getParties(Number.parseInt(partiesDocketId), {
          filter_nested_results: searchParams.get("filter_nested") === "true",
        })
        return NextResponse.json(parties)

      case "attorneys":
        const attorneysDocketId = searchParams.get("docket_id")
        if (!attorneysDocketId) {
          return NextResponse.json({ error: "Docket ID required" }, { status: 400 })
        }

        const attorneys = await courtListener.getAttorneys(Number.parseInt(attorneysDocketId), {
          filter_nested_results: searchParams.get("filter_nested") === "true",
        })
        return NextResponse.json(attorneys)

      case "judges":
        const judgeFilters: any = {}
        if (searchParams.get("name_first")) judgeFilters.name_first = searchParams.get("name_first")
        if (searchParams.get("name_last")) judgeFilters.name_last = searchParams.get("name_last")
        if (searchParams.get("gender")) judgeFilters.gender = searchParams.get("gender")

        const judges = await courtListener.getJudges(judgeFilters)
        return NextResponse.json(judges)

      case "case-name":
        const caseName = searchParams.get("name")
        if (!caseName) {
          return NextResponse.json({ error: "Case name required" }, { status: 400 })
        }

        const exact = searchParams.get("exact") === "true"
        const caseResults = await courtListener.searchByCaseName(caseName, exact)
        return NextResponse.json({ results: caseResults })

      case "court-cases":
        const courtCasesId = searchParams.get("court_id")
        if (!courtCasesId) {
          return NextResponse.json({ error: "Court ID required" }, { status: 400 })
        }

        const courtCasesLimit = Number.parseInt(searchParams.get("limit") || "20")
        const dateStart = searchParams.get("date_start")
        const dateEnd = searchParams.get("date_end")
        const precedentialStatus = searchParams.get("precedential_status")

        const courtCases = await courtListener.getCasesByCourtId(courtCasesId, {
          limit: courtCasesLimit,
          dateRange: dateStart && dateEnd ? { start: dateStart, end: dateEnd } : undefined,
          precedentialStatus: precedentialStatus || undefined,
        })
        return NextResponse.json({ results: courtCases })

      case "recap-query":
        const recapCourtId = searchParams.get("court_id")
        const pacerDocIds = searchParams.get("pacer_doc_ids")
        if (!recapCourtId || !pacerDocIds) {
          return NextResponse.json({ error: "Court ID and PACER document IDs required" }, { status: 400 })
        }

        const normalizedDocIds = pacerDocIds.split(",").map(normalizePacerDocId)
        const recapResults = await courtListener.recapQuery(recapCourtId, normalizedDocIds)
        return NextResponse.json(recapResults)

      case "count":
        const countEndpoint = searchParams.get("endpoint")
        if (!countEndpoint) {
          return NextResponse.json({ error: "Endpoint required for count" }, { status: 400 })
        }

        const countFilters: Record<string, any> = {}
        for (const [key, value] of searchParams.entries()) {
          if (key !== "action" && key !== "endpoint") {
            countFilters[key] = value
          }
        }

        const count = await courtListener.getCount(countEndpoint, countFilters)
        return NextResponse.json({ count })

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener API error:", error)

    if (error instanceof Error && error.message.includes("Rate limited")) {
      return NextResponse.json({ error: "Rate limited", message: error.message }, { status: 429 })
    }

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
      case "advanced-search":
        const results = await courtListener.advancedSearch(params)
        return NextResponse.json({ results })

      case "download":
        const downloadResults = await courtListener.searchAndDownload(params.query, params.options)
        return NextResponse.json({ downloads: downloadResults })

      case "validate-citations":
        if (params.text) {
          const validationResults = await courtListener.validateCitations(params.text)
          return NextResponse.json({ validations: validationResults })
        } else if (params.volume && params.reporter && params.page) {
          const validation = await courtListener.validateSpecificCitation(params.volume, params.reporter, params.page)
          return NextResponse.json({ validation })
        } else {
          return NextResponse.json({ error: "Either 'text' or 'volume', 'reporter', 'page' required" }, { status: 400 })
        }

      case "bulk-citation-validation":
        const { citations } = params
        if (!Array.isArray(citations)) {
          return NextResponse.json({ error: "Citations array required" }, { status: 400 })
        }

        const bulkResults = []
        for (const citation of citations.slice(0, 250)) {
          // Respect 250 citation limit
          try {
            const result = await courtListener.validateSpecificCitation(
              citation.volume,
              citation.reporter,
              citation.page,
            )
            bulkResults.push(result)
          } catch (error) {
            bulkResults.push({
              citation: `${citation.volume} ${citation.reporter} ${citation.page}`,
              error: error instanceof Error ? error.message : "Validation failed",
              status: 500,
            })
          }
        }

        return NextResponse.json({ validations: bulkResults })

      case "get-api-options":
        const { endpoint } = params
        if (!endpoint) {
          return NextResponse.json({ error: "Endpoint required" }, { status: 400 })
        }

        const options = await courtListener.getApiOptions(endpoint)
        return NextResponse.json(options)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener POST API error:", error)
    return NextResponse.json(
      { error: "Request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
