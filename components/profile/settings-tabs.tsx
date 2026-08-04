"use client"

import type React from "react"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import AddressModal from "@/components/profile/address-modal"
import {
  STYLES,
  COLORS,
  CATEGORIES,
  OCCASIONS,
  CLOTHING_SIZES,
  SHOE_SIZES,
} from "@/components/onboarding/onboarding-flow"
import {
  Loader,
  Camera,
  Save,
  User,
  MapPin,
  Shield,
  Bell,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Check,
  Palette,
  Sparkles,
  Eye,
  Shirt,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { UserAddress } from "@/types/app"

// Reusable Skeleton loaders for pristine UX
function ProfileSkeleton() {
  return (
    <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/20 backdrop-blur-lg">
      <CardHeader>
        <Skeleton className="h-6 w-48 bg-zinc-800" />
        <Skeleton className="h-4 w-72 mt-2 bg-zinc-800" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6">
          <Skeleton className="h-24 w-24 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20 bg-zinc-800" />
              <Skeleton className="h-10 w-full bg-zinc-800" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12 bg-zinc-800" />
          <Skeleton className="h-24 w-full bg-zinc-800" />
        </div>
      </CardContent>
    </Card>
  )
}

function AddressListSkeleton() {
  return (
    <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/20 backdrop-blur-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 bg-zinc-800" />
          <Skeleton className="h-4 w-60 bg-zinc-800" />
        </div>
        <Skeleton className="h-10 w-28 bg-zinc-800" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-zinc-800 space-y-3">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-3 w-48 bg-zinc-800" />
            <Skeleton className="h-3 w-40 bg-zinc-800" />
            <Skeleton className="h-8 w-full bg-zinc-800 mt-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PreferencesSkeleton() {
  return (
    <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/20 backdrop-blur-lg">
      <CardHeader>
        <Skeleton className="h-6 w-40 bg-zinc-800" />
        <Skeleton className="h-4 w-72 mt-2 bg-zinc-800" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <div className="flex flex-wrap gap-2">
              {[...Array(6)].map((_, j) => (
                <Skeleton key={j} className="h-8 w-20 rounded-full bg-zinc-800" />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function SettingsTabs() {
  const { user, profile, updateProfile, refreshProfile } = useAuth()
  const supabase = getSupabaseClient()

  const [isLoading, setIsLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Profile fields state
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
  })

  // Address tab state
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [addressError, setAddressError] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null)

  // Preferences tab state
  const [loadingPreferences, setLoadingPreferences] = useState(false)
  const [preferencesError, setPreferencesError] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  // Sync profile fields from auth context
  useEffect(() => {
    if (!profile) return
    setProfileData({
      full_name: profile.full_name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      phone: profile.phone || "",
      website: profile.website || "",
    })
  }, [profile])

  // Fetch all addresses for the current user (Callback memoized to optimize re-renders)
  const fetchAddresses = useCallback(async () => {
    if (!supabase || !user) return
    setLoadingAddresses(true)
    setAddressError(false)
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error
      setAddresses(data || [])
    } catch (err) {
      console.error("Error fetching addresses:", err)
      setAddressError(true)
      toast.error("Failed to load addresses. Please retry.")
    } finally {
      setLoadingAddresses(false)
    }
  }, [supabase, user])

  // Preferences: Fetch (Callback memoized to optimize re-renders)
  const fetchPreferences = useCallback(async () => {
    if (!supabase || !user) return
    setLoadingPreferences(true)
    setPreferencesError(false)
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setSelectedStyles(data.preferred_styles || [])
        setSelectedColors(data.preferred_colors || [])
        setSelectedCategories(data.preferred_categories || [])
        setSelectedOccasions(data.preferred_occasions || [])
        setSelectedSizes(data.preferred_sizes || [])
      }
    } catch (err) {
      console.error("Error fetching preferences:", err)
      setPreferencesError(true)
      toast.error("Failed to load style preferences. Please retry.")
    } finally {
      setLoadingPreferences(false)
    }
  }, [supabase, user])

  // Fetch initial data on component mount
  useEffect(() => {
    if (user) {
      fetchAddresses()
      fetchPreferences()
    }
  }, [user, fetchAddresses, fetchPreferences])

  const handleInputChange = useCallback((field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Save basic profile info
  const handleSaveProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        await refreshProfile()
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }, [profileData, updateProfile, refreshProfile])

  // Refactored Avatar Upload: directly to Supabase Storage
  const handleAvatarUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !supabase || !user) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB")
      return
    }

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      const result = await updateProfile({ avatar_url: publicUrl })
      if (result.success) {
        await refreshProfile()
        toast.success("Profile picture updated!")
      } else {
        toast.error("Failed to update profile picture")
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error)
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploadingAvatar(false)
    }
  }, [supabase, user, updateProfile, refreshProfile])

  // Update profile default address properties for backward compatibility
  const updateProfileAddressSync = useCallback(async (address: UserAddress) => {
    await updateProfile({
      street_address: address.address_line_1,
      city: address.city,
      state: address.state || "",
      country: address.country,
      postal_code: address.postal_code || "",
    })
    await refreshProfile()
  }, [updateProfile, refreshProfile])

  // Find the current default address and sync it to profile, or clear it if none exist
  const syncCurrentDefaultAddress = useCallback(async () => {
    if (!supabase || !user) return
    try {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .maybeSingle()

      if (error) throw error

      if (data) {
        await updateProfileAddressSync(data)
      } else {
        // Reset legacy columns if no default remains
        await updateProfile({
          street_address: "",
          city: "",
          state: "",
          country: "",
          postal_code: "",
        })
        await refreshProfile()
      }
    } catch (err) {
      console.error("Error syncing profile address:", err)
    }
  }, [supabase, user, updateProfileAddressSync, updateProfile, refreshProfile])

  // Add or update an address in user_addresses
  const handleSaveAddress = useCallback(async (addressData: UserAddress) => {
    if (!supabase || !user) return
    try {
      if (addressData.id) {
        // Edit
        const { error } = await supabase
          .from("user_addresses")
          .update({
            full_name: addressData.full_name,
            phone: addressData.phone,
            address_line_1: addressData.address_line_1,
            address_line_2: addressData.address_line_2,
            city: addressData.city,
            state: addressData.state,
            country: addressData.country,
            postal_code: addressData.postal_code,
            is_default: addressData.is_default,
          })
          .eq("id", addressData.id)

        if (error) throw error
      } else {
        // Add
        const { error } = await supabase.from("user_addresses").insert({
          user_id: user.id,
          full_name: addressData.full_name,
          phone: addressData.phone,
          address_line_1: addressData.address_line_1,
          address_line_2: addressData.address_line_2,
          city: addressData.city,
          state: addressData.state,
          country: addressData.country,
          postal_code: addressData.postal_code,
          is_default: addressData.is_default,
        })

        if (error) throw error
      }

      await fetchAddresses()

      if (addressData.is_default) {
        await updateProfileAddressSync(addressData)
      } else {
        await syncCurrentDefaultAddress()
      }
    } catch (err: any) {
      console.error("Error saving address:", err)
      toast.error(err.message || "Failed to save address")
      throw err
    }
  }, [supabase, user, fetchAddresses, updateProfileAddressSync, syncCurrentDefaultAddress])

  // Set selected address as default
  const handleSetDefaultAddress = useCallback(async (address: UserAddress) => {
    if (!supabase || !user || !address.id) return
    try {
      const { error } = await supabase
        .from("user_addresses")
        .update({ is_default: true })
        .eq("id", address.id)

      if (error) throw error

      toast.success("Default address updated")
      await fetchAddresses()
      await updateProfileAddressSync(address)
    } catch (err: any) {
      console.error("Error setting default address:", err)
      toast.error(err.message || "Failed to set default address")
    }
  }, [supabase, user, fetchAddresses, updateProfileAddressSync])

  // Delete address
  const handleDeleteAddress = useCallback(async (addressId: string) => {
    if (!supabase || !user) return
    try {
      const addressToDelete = addresses.find((a) => a.id === addressId)
      const { error } = await supabase.from("user_addresses").delete().eq("id", addressId)

      if (error) throw error

      toast.success("Address deleted successfully")
      await fetchAddresses()

      if (addressToDelete?.is_default) {
        await syncCurrentDefaultAddress()
      }
    } catch (err: any) {
      console.error("Error deleting address:", err)
      toast.error(err.message || "Failed to delete address")
    }
  }, [supabase, user, addresses, fetchAddresses, syncCurrentDefaultAddress])

  // Preferences: Toggle
  const handleTogglePreference = useCallback((val: string, category: "styles" | "categories" | "occasions" | "sizes") => {
    const listMap = {
      styles: selectedStyles,
      categories: selectedCategories,
      occasions: selectedOccasions,
      sizes: selectedSizes,
    }
    const setterMap = {
      styles: setSelectedStyles,
      categories: setSelectedCategories,
      occasions: setSelectedOccasions,
      sizes: setSelectedSizes,
    }
    const list = listMap[category]
    const setter = setterMap[category]

    if (list.includes(val)) {
      setter(list.filter((x) => x !== val))
    } else {
      setter([...list, val])
    }
  }, [selectedStyles, selectedCategories, selectedOccasions, selectedSizes])

  const handleToggleColor = useCallback((colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    )
  }, [])

  // Preferences: Save (Upsert)
  const handleSavePreferences = useCallback(async () => {
    if (!supabase || !user) return
    setSavingPreferences(true)
    try {
      const { error } = await supabase.from("user_preferences").upsert(
        {
          user_id: user.id,
          preferred_styles: selectedStyles,
          preferred_colors: selectedColors,
          preferred_sizes: selectedSizes,
          preferred_categories: selectedCategories,
          preferred_occasions: selectedOccasions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

      if (error) throw error
      toast.success("Style preferences saved successfully!")
    } catch (err: any) {
      console.error("Error saving preferences:", err)
      toast.error(err.message || "Failed to save preferences")
    } finally {
      setSavingPreferences(false)
    }
  }, [supabase, user, selectedStyles, selectedColors, selectedSizes, selectedCategories, selectedOccasions])

  const openAddAddressModal = useCallback(() => {
    setEditingAddress(null)
    setIsAddressModalOpen(true)
  }, [])

  const openEditAddressModal = useCallback((address: UserAddress) => {
    setEditingAddress(address)
    setIsAddressModalOpen(true)
  }, [])

  // Memoized styles and color maps to prevent unnecessary chip rebuilds
  const styleChips = useMemo(() => STYLES, [])
  const colorChips = useMemo(() => COLORS, [])
  const categoryChips = useMemo(() => CATEGORIES, [])
  const occasionChips = useMemo(() => OCCASIONS, [])

  if (!user || !profile) {
    return <ProfileSkeleton />
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        {/* Five tab triggers structured responsively */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-[#1A1A1A] border-[#00C4B4]/30 h-auto gap-1 p-1 rounded-xl">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-white py-2.5 rounded-lg text-sm transition-all text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4]"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-white py-2.5 rounded-lg text-sm transition-all text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4]"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Addresses
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-white py-2.5 rounded-lg text-sm transition-all text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4]"
          >
            <Heart className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-white py-2.5 rounded-lg text-sm transition-all text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4]"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-white py-2.5 rounded-lg text-sm transition-all text-zinc-400 col-span-2 md:col-span-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4]"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 mt-4">
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg shadow-xl shadow-black/40">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-zinc-400">Update your personal details and avatar image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar upload section */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-[#00C4B4]/40 shadow-lg shadow-[#00C4B4]/5 bg-[#0A0A1A]">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User profile photo"} />
                    <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#00C4B4] text-white text-2xl font-bold">
                      {profile.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-[#00C4B4] hover:bg-[#00a395] text-black p-2 rounded-full cursor-pointer shadow-md transition-colors"
                    aria-label="Upload profile photo"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      <Camera className="h-4 w-4 text-black" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    disabled={uploadingAvatar}
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{profile.full_name || "Fashion Enthusiast"}</h3>
                  <p className="text-zinc-400 text-sm">@{profile.username || "username"}</p>
                  <p className="text-xs text-zinc-500 mt-1">{user.email}</p>
                </div>
              </div>

              {/* Basic Fields Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-zinc-300">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-zinc-300">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4]"
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4]"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-zinc-300">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                    className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-1 focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4]"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-800 text-white min-h-[100px] focus-visible:ring-1 focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4]"
                  placeholder="Tell us about your style journey..."
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-95 text-white border-0 font-semibold cursor-pointer shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Profile Details
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADDRESSES TAB */}
        <TabsContent value="address" className="space-y-6 mt-4">
          {loadingAddresses ? (
            <AddressListSkeleton />
          ) : addressError ? (
            <Card className="bg-[#1A1A1A]/80 border-red-500/20 backdrop-blur-lg">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-red-400 font-medium">Failed to retrieve shipping addresses.</p>
                <Button
                  onClick={fetchAddresses}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-0 font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Loading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg shadow-xl shadow-black/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-white">Shipping Addresses</CardTitle>
                  <CardDescription className="text-zinc-400">Manage multiple checkout and delivery locations</CardDescription>
                </div>
                <Button
                  onClick={openAddAddressModal}
                  className="bg-[#00C4B4] hover:bg-[#00a395] text-black border-0 font-semibold flex items-center gap-1 cursor-pointer shadow-md shadow-[#00C4B4]/10"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-[#0A0A1A]/30">
                    <MapPin className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium">No saved addresses found</p>
                    <p className="text-zinc-500 text-xs mt-1">Add a shipping address to speed up checkout</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-xl border relative transition-all bg-[#0A0A1A]/40 flex flex-col justify-between ${
                          addr.is_default ? "border-[#00C4B4]/50 shadow-md shadow-[#00C4B4]/5" : "border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{addr.full_name}</span>
                            {addr.is_default && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00C4B4]/15 text-[#00C4B4] border border-[#00C4B4]/30 select-none">
                                Default
                              </span>
                            )}
                          </div>
                          {addr.phone && <p className="text-xs text-zinc-500">{addr.phone}</p>}
                          <p className="text-xs text-zinc-400 font-normal pt-1">
                            {addr.address_line_1}
                            {addr.address_line_2 ? `, ${addr.address_line_2}` : ""}
                          </p>
                          <p className="text-xs text-zinc-400 font-normal">
                            {addr.city}, {addr.state ? `${addr.state}, ` : ""}{addr.country} {addr.postal_code}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-900 mt-4 pt-3">
                          {!addr.is_default ? (
                            <button
                              onClick={() => handleSetDefaultAddress(addr)}
                              className="text-xs font-semibold text-zinc-400 hover:text-[#00C4B4] bg-transparent border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:text-[#00C4B4]"
                              aria-label={`Mark address for ${addr.full_name} as default`}
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-xs text-green-400 font-semibold flex items-center gap-1 select-none">
                              <Check className="w-3.5 h-3.5" /> Primary Address
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAddressModal(addr)}
                              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C4B4]"
                              aria-label={`Edit address for ${addr.full_name}`}
                              title="Edit Address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => addr.id && handleDeleteAddress(addr.id)}
                              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 border-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                              aria-label={`Delete address for ${addr.full_name}`}
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-6 mt-4">
          {loadingPreferences ? (
            <PreferencesSkeleton />
          ) : preferencesError ? (
            <Card className="bg-[#1A1A1A]/80 border-red-500/20 backdrop-blur-lg">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <p className="text-red-400 font-medium">Failed to retrieve style preferences.</p>
                <Button
                  onClick={fetchPreferences}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white border-0 font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Loading
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg shadow-xl shadow-black/40">
              <CardHeader>
                <CardTitle className="text-white">Style Preferences</CardTitle>
                <CardDescription className="text-zinc-400">Configure personal sizing and style identifiers to seed recommendation engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  {/* Preferred Styles */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1 select-none">
                      <Sparkles className="w-4 h-4" /> Preferred Styles
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {styleChips.map((style) => {
                        const isSelected = selectedStyles.includes(style)
                        return (
                          <button
                            type="button"
                            key={style}
                            onClick={() => handleTogglePreference(style, "styles")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C4B4] ${
                              isSelected
                                ? "bg-[#00C4B4]/25 text-[#00C4B4] border-[#00C4B4]"
                                : "bg-[#0A0A1A] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            {style}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Favorite Colors */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1 select-none">
                      <Palette className="w-4 h-4" /> Favorite Colors
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {colorChips.map((color) => {
                        const isSelected = selectedColors.includes(color.name)
                        const isWhite = color.hex === "#FFFFFF"
                        return (
                          <button
                            type="button"
                            key={color.name}
                            onClick={() => handleToggleColor(color.name)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C4B4] ${
                              isSelected ? "border-[#00C4B4] scale-110" : "border-zinc-800/80 hover:border-zinc-600"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            aria-label={`Select color ${color.name}`}
                          >
                            {isSelected && (
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                                  isWhite ? "text-black" : "text-white"
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Preferred Categories */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1 select-none">
                      <Eye className="w-4 h-4" /> Preferred Categories
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {categoryChips.map((cat) => {
                        const isSelected = selectedCategories.includes(cat)
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => handleTogglePreference(cat, "categories")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007BFF] ${
                              isSelected
                                ? "bg-[#007BFF]/25 text-[#007BFF] border-[#007BFF]"
                                : "bg-[#0A0A1A] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Preferred Occasions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1 select-none">
                      <Shirt className="w-4 h-4" /> Preferred Occasions
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {occasionChips.map((occ) => {
                        const isSelected = selectedOccasions.includes(occ)
                        return (
                          <button
                            type="button"
                            key={occ}
                            onClick={() => handleTogglePreference(occ, "occasions")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C4B4] ${
                              isSelected
                                ? "bg-[#00C4B4]/25 text-[#00C4B4] border-[#00C4B4]"
                                : "bg-[#0A0A1A] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                            }`}
                          >
                            {occ}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Clothing & Shoe Sizes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#00C4B4] select-none">Preferred Clothing Size</Label>
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map((size) => {
                          const isSelected = selectedSizes.includes(size)
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePreference(size, "sizes")}
                              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C4B4] ${
                                isSelected
                                  ? "bg-[#00C4B4]/25 text-[#00C4B4] border-[#00C4B4]"
                                  : "bg-[#0A0A1A] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                              }`}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#00C4B4] select-none">Preferred Shoe Size (US)</Label>
                      <div className="flex flex-wrap gap-2">
                        {SHOE_SIZES.map((size) => {
                          const isSelected = selectedSizes.includes(`shoe-${size}`)
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePreference(`shoe-${size}`, "sizes")}
                              className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007BFF] ${
                                isSelected
                                  ? "bg-[#007BFF]/25 text-[#007BFF] border-[#007BFF]"
                                  : "bg-[#0A0A1A] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                              }`}
                            >
                              {size}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900 mt-6">
                    <Button
                      onClick={handleSavePreferences}
                      disabled={savingPreferences}
                      className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-95 text-white border-0 font-semibold shadow-md"
                    >
                      {savingPreferences ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Save Style Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Renders Address Modal overlay */}
      <AddressModal
        isOpen={isAddressModalOpen}
        address={editingAddress}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  )
}
