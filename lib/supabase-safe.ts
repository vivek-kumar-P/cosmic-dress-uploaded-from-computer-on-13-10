import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

interface SafeSupabaseResult {
  client: SupabaseClient<Database> | null
  error: string | null
  isConfigured: boolean
}

export function createSafeSupabaseClient(): SafeSupabaseResult {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl) {
      return {
        client: null,
        error: "NEXT_PUBLIC_SUPABASE_URL is not configured",
        isConfigured: false,
      }
    }

    if (!supabaseAnonKey) {
      return {
        client: null,
        error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured",
        isConfigured: false,
      }
    }

    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    return {
      client,
      error: null,
      isConfigured: true,
    }
  } catch (error) {
    return {
      client: null,
      error: error instanceof Error ? error.message : "Unknown error creating Supabase client",
      isConfigured: false,
    }
  }
}

// Export a safe instance
export const safeSupabase = createSafeSupabaseClient()
