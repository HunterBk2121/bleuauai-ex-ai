import { NextResponse } from "next/server"
import { systemDiagnostics } from "@/lib/diagnostics/system-diagnostics"

export async function GET() {
  try {
    console.log("🔍 Starting system diagnostics...")

    const health = await systemDiagnostics.runFullDiagnostics()

    console.log(`✅ Diagnostics complete: ${health.overall} (${health.summary.passed}/${health.summary.total} passed)`)

    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Diagnostics failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Diagnostics failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { component } = await request.json()

    // Run specific component diagnostics
    const health = await systemDiagnostics.runFullDiagnostics()

    const componentResults = health.results.filter((r) =>
      r.component.toLowerCase().includes(component?.toLowerCase() || ""),
    )

    return NextResponse.json({
      success: true,
      component,
      results: componentResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Component diagnostics failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
