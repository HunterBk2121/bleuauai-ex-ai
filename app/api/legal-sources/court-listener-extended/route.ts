import { type NextRequest, NextResponse } from "next/server"
import { CourtListenerExtendedAPI } from "@/lib/legal-sources/court-listener-extended-api"

const courtListenerExtended = new CourtListenerExtendedAPI()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "financial-disclosures":
        const personId = searchParams.get("person_id")
        const year = searchParams.get("year")

        const disclosures = await courtListenerExtended.getFinancialDisclosures({
          person: personId ? Number.parseInt(personId) : undefined,
          year: year ? Number.parseInt(year) : undefined,
          has_been_extracted: true,
        })
        return NextResponse.json(disclosures)

      case "judge-conflicts":
        const judgeId = searchParams.get("judge_id")
        const keywords = searchParams.get("keywords")

        if (!judgeId || !keywords) {
          return NextResponse.json({ error: "Judge ID and keywords required" }, { status: 400 })
        }

        const conflicts = await courtListenerExtended.analyzeJudgeConflicts(
          Number.parseInt(judgeId),
          keywords.split(",").map((k) => k.trim()),
        )
        return NextResponse.json(conflicts)

      case "citation-network":
        const opinionId = searchParams.get("opinion_id")

        if (!opinionId) {
          return NextResponse.json({ error: "Opinion ID required" }, { status: 400 })
        }

        const network = await courtListenerExtended.getCitationNetworkAnalysis(Number.parseInt(opinionId))
        return NextResponse.json(network)

      case "investments":
        const investmentPersonId = searchParams.get("person_id")
        const redacted = searchParams.get("redacted")

        const investments = await courtListenerExtended.getInvestments({
          financial_disclosure__person: investmentPersonId ? Number.parseInt(investmentPersonId) : undefined,
          redacted: redacted === "true",
        })
        return NextResponse.json(investments)

      case "gifts":
        const giftPersonId = searchParams.get("person_id")
        const source = searchParams.get("source")

        const gifts = await courtListenerExtended.getGifts({
          financial_disclosure__person: giftPersonId ? Number.parseInt(giftPersonId) : undefined,
          source: source || undefined,
        })
        return NextResponse.json(gifts)

      case "search-alerts":
        const alerts = await courtListenerExtended.getSearchAlerts()
        return NextResponse.json(alerts)

      case "docket-alerts":
        const docketAlerts = await courtListenerExtended.getDocketAlerts()
        return NextResponse.json(docketAlerts)

      case "recap-fetch-status":
        const fetchId = searchParams.get("fetch_id")

        if (!fetchId) {
          return NextResponse.json({ error: "Fetch ID required" }, { status: 400 })
        }

        const fetchStatus = await courtListenerExtended.getRecapFetchStatus(Number.parseInt(fetchId))
        return NextResponse.json(fetchStatus)

      default:
        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener Extended API error:", error)
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
      case "create-search-alert":
        const searchAlert = await courtListenerExtended.createSearchAlert(params)
        return NextResponse.json(searchAlert)

      case "create-docket-alert":
        const { docketId } = params
        if (!docketId) {
          return NextResponse.json({ error: "Docket ID required" }, { status: 400 })
        }

        const docketAlert = await courtListenerExtended.createDocketAlert(docketId)
        return NextResponse.json(docketAlert)

      case "setup-case-monitoring":
        const monitoring = await courtListenerExtended.setupCaseMonitoring(params)
        return NextResponse.json(monitoring)

      case "fetch-pacer-content":
        // Note: This requires PACER credentials and should be used carefully
        const fetchRequest = await courtListenerExtended.fetchPacerContent(params)
        return NextResponse.json(fetchRequest)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener Extended POST API error:", error)
    return NextResponse.json(
      { error: "Request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, id, ...params } = body

    switch (action) {
      case "update-search-alert":
        const updatedSearchAlert = await courtListenerExtended.updateSearchAlert(id, params)
        return NextResponse.json(updatedSearchAlert)

      case "update-docket-alert":
        const { alertType } = params
        const updatedDocketAlert = await courtListenerExtended.updateDocketAlert(id, alertType)
        return NextResponse.json(updatedDocketAlert)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener Extended PATCH API error:", error)
    return NextResponse.json(
      { error: "Request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    switch (action) {
      case "delete-search-alert":
        await courtListenerExtended.deleteSearchAlert(Number.parseInt(id))
        return NextResponse.json({ success: true })

      case "delete-docket-alert":
        await courtListenerExtended.deleteDocketAlert(Number.parseInt(id))
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("CourtListener Extended DELETE API error:", error)
    return NextResponse.json(
      { error: "Request failed", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
