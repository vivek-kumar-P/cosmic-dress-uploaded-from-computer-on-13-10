"use client"

import { useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface RealTimeUpdatesProps {
  onProfileUpdate: (profile: any) => void
  onOutfitUpdate: (outfits: any[]) => void
}

export default function RealTimeUpdates({ onProfileUpdate, onOutfitUpdate }: RealTimeUpdatesProps) {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Profile updated:", payload)
          onProfileUpdate(payload.new)
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully",
          })
        },
      )
      .subscribe()

    // Subscribe to outfit changes
    const outfitSubscription = supabase
      .channel("outfit_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "saved_outfits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Outfit updated:", payload)
          // Fetch updated outfits
          fetchUpdatedOutfits()
        },
      )
      .subscribe()

    const fetchUpdatedOutfits = async () => {
      try {
        const { data: outfits } = await supabase.from("saved_outfits").select("*").eq("user_id", user.id)
        if (outfits) {
          onOutfitUpdate(outfits)
        }
      } catch (error) {
        console.error("Error fetching updated outfits:", error)
      }
    }

    return () => {
      profileSubscription.unsubscribe()
      outfitSubscription.unsubscribe()
    }
  }, [user, onProfileUpdate, onOutfitUpdate])

  return null // This component doesn't render anything
}
