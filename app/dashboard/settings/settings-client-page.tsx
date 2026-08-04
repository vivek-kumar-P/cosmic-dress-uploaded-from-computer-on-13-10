"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import SettingsTabs from "@/components/profile/settings-tabs"
import Footer from "@/components/footer"

export default function DashboardSettingsClientPage() {
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
