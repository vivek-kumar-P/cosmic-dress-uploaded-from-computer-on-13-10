"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a Supabase client with the service role key
const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createUserProfile(userId: string, userData: { username: string; full_name: string }) {
  try {
    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      username: userData.username,
      full_name: userData.full_name,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { success: false, error }
  }
}
