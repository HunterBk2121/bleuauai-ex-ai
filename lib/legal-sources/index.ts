/**
 * Legal Sources Integration Index
 * Exports all legal source integrations for easy access
 */

// CourtListener and RECAP (already implemented)
export * from "./court-listener-api"
export * from "./court-listener-extended-api"

// Juriscraper (already implemented)
export * from "../juriscraper-integration"

// New integrations
export * from "./caselaw-access-project"
export * from "./casetext"
export * from "./findlaw"
export * from "./google-scholar"
export * from "./lawpipe"
export * from "./supreme-court-database"
export * from "./govinfo"

// Justia (already implemented but exporting here for completeness)
export * from "./justia-api"

// Utility functions
export async function getLegalSourceStatus(): Promise<{
  sources: {
    id: string
    name: string
    status: "online" | "limited" | "offline" | "blocked"
    hasApiKey?: boolean
    message: string
  }[]
  timestamp: string
}> {
  // Dynamic imports to avoid circular dependencies
  const [
    { courtListenerAPI },
    { caselawAccessProject },
    { casetextAPI },
    { findLawAPI },
    { googleScholarAPI },
    { lawPipeAPI },
    { supremeCourtDatabaseAPI },
    { govInfoAPI },
    { justiaAPI },
    { juriscraperIntegration },
  ] = await Promise.all([
    import("./court-listener-api"),
    import("./caselaw-access-project"),
    import("./casetext"),
    import("./findlaw"),
    import("./google-scholar"),
    import("./lawpipe"),
    import("./supreme-court-database"),
    import("./govinfo"),
    import("./justia-api"),
    import("../juriscraper-integration"),
  ])

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

    caselawAccessProject
      .testConnection()
      .then((result) => ({
        id: "caselaw_access_project",
        name: "Caselaw Access Project",
        ...result,
      }))
      .catch(() => ({
        id: "caselaw_access_project",
        name: "Caselaw Access Project",
        status: "offline" as const,
        message: "Connection failed",
      })),

    casetextAPI
      .testConnection()
      .then((result) => ({
        id: "casetext",
        name: "Casetext",
        ...result,
      }))
      .catch(() => ({
        id: "casetext",
        name: "Casetext",
        status: "offline" as const,
        message: "Connection failed",
      })),

    findLawAPI
      .testConnection()
      .then((result) => ({
        id: "findlaw",
        name: "FindLaw",
        ...result,
      }))
      .catch(() => ({
        id: "findlaw",
        name: "FindLaw",
        status: "offline" as const,
        message: "Connection failed",
      })),

    googleScholarAPI
      .testConnection()
      .then((result) => ({
        id: "google_scholar",
        name: "Google Scholar",
        ...result,
      }))
      .catch(() => ({
        id: "google_scholar",
        name: "Google Scholar",
        status: "offline" as const,
        message: "Connection failed",
      })),

    lawPipeAPI
      .testConnection()
      .then((result) => ({
        id: "lawpipe",
        name: "LawPipe",
        ...result,
      }))
      .catch(() => ({
        id: "lawpipe",
        name: "LawPipe",
        status: "offline" as const,
        message: "Connection failed",
      })),

    supremeCourtDatabaseAPI
      .testConnection()
      .then((result) => ({
        id: "supreme_court_database",
        name: "Supreme Court Database",
        ...result,
      }))
      .catch(() => ({
        id: "supreme_court_database",
        name: "Supreme Court Database",
        status: "offline" as const,
        message: "Connection failed",
      })),

    govInfoAPI
      .testConnection()
      .then((result) => ({
        id: "govinfo",
        name: "GovInfo.gov",
        ...result,
      }))
      .catch(() => ({
        id: "govinfo",
        name: "GovInfo.gov",
        status: "offline" as const,
        message: "Connection failed",
      })),

    justiaAPI
      .testConnection()
      .then((result) => ({
        id: "justia",
        name: "Justia",
        ...result,
      }))
      .catch(() => ({
        id: "justia",
        name: "Justia",
        status: "offline" as const,
        message: "Connection failed",
      })),

    juriscraperIntegration
      .getScraperStatus()
      .then((result) => ({
        id: "juriscraper",
        name: "Juriscraper",
        status: result.juriscraper_available ? ("online" as const) : ("offline" as const),
        message: result.juriscraper_available ? `Available with ${result.supported_courts} courts` : "Not available",
      }))
      .catch(() => ({
        id: "juriscraper",
        name: "Juriscraper",
        status: "offline" as const,
        message: "Not available",
      })),
  ])

  return {
    sources,
    timestamp: new Date().toISOString(),
  }
}
