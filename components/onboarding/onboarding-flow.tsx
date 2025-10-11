"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User, MapPin, Camera, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface OnboardingData {
  full_name: string
  username: string
  bio: string
  phone: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  avatar_url: string
}

const STEPS = [
  { id: 1, title: "Personal Info", description: "Tell us about yourself", icon: User },
  { id: 2, title: "Address", description: "Where are you located?", icon: MapPin },
  { id: 3, title: "Profile Picture", description: "Add your photo", icon: Camera },
]

export default function OnboardingFlow() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    full_name: "",
    username: "",
    bio: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    avatar_url: "",
  })
  const [errors, setErrors] = useState<Partial<OnboardingData>>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    // Pre-populate username from email
    if (user.email && !data.username) {
      setData((prev) => ({
        ...prev,
        username: user.email.split("@")[0],
      }))
    }
  }, [user, router, data.username])

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<OnboardingData> = {}

    if (step === 1) {
      if (!data.full_name.trim()) newErrors.full_name = "Full name is required"
      if (!data.username.trim()) newErrors.username = "Username is required"
      if (data.username.length < 3) newErrors.username = "Username must be at least 3 characters"
    }

    if (step === 2) {
      if (!data.address.trim()) newErrors.address = "Address is required"
      if (!data.city.trim()) newErrors.city = "City is required"
      if (!data.country.trim()) newErrors.country = "Country is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
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

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null

    setUploading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      // Upload avatar if provided
      let avatarUrl = data.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          username: data.username,
          bio: data.bio || null,
          phone: data.phone || null,
          address: data.address,
          city: data.city,
          state: data.state || null,
          postal_code: data.postal_code || null,
          country: data.country,
          avatar_url: avatarUrl || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Profile update error:", error)
        throw error
      }

      // Update auth context
      if (updateProfile) {
        await updateProfile()
      }

      toast({
        title: "Welcome!",
        description: "Your profile has been set up successfully.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 mb-6">Let's get you set up with a personalized experience</p>

          <div className="mb-4">
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex justify-center space-x-8">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }
                  `}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={data.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.full_name ? "border-red-500" : ""}
                    />
                    {errors.full_name && <p className="text-sm text-red-500 mt-1">{errors.full_name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={data.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Choose a username"
                      className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={data.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your street address"
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={data.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Your city"
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={data.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="State or province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      value={data.postal_code}
                      onChange={(e) => handleInputChange("postal_code", e.target.value)}
                      placeholder="Postal/ZIP code"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={data.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Your country"
                      className={errors.country ? "border-red-500" : ""}
                    />
                    {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Picture */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mb-4">
                    <Avatar className="w-32 h-32 mx-auto">
                      <AvatarImage src={avatarPreview || data.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {data.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div>
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Choose Photo
                          </>
                        )}
                      </div>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">Upload a profile picture (optional). Max size: 5MB</p>
                </div>

                <div className="text-center">
                  <p className="text-gray-600">You can skip this step and add a profile picture later if you prefer.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || loading}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={loading} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || uploading} className="flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
