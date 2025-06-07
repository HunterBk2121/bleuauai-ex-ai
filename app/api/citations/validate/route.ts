import { type NextRequest, NextResponse } from "next/server"
import { citationValidationAgent } from "@/lib/ai/citation-validation-agent"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, citations, options = {} } = body

    if (!text && !citations) {
      return NextResponse.json({ error: "Either 'text' or 'citations' parameter is required" }, { status: 400 })
    }

    let validationResults

    if (text) {
      // Validate all citations found in text
      validationResults = await citationValidationAgent.validateCitations(text, [], options)
    } else {
      // Validate specific citations
      const checks = []
      for (const citation of citations) {
        const check = await citationValidationAgent.validateSingleCitation(
          { id: citation.id || `citation_${checks.length}`, text: citation.text, context: citation.context || "" },
          [],
          options,
        )
        checks.push(check)
      }
      validationResults = { checks, report: citationValidationAgent.generateValidationReport(checks) }
    }

    return NextResponse.json({
      success: true,
      ...validationResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Citation validation API error:", error)

    if (error.message.includes("Rate limited")) {
      return NextResponse.json({ error: "Rate limited by CourtListener API", details: error.message }, { status: 429 })
    }

    return NextResponse.json({ error: "Citation validation failed", details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const volume = searchParams.get("volume")
  const reporter = searchParams.get("reporter")
  const page = searchParams.get("page")

  if (!volume || !reporter || !page) {
    return NextResponse.json({ error: "volume, reporter, and page parameters are required" }, { status: 400 })
  }

  try {
    const courtListener = new (await import("@/lib/legal-sources/court-listener-api")).CourtListenerAPI()
    const result = await courtListener.validateSpecificCitation(volume, reporter, page)

    return NextResponse.json({
      success: true,
      citation: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Specific citation validation error:", error)
    return NextResponse.json({ error: "Citation validation failed", details: error.message }, { status: 500 })
  }
}
