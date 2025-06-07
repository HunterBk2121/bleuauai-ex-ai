import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {} as Record<string, any>,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
  }

  try {
    // Check database connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

      const start = Date.now()
      const { error } = await supabase.from("documents").select("id").limit(1)
      const responseTime = Date.now() - start

      health.services.database = {
        status: error ? "unhealthy" : "healthy",
        responseTime: `${responseTime}ms`,
        error: error?.message,
      }
    } else {
      health.services.database = {
        status: "not_configured",
        error: "Database credentials not configured",
      }
    }

    // Check AI service
    health.services.ai = {
      status: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "configured" : "not_configured",
      provider: "Google Generative AI",
    }

    // Check blob storage
    health.services.storage = {
      status: process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "not_configured",
      provider: "Vercel Blob",
    }

    // Determine overall status
    const unhealthyServices = Object.values(health.services).filter((service) => service.status === "unhealthy").length

    if (unhealthyServices > 0) {
      health.status = "degraded"
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
        services: health.services,
      },
      { status: 500 },
    )
  }
}
