"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User2, Mail, Settings, Bell, Shirt } from "lucide-react"

// Import the SavedOutfits component
import SavedOutfits from "./saved-outfits"

export function ProfileTabs() {
  return (
    <Tabs defaultValue="profile" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="profile" className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-[#00C4B4]">
          <User2 className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="email" className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-[#00C4B4]">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </TabsTrigger>
        <TabsTrigger
          value="settings"
          className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-[#00C4B4]"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-[#00C4B4]"
        >
          <Bell className="h-4 w-4 mr-2" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="outfits" className="data-[state=active]:bg-[#00C4B4]/20 data-[state=active]:text-[#00C4B4]">
          <Shirt className="h-4 w-4 mr-2" />
          Saved Outfits
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="space-y-6">
        <p>This is your profile.</p>
      </TabsContent>
      <TabsContent value="email" className="space-y-6">
        <p>This is your email.</p>
      </TabsContent>
      <TabsContent value="settings" className="space-y-6">
        <p>This is your settings.</p>
      </TabsContent>
      <TabsContent value="notifications" className="space-y-6">
        <p>This is your notifications.</p>
      </TabsContent>
      <TabsContent value="outfits" className="space-y-6">
        <SavedOutfits />
      </TabsContent>
    </Tabs>
  )
}

export default ProfileTabs
