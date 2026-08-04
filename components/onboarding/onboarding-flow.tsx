"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload,
  User as UserIcon,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  Heart,
  Palette,
  Eye,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"



// Zod schema for validations
const onboardingSchema = z.object({
  // Step 1
  full_name: z
    .string()
    .min(1, "Full Name is required")
    .max(100, "Full Name must be at most 100 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  phone: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  avatar_url: z.string().optional(),

  // Shipping fields (validated programmatically if step is not skipped)
  shipping_full_name: z.string().optional(),
  shipping_phone: z.string().optional(),
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
})

type OnboardingFormData = z.infer<typeof onboardingSchema>

export const STYLES = ["Casual", "Formal", "Streetwear", "Activewear", "Bohemian", "Minimalist", "Vintage", "Preppy", "Gothic", "Business Casual"]
export const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#000080" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Grey", hex: "#808080" },
  { name: "Brown", hex: "#A52A2A" },
  { name: "Red", hex: "#FF0000" },
  { name: "Pink", hex: "#FFC0CB" },
  { name: "Green", hex: "#008000" },
  { name: "Yellow", hex: "#FFFF00" },
  { name: "Purple", hex: "#800080" },
  { name: "Orange", hex: "#FFA500" },
]
export const CATEGORIES = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Accessories", "Bags", "Athleisure"]
export const OCCASIONS = ["Everyday", "Work/Office", "Going Out", "Formal Events", "Sports/Gym", "Beach", "Travel", "Date Night"]
export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
export const SHOE_SIZES = ["5", "6", "7", "8", "9", "10", "11", "12", "13"]

const STEPS = [
  { id: 0, title: "Welcome", description: "Start your fashion journey", icon: Sparkles },
  { id: 1, title: "Basic Profile", description: "Tell us about yourself", icon: UserIcon },
  { id: 2, title: "Shipping Address", description: "For seamless checkout", icon: MapPin },
  { id: 3, title: "Style Preferences", description: "Seed recommendations", icon: Heart },
  { id: 4, title: "Profile Picture", description: "Add a photo", icon: Camera },
  { id: 5, title: "Completion", description: "You are all set!", icon: Check },
]

export default function OnboardingFlow() {
  const { user, completeOnboarding, updateProfile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Skip States (Tracks if optional steps were explicitly skipped)
  const [skippedAddress, setSkippedAddress] = useState(false)
  const [skippedPreferences, setSkippedPreferences] = useState(false)

  // Preferences State
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])

  // Avatar Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  const supabase = getSupabaseClient()

  // react-hook-form Setup
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      gender: "Prefer not to say",
      bio: "",
      shipping_full_name: "",
      shipping_phone: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
    },
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Pre-populate username and full name from auth credentials
    if (user.email) {
      const emailPrefix = user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
      setValue("username", emailPrefix)
    }
    if (user.user_metadata?.full_name) {
      setValue("full_name", user.user_metadata.full_name)
    }
  }, [user, router, setValue])

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    if (!supabase || !user) return true
    setCheckingUsername(true)
    try {
      const { data: existing, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username uniqueness:", error)
        return true
      }
      return !existing
    } catch (e) {
      return true
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      const isStep1Valid = await trigger(["full_name", "username", "bio", "phone", "gender"])
      if (!isStep1Valid) return

      // Validate username uniqueness dynamically
      const usernameVal = getValues("username").trim()
      const isUnique = await checkUsernameUniqueness(usernameVal)
      if (!isUnique) {
        setError("username", { type: "manual", message: "This username is already taken. Please choose another." })
        return
      }

      // Pre-fill Step 2 values using values from Step 1
      setValue("shipping_full_name", getValues("full_name"))
      setValue("shipping_phone", getValues("phone"))

      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      if (!skippedAddress) {
        let isStep2Valid = true
        const deliveryName = getValues("shipping_full_name")?.trim()
        const line1 = getValues("address_line_1")?.trim()
        const cty = getValues("city")?.trim()
        const cntry = getValues("country")?.trim()

        if (!deliveryName) {
          setError("shipping_full_name", { type: "manual", message: "Delivery name is required" })
          isStep2Valid = false
        }
        if (!line1) {
          setError("address_line_1", { type: "manual", message: "Street address is required" })
          isStep2Valid = false
        }
        if (!cty) {
          setError("city", { type: "manual", message: "City is required" })
          isStep2Valid = false
        }
        if (!cntry) {
          setError("country", { type: "manual", message: "Country is required" })
          isStep2Valid = false
        }

        if (!isStep2Valid) return
      }

      setCurrentStep(3)
      return
    }

    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleTogglePreference = (val: string, category: "styles" | "categories" | "occasions" | "sizes") => {
    const stateMap = {
      styles: { get: selectedStyles, set: setSelectedStyles },
      categories: { get: selectedCategories, set: setSelectedCategories },
      occasions: { get: selectedOccasions, set: setSelectedOccasions },
      sizes: { get: selectedSizes, set: setSelectedSizes },
    }
    const target = stateMap[category]
    if (target.get.includes(val)) {
      target.set(target.get.filter((item) => item !== val))
    } else {
      target.set([...target.get, val])
    }
  }

  const handleToggleColor = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorName))
    } else {
      setSelectedColors([...selectedColors, colorName])
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user || !supabase) return null

    setUploading(true)
    try {
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Continuing setup without picture.",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleHardSkip = async () => {
    if (!user) return
    setLoading(true)
    try {
      const usernameVal = user.email?.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || `user_${Date.now()}`
      const defaultProfile = {
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Cosmic Stylist",
        username: usernameVal,
      }

      const result = await completeOnboarding(defaultProfile)
      if (result.success) {
        toast({
          title: "Welcome!",
          description: "Onboarding skipped. You can configure your profile details later in Settings.",
        })
        router.push("/dashboard")
      } else {
        throw new Error(result.error || "Failed to skip onboarding")
      }
    } catch (error) {
      console.error("Error skipping onboarding:", error)
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onFormSubmit = async (data: OnboardingFormData) => {
    if (!user || !supabase) return

    setLoading(true)
    try {
      console.log("STEP 1 - Starting onboarding submission")

      // STEP 2 - Updating profile
      console.log("STEP 2 - Updating profile")
      const basicProfileUpdates = {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio || undefined,
        phone: data.phone || undefined,
      }
      const profileResult = await updateProfile(basicProfileUpdates)
      if (!profileResult.success) {
        console.error("STEP 2 - Profile update failed:", profileResult.error)
        throw new Error(profileResult.error || "Profile update failed")
      }

      // STEP 3 - Profile updated
      console.log("STEP 3 - Profile updated")

      // STEP 4 - Preparing address payload
      console.log("STEP 4 - Preparing address payload")
      let addressData: any = null
      if (!skippedAddress && data.address_line_1) {
        addressData = {
          user_id: user.id,
          full_name: data.shipping_full_name || data.full_name,
          phone: data.shipping_phone || null,
          address_line_1: data.address_line_1,
          address_line_2: data.address_line_2 || null,
          city: data.city || "",
          state: data.state || null,
          country: data.country || "",
          postal_code: data.postal_code || null,
          is_default: true,
        }
      }

      // STEP 5 - Address payload
      console.log("STEP 5 - Address payload:")
      console.log(addressData)

      // STEP 6 & 7 - Get auth session info
      const { data: sessionData } = await supabase.auth.getSession()
      console.log("STEP 6 - Current authenticated user:")
      console.log(sessionData?.session?.user)

      console.log("STEP 7 - Current auth session:")
      console.log(sessionData?.session)
      console.log("sessionData:", sessionData)
      console.log("sessionData.session:", sessionData?.session)
      console.log("sessionData.session?.user:", sessionData?.session?.user)
      console.log("sessionData.session?.user?.id:", sessionData?.session?.user?.id)

      // STEP 8 - Inserting into user_addresses
      if (addressData) {
        console.log("STEP 8 - Inserting into user_addresses")
        const insertResult = await supabase.from("user_addresses").insert(addressData)

        // STEP 9 - Insert response
        console.log("STEP 9 - Insert response:")
        console.log("data:", insertResult.data)
        console.log("error:", insertResult.error)

        if (insertResult.error) {
          console.log("=== DETAILED ERROR INSPECTION (STEP 9) ===")
          console.dir(insertResult.error, { depth: null })
          console.log("Object.keys:", Object.keys(insertResult.error))
          console.log("JSON.stringify:", JSON.stringify(insertResult.error))
          console.log("typeof error:", typeof insertResult.error)
          try {
            console.log("error.constructor.name:", insertResult.error.constructor?.name)
          } catch (e) {
            console.log("error.constructor.name lookup failed")
          }

          // Step 5: SELECT check
          console.log("STEP 5 check - running SELECT check on user_addresses")
          const selectCheck = await supabase.from("user_addresses").select("*").eq("user_id", user.id)
          console.log("SELECT check data:", selectCheck.data)
          console.log("SELECT check error:", selectCheck.error)

          throw insertResult.error
        }
      } else {
        console.log("STEP 8/9 - Skipped address insert because no address data was provided")
      }

      // STEP 10 - Updating preferences
      console.log("STEP 10 - Updating preferences")
      const stylePrefs = {
        user_id: user.id,
        preferred_styles: skippedPreferences ? [] : selectedStyles,
        preferred_colors: skippedPreferences ? [] : selectedColors,
        preferred_categories: skippedPreferences ? [] : selectedCategories,
        preferred_occasions: skippedPreferences ? [] : selectedOccasions,
        preferred_sizes: skippedPreferences ? [] : selectedSizes,
      }
      const prefResult = await supabase.from("user_preferences").upsert(stylePrefs, { onConflict: "user_id" })
      console.log("STEP 10 - Preferences upsert response error:", prefResult.error)
      if (prefResult.error) {
        throw prefResult.error
      }

      // STEP 11 - Uploading avatar
      console.log("STEP 11 - Uploading avatar")
      let finalAvatarUrl = ""
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl
          console.log("STEP 11 - Avatar uploaded successfully:", finalAvatarUrl)
        }
      } else {
        console.log("STEP 11 - No avatar file to upload")
      }

      // STEP 12 - Completing onboarding
      console.log("STEP 12 - Completing onboarding")
      const finalProfileUpdates: any = {}
      if (finalAvatarUrl) {
        finalProfileUpdates.avatar_url = finalAvatarUrl
      }
      if (addressData) {
        finalProfileUpdates.street_address = addressData.address_line_1
        finalProfileUpdates.city = addressData.city
        finalProfileUpdates.state = addressData.state
        finalProfileUpdates.country = addressData.country
        finalProfileUpdates.postal_code = addressData.postal_code
      }

      const completeResult = await completeOnboarding(finalProfileUpdates)
      console.log("STEP 12 - completeOnboarding response success:", completeResult.success, "error:", completeResult.error)
      if (!completeResult.success) {
        throw new Error(completeResult.error || "Onboarding completion failed")
      }

      toast({
        title: "Welcome!",
        description: "Setup completed successfully.",
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error("========== ONBOARDING CATCH BLOCK ==========")
      console.dir(error, { depth: null })
      if (error) {
        console.log("Object.keys(error):", Object.keys(error))
        console.log("JSON.stringify(error):", JSON.stringify(error))
        console.log("typeof error:", typeof error)
        try {
          console.log("error.constructor.name:", error.constructor?.name)
        } catch (e) {}
      }

      // Format custom message if it's the shipping address error
      let displayError = error?.message || "An error occurred completing your setup. Please try again."
      if (error && error.message === undefined && typeof error === "object") {
        displayError = `Failed to save shipping address: ${JSON.stringify(error)}`
      } else if (error && error.message) {
        displayError = `Failed to save shipping address: ${error.message}`
      }

      toast({
        title: "Setup failed",
        description: displayError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header indicator */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
              Complete Your Setup
            </h1>
            <p className="text-zinc-400">Let's craft your cosmic style identity</p>

            <div className="space-y-2">
              <Progress value={progress} className="h-1 bg-[#1A1A3A] [&>div]:bg-[#00C4B4]" />
              <div className="flex justify-between text-xs text-zinc-500 px-1">
                <span>Step {currentStep} of 5</span>
                <span>{STEPS[currentStep].title}</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Step Wizard Card */}
          <Card className="bg-[#1A1A1A]/85 border-[#00C4B4]/20 backdrop-blur-md shadow-2xl text-white">
            
            {/* STEP 0: WELCOME SCREEN */}
            {currentStep === 0 && (
              <div className="py-8 px-6 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#00C4B4]/10 flex items-center justify-center border border-[#00C4B4]/30 animate-pulse">
                  <Sparkles className="w-8 h-8 text-[#00C4B4]" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
                    Welcome to Cosmic Outfits
                  </h1>
                  <p className="text-zinc-300 max-w-md mx-auto text-sm md:text-base">
                    Let's personalize your experience. We'll ask you a few quick questions to help create a better fashion experience for you.
                  </p>
                </div>

                <div className="pt-4 max-w-sm mx-auto space-y-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-95 text-white font-semibold py-6 rounded-xl border-0 shadow-lg shadow-[#00C4B4]/15 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Let's Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                  
                  <div className="pt-2 text-sm text-zinc-500">
                    <button
                      type="button"
                      onClick={handleHardSkip}
                      disabled={loading}
                      className="hover:text-white transition-colors underline bg-transparent border-0 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Skipping..." : "Skip for now, I'll do this later"}
                    </button>
                  </div>
                  
                  <p className="text-xs text-zinc-500 pt-2">Takes about 2 minutes</p>
                </div>
              </div>
            )}

            {/* STEP 1: BASIC PROFILE */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <UserIcon className="w-5 h-5 text-[#00C4B4]" /> Personal Profile
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Configure your public credentials and gender settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        {...register("full_name")}
                        placeholder="Enter your name"
                        className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4] ${errors.full_name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.full_name && <p className="text-xs text-red-400">{errors.full_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        {...register("username")}
                        placeholder="Choose a username"
                        className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] focus-visible:border-[#00C4B4] ${errors.username ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="e.g. +1234567890"
                        className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        {...register("gender")}
                        className="w-full h-10 px-3 rounded-md bg-[#0A0A1A] border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-[#00C4B4] focus:border-[#00C4B4] text-sm"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Introduce yourself to the Cosmic fashion community..."
                      rows={3}
                      className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.bio ? "border-red-500" : ""}`}
                    />
                    {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
                  </div>
                </CardContent>
              </>
            )}

            {/* STEP 2: SHIPPING ADDRESS */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <MapPin className="w-5 h-5 text-[#00C4B4]" /> Shipping Address
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => {
                        setSkippedAddress(true)
                        clearErrors(["shipping_full_name", "address_line_1", "city", "country"])
                        setCurrentStep(3)
                      }}
                      className="text-sm text-[#00C4B4] hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Skip for now, I'll add my address later
                    </button>
                  </div>
                  <CardDescription className="text-zinc-400">Specify your default delivery details for ordering</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_full_name">Recipient Name *</Label>
                      <Input
                        id="shipping_full_name"
                        {...register("shipping_full_name")}
                        placeholder="Recipient full name"
                        className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.shipping_full_name ? "border-red-500" : ""}`}
                      />
                      {errors.shipping_full_name && <p className="text-xs text-red-400">{errors.shipping_full_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping_phone">Phone Number</Label>
                      <Input
                        id="shipping_phone"
                        type="tel"
                        {...register("shipping_phone")}
                        placeholder="Delivery phone (optional)"
                        className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line_1">Street Address *</Label>
                    <Input
                      id="address_line_1"
                      {...register("address_line_1")}
                      placeholder="123 Cosmic Way"
                      className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.address_line_1 ? "border-red-500" : ""}`}
                    />
                    {errors.address_line_1 && <p className="text-xs text-red-400">{errors.address_line_1.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_line_2">Apartment, Suite, Unit</Label>
                    <Input
                      id="address_line_2"
                      {...register("address_line_2")}
                      placeholder="Apt 4B (Optional)"
                      className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Neo City"
                        className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.city ? "border-red-500" : ""}`}
                      />
                      {errors.city && <p className="text-xs text-red-400">{errors.city.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="Space Coast"
                        className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal / ZIP Code</Label>
                      <Input
                        id="postal_code"
                        {...register("postal_code")}
                        placeholder="12345"
                        className="bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        {...register("country")}
                        placeholder="Earth"
                        className={`bg-[#0A0A1A] border-zinc-800 text-white focus-visible:ring-[#00C4B4] ${errors.country ? "border-red-500" : ""}`}
                      />
                      {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
                    </div>
                  </div>
                </CardContent>
              </>
            )}

            {/* STEP 3: STYLE PREFERENCES */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <Heart className="w-5 h-5 text-[#00C4B4]" /> Style Preferences
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => {
                        setSkippedPreferences(true)
                        setCurrentStep(4)
                      }}
                      className="text-sm text-[#00C4B4] hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Skip for now, I'll add my preferences later
                    </button>
                  </div>
                  <CardDescription className="text-zinc-400">Help custom-tailor recommendations to your aesthetics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  
                  {/* Styles */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Preferred Styles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map((style) => {
                        const selected = selectedStyles.includes(style)
                        return (
                          <button
                            type="button"
                            key={style}
                            onClick={() => handleTogglePreference(style, "styles")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                              selected
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

                  {/* Colors */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1">
                      <Palette className="w-4 h-4" /> Favorite Colors
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => {
                        const selected = selectedColors.includes(color.name)
                        const isWhite = color.hex === "#FFFFFF"
                        return (
                          <button
                            type="button"
                            key={color.name}
                            onClick={() => handleToggleColor(color.name)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 relative group cursor-pointer ${
                              selected ? "border-[#00C4B4] scale-110" : "border-zinc-800 hover:border-zinc-600"
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {selected && (
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

                  {/* Categories */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#00C4B4] flex items-center gap-1">
                      <Eye className="w-4 h-4" /> Preferred Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => {
                        const selected = selectedCategories.includes(cat)
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => handleTogglePreference(cat, "categories")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                              selected
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

                  {/* Occasions */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-[#00C4B4]">Preferred Occasions</h4>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => {
                        const selected = selectedOccasions.includes(occ)
                        return (
                          <button
                            type="button"
                            key={occ}
                            onClick={() => handleTogglePreference(occ, "occasions")}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border cursor-pointer ${
                              selected
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

                  {/* Sizes */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-[#00C4B4]">Preferred Clothing Sizes</h4>
                      <div className="flex flex-wrap gap-2">
                        {CLOTHING_SIZES.map((size) => {
                          const selected = selectedSizes.includes(size)
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePreference(size, "sizes")}
                              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer ${
                                selected
                                  ? "bg-[#007BFF]/20 text-[#007BFF] border-[#007BFF]"
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
                      <h4 className="text-sm font-semibold text-[#00C4B4]">Preferred Shoe Sizes</h4>
                      <div className="flex flex-wrap gap-2">
                        {SHOE_SIZES.map((size) => {
                          const selected = selectedSizes.includes(size)
                          return (
                            <button
                              type="button"
                              key={size}
                              onClick={() => handleTogglePreference(size, "sizes")}
                              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all border cursor-pointer ${
                                selected
                                  ? "bg-[#007BFF]/20 text-[#007BFF] border-[#007BFF]"
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
                </CardContent>
              </>
            )}

            {/* STEP 4: PROFILE PICTURE */}
            {currentStep === 4 && (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                      <Camera className="w-5 h-5 text-[#00C4B4]" /> Profile Picture
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="text-sm text-[#00C4B4] hover:underline bg-transparent border-0 cursor-pointer"
                    >
                      Continue without photo
                    </button>
                  </div>
                  <CardDescription className="text-zinc-400">Add a face to your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 py-6 text-center">
                  <div className="relative inline-block mx-auto">
                    <Avatar className="w-32 h-32 border-4 border-[#00C4B4]/40 shadow-lg shadow-[#00C4B4]/10 bg-[#0A0A1A]">
                      <AvatarImage src={avatarPreview || getValues("avatar_url")} />
                      <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#00C4B4] text-white text-3xl font-bold">
                        {getValues("full_name")
                          ? getValues("full_name")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2.5 bg-[#00C4B4] hover:bg-[#00a395] rounded-full cursor-pointer text-white shadow-md transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <p className="text-sm text-zinc-400">
                      Upload an avatar image (JPEG/PNG/WEBP) smaller than 5MB.
                    </p>
                    <p className="text-xs text-zinc-500 font-normal">
                      Optional — you can always add a profile picture later.
                    </p>
                  </div>
                </CardContent>
              </>
            )}

            {/* STEP 5: FINAL COMPLETION */}
            {currentStep === 5 && (
              <div className="py-10 px-6 text-center space-y-6 animate-fade-in">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight text-white">
                    You're all set, {getValues("full_name").split(" ")[0]}!
                  </h2>
                  <p className="text-zinc-300 max-w-sm mx-auto text-sm font-normal">
                    Your profile setup is complete. Explore our interactive 3D outfit customization tools and custom product gallery.
                  </p>
                </div>

                {/* Profile Summary Preview */}
                <div className="bg-[#0A0A1A]/60 border border-zinc-800 rounded-xl p-4 max-w-md mx-auto grid grid-cols-3 gap-3 items-center text-left text-xs text-zinc-400">
                  <div className="flex flex-col items-center col-span-1 text-center">
                    <Avatar className="w-14 h-14 border border-zinc-800">
                      <AvatarImage src={avatarPreview || getValues("avatar_url")} />
                      <AvatarFallback className="bg-zinc-800 text-white font-semibold">
                        {getValues("full_name")?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-white mt-1 truncate max-w-full">
                      @{getValues("username")}
                    </span>
                  </div>
                  <div className="col-span-2 space-y-1.5 border-l border-zinc-800/80 pl-3">
                    <p>
                      <strong className="text-white">Profile:</strong> Created successfully
                    </p>
                    <p>
                      <strong className="text-white">Address:</strong>{" "}
                      {skippedAddress ? "Skipped" : "Added"}
                    </p>
                    <p>
                      <strong className="text-white">Preferences:</strong>{" "}
                      {skippedPreferences ? "Skipped" : "Preferences saved"}
                    </p>
                    <p>
                      <strong className="text-white">Avatar:</strong>{" "}
                      {avatarFile || getValues("avatar_url") ? "Profile picture added" : "Skipped"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 max-w-sm mx-auto space-y-3">
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full bg-gradient-to-r from-[#00C4B4] to-[#007BFF] hover:opacity-95 text-white font-semibold py-6 rounded-xl border-0 shadow-lg cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving Configuration...
                      </>
                    ) : (
                      "Explore the Platform"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={async () => {
                      await handleSubmit(onFormSubmit)()
                      router.push("/dashboard")
                    }}
                    disabled={loading || uploading}
                    variant="outline"
                    className="w-full border-zinc-800 text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-white"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Footer Navigation Controls */}
            {currentStep > 0 && currentStep < 5 && (
              <div className="flex justify-between items-center py-4 px-6 border-t border-[#00C4B4]/15 bg-[#121225]/40 rounded-b-lg">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={loading}
                  className="border-zinc-800 text-zinc-400 bg-transparent hover:bg-zinc-800 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading || checkingUsername}
                  className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] border-0 hover:opacity-90 text-white shadow-md shadow-[#00C4B4]/10 cursor-pointer"
                >
                  {checkingUsername ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1" /> Checking...
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}

          </Card>
        </form>
      </div>
    </div>
  )
}
