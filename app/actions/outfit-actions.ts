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

export async function saveOutfit(
  userId: string,
  outfitData: {
    name: string
    description?: string
    avatar_id?: string
    is_favorite?: boolean
    items: Array<{
      product_id: string
      position_data?: string
      customization_data?: any
    }>
  },
) {
  try {
    const supabaseAdmin = createAdminClient()

    // Create the outfit
    const { data: outfit, error: outfitError } = await supabaseAdmin
      .from("saved_outfits")
      .insert({
        user_id: userId,
        name: outfitData.name,
        description: outfitData.description || null,
        avatar_id: outfitData.avatar_id || null,
        is_favorite: outfitData.is_favorite || false,
      })
      .select()
      .single()

    if (outfitError) throw outfitError

    // Add outfit items
    if (outfitData.items.length > 0) {
      const itemsToInsert = outfitData.items.map((item) => ({
        outfit_id: outfit.id,
        product_id: item.product_id,
        position_data: item.position_data || null,
        customization_data: item.customization_data || null,
      }))

      const { error: itemsError } = await supabaseAdmin.from("outfit_items").insert(itemsToInsert)

      if (itemsError) throw itemsError
    }

    return { success: true, outfit }
  } catch (error) {
    console.error("Error saving outfit:", error)
    return { success: false, error }
  }
}

export async function getUserOutfits(userId: string) {
  try {
    const supabaseAdmin = createAdminClient()

    const { data, error } = await supabaseAdmin
      .from("saved_outfits")
      .select(`
        *,
        avatars(*),
        outfit_items(
          *,
          products(*)
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, outfits: data }
  } catch (error) {
    console.error("Error fetching outfits:", error)
    return { success: false, error }
  }
}

export async function deleteOutfit(outfitId: string, userId: string) {
  try {
    const supabaseAdmin = createAdminClient()

    // Verify ownership
    const { data: outfit, error: fetchError } = await supabaseAdmin
      .from("saved_outfits")
      .select("user_id")
      .eq("id", outfitId)
      .single()

    if (fetchError) throw fetchError
    if (outfit.user_id !== userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete the outfit (cascade will handle outfit_items)
    const { error: deleteError } = await supabaseAdmin.from("saved_outfits").delete().eq("id", outfitId)

    if (deleteError) throw deleteError

    return { success: true }
  } catch (error) {
    console.error("Error deleting outfit:", error)
    return { success: false, error }
  }
}
