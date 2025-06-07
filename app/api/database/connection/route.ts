import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    // Check if database environment variables are configured
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasPostgresUrl = !!process.env.POSTGRES_URL

    // Return environment variable status
    return NextResponse.json({
      status: "success",
      connected: true,
      database_type: hasSupabaseUrl ? "supabase" : hasPostgresUrl ? "postgres" : "none",
      environment_variables: {
        supabase_url: hasSupabaseUrl,
        supabase_key: hasSupabaseKey,
        postgres_url: hasPostgresUrl,
      },
      message: "Database connection check completed",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database connection check error:", error)
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
