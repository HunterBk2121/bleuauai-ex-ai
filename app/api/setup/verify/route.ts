import { NextResponse } from "next/server"

export async function GET() {
  const verification = {
    timestamp: new Date().toISOString(),
    environment: "production",
    checks: [] as Array<{
      name: string
      status: "pass" | "fail" | "warning"
      message: string
      required: boolean
    }>,
  }

  // Check required environment variables
  const requiredVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", required: true },
    { name: "SUPABASE_SERVICE_ROLE_KEY", required: true },
    { name: "GOOGLE_GENERATIVE_AI_API_KEY", required: true },
  ]

  const optionalVars = [
    { name: "BLOB_READ_WRITE_TOKEN", required: false },
    { name: "NEXTAUTH_SECRET", required: false },
    { name: "COURT_LISTENER_API_KEY", required: false },
  ]

  // Check required variables
  for (const envVar of requiredVars) {
    const value = process.env[envVar.name]
    verification.checks.push({
      name: `Environment Variable: ${envVar.name}`,
      status: value ? "pass" : "fail",
      message: value ? "Configured" : "Missing required environment variable",
      required: envVar.required,
    })
  }

  // Check optional variables
  for (const envVar of optionalVars) {
    const value = process.env[envVar.name]
    verification.checks.push({
      name: `Environment Variable: ${envVar.name}`,
      status: value ? "pass" : "warning",
      message: value ? "Configured" : "Optional variable not configured",
      required: envVar.required,
    })
  }

  // Calculate overall status
  const failed = verification.checks.filter((c) => c.status === "fail" && c.required).length
  const warnings = verification.checks.filter((c) => c.status === "warning").length

  const overallStatus = failed > 0 ? "critical" : warnings > 0 ? "ready_with_warnings" : "ready"

  return NextResponse.json({
    success: true,
    status: overallStatus,
    verification,
    summary: {
      total: verification.checks.length,
      passed: verification.checks.filter((c) => c.status === "pass").length,
      failed: verification.checks.filter((c) => c.status === "fail").length,
      warnings: verification.checks.filter((c) => c.status === "warning").length,
    },
  })
}
