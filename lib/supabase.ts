import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Create a safe client that won't throw errors during build
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error)
  }
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseClient)
}

// Safe getter for the Supabase client
export const getSupabaseClient = () => {
  if (!supabaseClient) {
    console.warn("Supabase client is not configured. Please check your environment variables.")
    return null
  }
  return supabaseClient
}

// Named export for compatibility
export const supabase = supabaseClient

// Default export for backward compatibility
export default supabaseClient
