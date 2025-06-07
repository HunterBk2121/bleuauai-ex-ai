import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in a browser environment and have the required variables
const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey)

// Global singleton instance
let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get the singleton Supabase client instance
 * This ensures only one client is created per browser context
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseConfig) {
    console.warn("Supabase environment variables not configured. Database features will be disabled.")
    return null
  }

  // Only create one instance globally
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        headers: {
          "X-Client-Info": "legal-ai-platform",
        },
      },
    })
  }

  return supabaseInstance
}

// Legacy export for backward compatibility - now returns the singleton
export const supabase = getSupabaseClient()

// Test database connection (client-side safe)
export async function testConnection() {
  try {
    const client = getSupabaseClient()
    if (!client) {
      return { success: false, connected: false, error: "Supabase not configured" }
    }

    const { data, error } = await client.from("legal_documents").select("count", { count: "exact", head: true })

    if (error) throw error
    return { success: true, connected: true }
  } catch (error) {
    console.error("Connection test failed:", error)
    return { success: false, connected: false, error }
  }
}

// Get database status (client-side safe)
export async function getDatabaseStatus() {
  try {
    const client = getSupabaseClient()
    if (!client) {
      return {
        status: "not_configured" as const,
        tables: [],
        counts: {},
        timestamp: new Date().toISOString(),
        error: "Supabase environment variables not configured",
      }
    }

    const tables = ["legal_documents", "legal_cases", "jurisdictions", "practice_areas", "document_types"]
    const counts: Record<string, number> = {}

    for (const table of tables) {
      try {
        const { count, error } = await client.from(table).select("*", { count: "exact", head: true })

        if (!error) {
          counts[table] = count || 0
        }
      } catch (error) {
        counts[table] = 0
      }
    }

    return {
      status: "connected" as const,
      tables,
      counts,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "error" as const,
      tables: [],
      counts: {},
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig
}
