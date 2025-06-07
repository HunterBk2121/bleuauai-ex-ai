import { type NextRequest, NextResponse } from "next/server"
import { courtListenerAPI } from "@/lib/legal-sources/court-listener-api"
import { caselawAccessProject } from "@/lib/legal-sources/caselaw-access-project"
import { casetextAPI } from "@/lib/legal-sources/casetext"
import { findLawAPI } from "@/lib/legal-sources/findlaw"
import { googleScholarAPI } from "@/lib/legal-sources/google-scholar"
import { lawPipeAPI } from "@/lib/legal-sources/lawpipe"
import { supremeCourtDatabaseAPI } from "@/lib/legal-sources/supreme-court-database"
import { govInfoAPI } from "@/lib/legal-sources/govinfo"
import { justiaAPI } from "@/lib/legal-sources/justia-api"

interface SearchRequest {
  query: string
  sources: string[]
  options?: {
    limit?: number
    jurisdiction?: string
    dateRange?: {
      start: string
      end: string
    }
  }
}

interface SearchResult {
  id: string
  title: string
  citation: string
  court: string
  date: string
  snippet: string
  url: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json()
    const { query, sources, options = {} } = body

    if (!query || !sources || sources.length === 0) {
      return NextResponse.json({ error: "Query and sources are required" }, { status: 400 })
    }

    const searchPromises: Promise<SearchResult[]>[] = []

    // Execute searches in parallel for selected sources
    for (const sourceId of sources) {
      switch (sourceId) {
        case "court_listener":
          searchPromises.push(searchCourtListener(query, options))
          break
        case "caselaw_access_project":
          searchPromises.push(searchCAP(query, options))
          break
        case "casetext":
          searchPromises.push(searchCasetext(query, options))
          break
        case "findlaw":
          searchPromises.push(searchFindLaw(query, options))
          break
        case "google_scholar":
          searchPromises.push(searchGoogleScholar(query, options))
          break
        case "lawpipe":
          searchPromises.push(searchLawPipe(query, options))
          break
        case "supreme_court_database":
          searchPromises.push(searchSCDB(query, options))
          break
        case "govinfo":
          searchPromises.push(searchGovInfo(query, options))
          break
        case "justia":
          searchPromises.push(searchJustia(query, options))
          break
      }
    }

    // Wait for all searches to complete
    const results = await Promise.allSettled(searchPromises)

    // Combine successful results
    const combinedResults: SearchResult[] = []
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        combinedResults.push(...result.value)
      } else {
        console.error(`Search failed for source ${sources[index]}:`, result.reason)
      }
    })

    // Sort by relevance (this is a simple implementation)
    combinedResults.sort((a, b) => {
      // Prioritize exact matches in title
      const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
      const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
      return bExact - aExact
    })

    // Apply limit
    const limit = options.limit || 50
    const limitedResults = combinedResults.slice(0, limit)

    return NextResponse.json({
      results: limitedResults,
      total: combinedResults.length,
      sources: sources,
      query: query,
    })
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

// Individual search functions for each source
async function searchCourtListener(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await courtListenerAPI.searchOpinions({
      q: query,
      page_size: options.limit || 10,
    })

    return results.results.map((result) => ({
      id: result.id.toString(),
      title: result.case_name || "Untitled",
      citation: result.citation?.cite || "",
      court: result.court || "",
      date: result.date_filed || "",
      snippet: result.snippet || "",
      url: result.absolute_url || "",
      source: "CourtListener",
    }))
  } catch (error) {
    console.error("CourtListener search error:", error)
    return []
  }
}

async function searchCAP(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await caselawAccessProject.searchCases({
      q: query,
      page_size: options.limit || 10,
    })

    return results.results.map((result) => ({
      id: result.id.toString(),
      title: result.name || "Untitled",
      citation: result.citation || "",
      court: result.court.name || "",
      date: result.decision_date || "",
      snippet: result.preview?.join(" ") || "",
      url: result.frontend_url || "",
      source: "Caselaw Access Project",
    }))
  } catch (error) {
    console.error("CAP search error:", error)
    return []
  }
}

async function searchCasetext(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await casetextAPI.searchCases({
      q: query,
      page_size: options.limit || 10,
    })

    return results.results.map((result) => ({
      id: result.id,
      title: result.name || "Untitled",
      citation: result.citation || "",
      court: result.court || "",
      date: result.date || "",
      snippet: result.snippet || "",
      url: result.url || "",
      source: "Casetext",
    }))
  } catch (error) {
    console.error("Casetext search error:", error)
    return []
  }
}

async function searchFindLaw(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await findLawAPI.searchCases({
      query: query,
      page: 1,
    })

    return results.results.slice(0, options.limit || 10).map((result, index) => ({
      id: `findlaw_${index}`,
      title: result.title || "Untitled",
      citation: result.citation || "",
      court: result.court || "",
      date: result.date || "",
      snippet: result.snippet || "",
      url: result.url || "",
      source: "FindLaw",
    }))
  } catch (error) {
    console.error("FindLaw search error:", error)
    return []
  }
}

async function searchGoogleScholar(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await googleScholarAPI.searchCaseLaw({
      q: query,
      num: options.limit || 10,
    })

    return results.results.map((result, index) => ({
      id: `scholar_${index}`,
      title: result.title || "Untitled",
      citation: result.citation || "",
      court: result.court || "",
      date: result.date || "",
      snippet: result.snippet || "",
      url: result.url || "",
      source: "Google Scholar",
    }))
  } catch (error) {
    console.error("Google Scholar search error:", error)
    return []
  }
}

async function searchLawPipe(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await lawPipeAPI.searchCases({
      query: query,
      limit: options.limit || 10,
    })

    return results.results.map((result) => ({
      id: result.id,
      title: result.title || "Untitled",
      citation: result.citation || "",
      court: result.court || "",
      date: result.date || "",
      snippet: result.summary || "",
      url: result.url || "",
      source: "LawPipe",
    }))
  } catch (error) {
    console.error("LawPipe search error:", error)
    return []
  }
}

async function searchSCDB(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await supremeCourtDatabaseAPI.searchCases({
      term: query,
      limit: options.limit || 10,
    })

    return results.results.map((result) => ({
      id: result.caseId,
      title: result.caseName || "Untitled",
      citation: result.usCite || result.sctCite || "",
      court: "Supreme Court of the United States",
      date: result.dateDecision || "",
      snippet: `${result.issue || ""} ${result.issueArea || ""}`.trim(),
      url: `http://scdb.wustl.edu/analysisCaseDetail.php?cid=${result.caseId}`,
      source: "Supreme Court Database",
    }))
  } catch (error) {
    console.error("SCDB search error:", error)
    return []
  }
}

async function searchGovInfo(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await govInfoAPI.searchCourtOpinions({
      pageSize: options.limit || 10,
    })

    return results.packages
      .filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(query.toLowerCase()) ||
          pkg.summary.toLowerCase().includes(query.toLowerCase()),
      )
      .map((result) => ({
        id: result.packageId,
        title: result.title || "Untitled",
        citation: result.caseNumber || "",
        court: result.court.name || "",
        date: result.dateIssued || "",
        snippet: result.summary || "",
        url: result.pdfUrl || "",
        source: "GovInfo.gov",
      }))
  } catch (error) {
    console.error("GovInfo search error:", error)
    return []
  }
}

async function searchJustia(query: string, options: any): Promise<SearchResult[]> {
  try {
    const results = await justiaAPI.searchCases({
      q: query,
      limit: options.limit || 10,
    })

    return results.map((result, index) => ({
      id: `justia_${index}`,
      title: result.title || "Untitled",
      citation: result.citation || "",
      court: result.court || "",
      date: result.date || "",
      snippet: result.snippet || "",
      url: result.url || "",
      source: "Justia",
    }))
  } catch (error) {
    console.error("Justia search error:", error)
    return []
  }
}
