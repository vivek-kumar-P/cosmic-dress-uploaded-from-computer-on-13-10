import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Login - Cosmic Outfits",
  description: "Sign in to your Cosmic Outfits account",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
