import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we have the required variables
const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey)

// Server-side singleton for admin operations
let supabaseAdminInstance: SupabaseClient<Database> | null = null
let supabaseServerInstance: SupabaseClient<Database> | null = null

/**
 * Get the admin Supabase client (server-side only)
 * Only use this in API routes, server actions, or server components
 * Returns null if environment variables are not configured
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!hasSupabaseConfig) {
    console.warn("Supabase environment variables not configured. Admin operations will be disabled.")
    return null
  }

  if (!supabaseServiceKey) {
    console.warn("Supabase service role key not available - admin operations will be limited")
    // Return regular client as fallback for server-side operations
    return createServerClient()
  }

  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient<Database>(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "legal-ai-platform-admin",
        },
      },
    })
  }
  return supabaseAdminInstance
}

/**
 * Check if admin client is available (server-side only)
 */
export function hasAdminAccess(): boolean {
  return hasSupabaseConfig && !!supabaseServiceKey
}

/**
 * Create a server-side client for server components
 * Returns null if environment variables are not configured
 */
export function createServerClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseConfig) {
    console.warn("Supabase environment variables not configured. Server client will be disabled.")
    return null
  }

  if (!supabaseServerInstance) {
    supabaseServerInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          "X-Client-Info": "legal-ai-platform-server",
        },
      },
    })
  }

  return supabaseServerInstance
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return hasSupabaseConfig
}

// Database utility functions (server-side only)
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const client = getSupabaseAdmin()

    if (!client) {
      throw new Error("Supabase not configured - cannot execute query")
    }

    // Check if we have admin access for this operation
    if (!hasAdminAccess()) {
      throw new Error("Admin access required for this operation")
    }

    const { data, error } = await client.rpc("execute_sql", {
      query_text: query,
      query_params: JSON.stringify(params),
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}
