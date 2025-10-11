import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"
import ProtectedRoute from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          <ProfileHeader />
          <ProfileTabs />
        </div>
      </main>
    </ProtectedRoute>
  )
}
