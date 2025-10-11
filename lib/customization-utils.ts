import { supabase } from "./supabase"
import type { Database } from "@/types/supabase"

type Avatar = Database["public"]["Tables"]["avatars"]["Row"]
type AvatarMeasurement = Database["public"]["Tables"]["avatar_measurements"]["Row"]
type SavedOutfit = Database["public"]["Tables"]["saved_outfits"]["Row"]
type OutfitItem = Database["public"]["Tables"]["outfit_items"]["Row"]

// Avatar functions
export async function getUserAvatars(userId: string) {
  const { data, error } = await supabase
    .from("avatars")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching avatars:", error)
    throw error
  }

  return data
}

export async function getAvatarById(avatarId: string) {
  const { data, error } = await supabase
    .from("avatars")
    .select(`
      *,
      avatar_measurements(*)
    `)
    .eq("id", avatarId)
    .single()

  if (error) {
    console.error("Error fetching avatar:", error)
    throw error
  }

  return data
}

export async function createAvatar(avatarData: Database["public"]["Tables"]["avatars"]["Insert"]) {
  const { data, error } = await supabase.from("avatars").insert(avatarData).select().single()

  if (error) {
    console.error("Error creating avatar:", error)
    throw error
  }

  return data
}

export async function updateAvatar(avatarId: string, avatarData: Database["public"]["Tables"]["avatars"]["Update"]) {
  const { data, error } = await supabase.from("avatars").update(avatarData).eq("id", avatarId).select().single()

  if (error) {
    console.error("Error updating avatar:", error)
    throw error
  }

  return data
}

export async function deleteAvatar(avatarId: string) {
  const { error } = await supabase.from("avatars").delete().eq("id", avatarId)

  if (error) {
    console.error("Error deleting avatar:", error)
    throw error
  }

  return true
}

// Avatar Measurements functions
export async function addAvatarMeasurement(
  measurementData: Database["public"]["Tables"]["avatar_measurements"]["Insert"],
) {
  const { data, error } = await supabase.from("avatar_measurements").insert(measurementData).select().single()

  if (error) {
    console.error("Error adding measurement:", error)
    throw error
  }

  return data
}

export async function getAvatarMeasurements(avatarId: string) {
  const { data, error } = await supabase.from("avatar_measurements").select("*").eq("avatar_id", avatarId)

  if (error) {
    console.error("Error fetching measurements:", error)
    throw error
  }

  return data
}

// Saved Outfits functions
export async function getUserOutfits(userId: string) {
  const { data, error } = await supabase
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

  if (error) {
    console.error("Error fetching outfits:", error)
    throw error
  }

  return data
}

export async function getOutfitById(outfitId: string) {
  const { data, error } = await supabase
    .from("saved_outfits")
    .select(`
      *,
      avatars(*),
      outfit_items(
        *,
        products(*)
      )
    `)
    .eq("id", outfitId)
    .single()

  if (error) {
    console.error("Error fetching outfit:", error)
    throw error
  }

  return data
}

export async function createOutfit(
  outfitData: Database["public"]["Tables"]["saved_outfits"]["Insert"],
  outfitItems: Array<{ product_id: string; position_data?: string | null; customization_data?: any }>,
) {
  // Start a transaction
  const { data: outfit, error: outfitError } = await supabase.from("saved_outfits").insert(outfitData).select().single()

  if (outfitError) {
    console.error("Error creating outfit:", outfitError)
    throw outfitError
  }

  // Add outfit items
  if (outfitItems.length > 0) {
    const itemsToInsert = outfitItems.map((item) => ({
      outfit_id: outfit.id,
      product_id: item.product_id,
      position_data: item.position_data || null,
      customization_data: item.customization_data || null,
    }))

    const { error: itemsError } = await supabase.from("outfit_items").insert(itemsToInsert)

    if (itemsError) {
      console.error("Error adding outfit items:", itemsError)
      throw itemsError
    }
  }

  return outfit
}

export async function updateOutfit(
  outfitId: string,
  outfitData: Database["public"]["Tables"]["saved_outfits"]["Update"],
) {
  const { data, error } = await supabase.from("saved_outfits").update(outfitData).eq("id", outfitId).select().single()

  if (error) {
    console.error("Error updating outfit:", error)
    throw error
  }

  return data
}

export async function deleteOutfit(outfitId: string) {
  const { error } = await supabase.from("saved_outfits").delete().eq("id", outfitId)

  if (error) {
    console.error("Error deleting outfit:", error)
    throw error
  }

  return true
}

// Outfit Items functions
export async function addOutfitItem(itemData: Database["public"]["Tables"]["outfit_items"]["Insert"]) {
  const { data, error } = await supabase.from("outfit_items").insert(itemData).select().single()

  if (error) {
    console.error("Error adding outfit item:", error)
    throw error
  }

  return data
}

export async function removeOutfitItem(itemId: string) {
  const { error } = await supabase.from("outfit_items").delete().eq("id", itemId)

  if (error) {
    console.error("Error removing outfit item:", error)
    throw error
  }

  return true
}

export async function updateOutfitItems(
  outfitId: string,
  items: Array<{ product_id: string; position_data?: string | null; customization_data?: any }>,
) {
  // First delete existing items
  const { error: deleteError } = await supabase.from("outfit_items").delete().eq("outfit_id", outfitId)

  if (deleteError) {
    console.error("Error removing existing outfit items:", deleteError)
    throw deleteError
  }

  // Then add new items
  if (items.length > 0) {
    const itemsToInsert = items.map((item) => ({
      outfit_id: outfitId,
      product_id: item.product_id,
      position_data: item.position_data || null,
      customization_data: item.customization_data || null,
    }))

    const { error: insertError } = await supabase.from("outfit_items").insert(itemsToInsert)

    if (insertError) {
      console.error("Error adding new outfit items:", insertError)
      throw insertError
    }
  }

  return true
}
