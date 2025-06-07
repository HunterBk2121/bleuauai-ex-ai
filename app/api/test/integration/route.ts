import { NextResponse } from "next/server"
import { systemDiagnostics } from "@/lib/diagnostics/system-diagnostics"

export async function GET() {
  try {
    console.log("🧪 Running integration tests...")

    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as Array<{
        name: string
        status: "pass" | "fail"
        message: string
        duration: number
      }>,
    }

    // Test 1: System Health
    const healthStart = Date.now()
    try {
      const health = await systemDiagnostics.runFullDiagnostics()
      results.tests.push({
        name: "System Diagnostics",
        status: health.overall === "critical" ? "fail" : "pass",
        message: `System health: ${health.overall} (${health.summary.passed}/${health.summary.total} passed)`,
        duration: Date.now() - healthStart,
      })
    } catch (error) {
      results.tests.push({
        name: "System Diagnostics",
        status: "fail",
        message: `Diagnostics failed: ${error}`,
        duration: Date.now() - healthStart,
      })
    }

    // Test 2: API Endpoints
    const apiTests = [
      "/api/health",
      "/api/setup/verify",
      "/api/credits/status?userId=test",
      "/api/legal-sources/status",
    ]

    for (const endpoint of apiTests) {
      const apiStart = Date.now()
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${endpoint}`)
        results.tests.push({
          name: `API: ${endpoint}`,
          status: response.ok ? "pass" : "fail",
          message: `Status: ${response.status}`,
          duration: Date.now() - apiStart,
        })
      } catch (error) {
        results.tests.push({
          name: `API: ${endpoint}`,
          status: "fail",
          message: `Request failed: ${error}`,
          duration: Date.now() - apiStart,
        })
      }
    }

    // Calculate summary
    const passed = results.tests.filter((t) => t.status === "pass").length
    const failed = results.tests.filter((t) => t.status === "fail").length
    const totalDuration = results.tests.reduce((sum, t) => sum + t.duration, 0)

    console.log(`✅ Integration tests complete: ${passed}/${results.tests.length} passed in ${totalDuration}ms`)

    return NextResponse.json({
      success: true,
      summary: {
        total: results.tests.length,
        passed,
        failed,
        duration: totalDuration,
      },
      results,
    })
  } catch (error) {
    console.error("❌ Integration tests failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Integration tests failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
