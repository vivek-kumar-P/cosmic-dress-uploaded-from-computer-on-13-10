import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClientComponentClient<Database>({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
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
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    try {
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl,
        supabaseKey: supabaseAnonKey,
      })
    } catch (error) {
      console.error("Error creating Supabase client:", error)
    }
  }
  return supabaseClient
}

// Named export for compatibility
export const supabase = (supabaseClient || getSupabaseClient()) as ReturnType<typeof createClientComponentClient<Database>>

// Default export for backward compatibility
export default supabase
