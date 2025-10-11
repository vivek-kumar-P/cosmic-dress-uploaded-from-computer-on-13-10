import type { Metadata } from "next"
import DashboardSettingsClientPage from "./settings-client-page"

export const metadata: Metadata = {
  title: "Dashboard Settings - Cosmic Outfits",
  description: "Manage your account settings and preferences",
}

export default function DashboardSettingsPage() {
  return <DashboardSettingsClientPage />
}
