import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if CourtListener API key is configured
    const hasCourtListenerKey = !!process.env.COURT_LISTENER_API_KEY

    // Create a mock response
    const sources = [
      {
        id: "court_listener",
        name: "CourtListener",
        status: hasCourtListenerKey ? "online" : "limited",
        hasApiKey: hasCourtListenerKey,
        message: hasCourtListenerKey ? "Connected with full API access" : "Using public access (limited functionality)",
      },
      {
        id: "justia",
        name: "Justia",
        status: "online",
        message: "Public API available",
      },
      {
        id: "google_scholar",
        name: "Google Scholar",
        status: "online",
        message: "Public access available",
      },
      {
        id: "caselaw_access_project",
        name: "Caselaw Access Project",
        status: "online",
        message: "Public access available",
      },
    ]

    return NextResponse.json(
      {
        sources,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching legal sources status:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch legal sources status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
