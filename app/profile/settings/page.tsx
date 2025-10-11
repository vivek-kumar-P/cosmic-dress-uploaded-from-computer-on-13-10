import ProtectedRoute from "@/components/auth/protected-route"
import SettingsTabs from "@/components/profile/settings-tabs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Profile Settings - 3D Outfit Builder",
  description: "Manage your profile settings and preferences",
}

export default function ProfileSettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-zinc-400">Manage your account settings and preferences</p>
            </div>
            <SettingsTabs />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
