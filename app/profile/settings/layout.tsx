import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Profile Settings - 3D Outfit Builder",
  description: "Manage your profile settings and preferences",
}

export default function ProfileSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
