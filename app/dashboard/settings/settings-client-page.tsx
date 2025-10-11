"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import SettingsTabs from "@/components/profile/settings-tabs"
import Footer from "@/components/footer"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function DashboardSettingsClientPage() {
  const { user, profile, updateProfile, refreshProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    bio: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
    website: "",
  })

  // Settings state
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    public_profile: true,
    show_activity: true,
    marketing_emails: false,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "",
        phone: profile.phone || "",
        website: profile.website || "",
      })
      setImagePreview(profile.avatar_url)
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      let avatarUrl = profile?.avatar_url

      // Handle image upload if there's a new image
      if (imagePreview && imagePreview !== profile?.avatar_url) {
        avatarUrl = imagePreview
      }

      // Update profile
      const { error } = await updateProfile({
        ...formData,
        avatar_url: avatarUrl,
      })

      if (error) {
        throw new Error(error)
      }

      // Refresh the profile to get latest data
      await refreshProfile()

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    // In a real app, you'd save these to a user_settings table
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    })
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard Settings</h1>
            <p className="text-zinc-400">Manage your account settings and preferences</p>
          </div>

          <SettingsTabs />
        </div>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
