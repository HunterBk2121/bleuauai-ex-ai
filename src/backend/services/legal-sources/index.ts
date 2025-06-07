/**
 * Legal Sources Service Index
 * Exports all legal source services for easy access
 */

// Export all legal source services
export * from "./court-listener-api"
// Add other legal source exports here as they are implemented

// Import types
import type { LegalCase } from "@/src/backend/types/legal-sources"

/**
 * Get status of all legal sources
 */
export async function getLegalSourcesStatus(): Promise<{
  sources: {
    id: string
    name: string
    status: "online" | "limited" | "offline" | "blocked"
    hasApiKey?: boolean
    message: string
  }[]
  timestamp: string
}> {
  // Import services dynamically to avoid circular dependencies
  const { courtListenerAPI } = await import("./court-listener-api")

  // Test all connections in parallel
  const sources = await Promise.all([
    courtListenerAPI
      .testConnection()
      .then((result) => ({
        id: "court_listener",
        name: "CourtListener",
        ...result,
      }))
      .catch(() => ({
        id: "court_listener",
        name: "CourtListener",
        status: "offline" as const,
        message: "Connection failed",
      })),

    // Add other legal source status checks here
  ])

  return {
    sources,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Search across multiple legal sources
 */
export async function searchMultipleSources(
  query: string,
  sources: string[],
  options: {
    limit?: number
    jurisdiction?: string
    dateRange?: {
      start: string
      end: string
    }
  } = {},
): Promise<{
  results: LegalCase[]
  sources: string[]
  query: string
  total: number
}> {
  // Import services dynamically
  const { courtListenerAPI } = await import("./court-listener-api")

  const searchPromises: Promise<LegalCase[]>[] = []

  // Execute searches in parallel for selected sources
  for (const sourceId of sources) {
    switch (sourceId) {
      case "court_listener":
        searchPromises.push(
          courtListenerAPI
            .searchOpinions({
              q: query,
              page_size: options.limit || 10,
            })
            .then((response) =>
              response.results.map((result) => ({
                id: result.id.toString(),
                title: result.case_name || "Untitled",
                citation: result.citation?.cite || "",
                court: result.court || "",
                date: result.date_filed || "",
                snippet: result.snippet || "",
                url: result.absolute_url || "",
                source: "CourtListener",
              })),
            )
            .catch((error) => {
              console.error("CourtListener search error:", error)
              return []
            }),
        )
        break

      // Add other sources here
    }
  }

  // Wait for all searches to complete
  const results = await Promise.allSettled(searchPromises)

  // Combine successful results
  const combinedResults: LegalCase[] = []
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      combinedResults.push(...result.value)
    }
  })

  // Sort by relevance (simple implementation)
  combinedResults.sort((a, b) => {
    // Prioritize exact matches in title
    const aExact = a.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
    const bExact = b.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
    return bExact - aExact
  })

  // Apply limit
  const limit = options.limit || 50
  const limitedResults = combinedResults.slice(0, limit)

  return {
    results: limitedResults,
    total: combinedResults.length,
    sources,
    query,
  }
}
