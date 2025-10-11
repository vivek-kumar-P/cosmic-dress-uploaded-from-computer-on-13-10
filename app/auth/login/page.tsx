import LoginForm from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login - Cosmic Outfits",
  description: "Sign in to your Cosmic Outfits account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
