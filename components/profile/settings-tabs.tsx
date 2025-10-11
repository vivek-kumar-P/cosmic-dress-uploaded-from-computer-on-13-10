"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { Loader, Camera, Save, User, MapPin, Shield, Bell } from "lucide-react"
import { toast } from "sonner"

export default function SettingsTabs() {
  const { user, profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    website: profile?.website || "",
    street_address: profile?.street_address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    postal_code: profile?.postal_code || "",
    country: profile?.country || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        toast.success("Profile updated successfully!")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB")
      return
    }

    setIsLoading(true)
    try {
      // Convert to base64 for now (in production, you'd upload to storage)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const result = await updateProfile({ avatar_url: base64 })
        if (result.success) {
          toast.success("Profile picture updated!")
        } else {
          toast.error("Failed to update profile picture")
        }
        setIsLoading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error("Failed to upload image")
      setIsLoading(false)
    }
  }

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader className="h-8 w-8 animate-spin text-[#00C4B4]" />
      </div>
    )
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1A] border-[#00C4B4]/30">
        <TabsTrigger value="profile" className="data-[state=active]:bg-[#00C4B4]/20">
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="address" className="data-[state=active]:bg-[#00C4B4]/20">
          <MapPin className="h-4 w-4 mr-2" />
          Address
        </TabsTrigger>
        <TabsTrigger value="security" className="data-[state=active]:bg-[#00C4B4]/20">
          <Shield className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00C4B4]/20">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
            <CardDescription>Update your personal information and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-[#00C4B4]/30">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                  <AvatarFallback className="bg-[#0A0A1A] text-[#00C4B4] text-xl">
                    {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-[#00C4B4] text-black p-1.5 rounded-full cursor-pointer hover:bg-[#00C4B4]/80 transition-colors"
                >
                  <Camera className="h-3 w-3" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{profile.full_name || "User"}</h3>
                <p className="text-zinc-400">@{profile.username || "username"}</p>
                <p className="text-sm text-zinc-500">{user.email}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-white">
                  Website
                </Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-white">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-[#0A0A1A] border-zinc-700 text-white min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="address" className="space-y-6">
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white">Address Information</CardTitle>
            <CardDescription>Update your address for shipping and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street_address" className="text-white">
                Street Address
              </Label>
              <Input
                id="street_address"
                value={profileData.street_address}
                onChange={(e) => handleInputChange("street_address", e.target.value)}
                className="bg-[#0A0A1A] border-zinc-700 text-white"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-white">
                  City
                </Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="New York"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state" className="text-white">
                  State/Province
                </Label>
                <Input
                  id="state"
                  value={profileData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code" className="text-white">
                  Postal Code
                </Label>
                <Input
                  id="postal_code"
                  value={profileData.postal_code}
                  onChange={(e) => handleInputChange("postal_code", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="10001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">
                  Country
                </Label>
                <Input
                  id="country"
                  value={profileData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                  placeholder="United States"
                />
              </div>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Address
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-6">
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white">Security Settings</CardTitle>
            <CardDescription>Manage your account security and password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Email Address</h4>
                  <p className="text-zinc-400 text-sm">{user.email}</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Change Email
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Password</h4>
                  <p className="text-zinc-400 text-sm">Last updated 30 days ago</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                  <p className="text-zinc-400 text-sm">Add an extra layer of security</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white">Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Email Notifications</h4>
                  <p className="text-zinc-400 text-sm">Receive updates about your orders and account</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Push Notifications</h4>
                  <p className="text-zinc-400 text-sm">Get notified about new features and updates</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-700">
                <div>
                  <h4 className="text-white font-medium">Marketing Communications</h4>
                  <p className="text-zinc-400 text-sm">Receive promotional emails and offers</p>
                </div>
                <Button variant="outline" className="border-zinc-700 bg-transparent text-white">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
