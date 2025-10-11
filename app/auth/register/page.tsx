import RegisterForm from "@/components/auth/register-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register - Cosmic Outfits",
  description: "Create a new Cosmic Outfits account",
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  )
}
