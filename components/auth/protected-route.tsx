"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireOnboarding?: boolean
}

export default function ProtectedRoute({
  children,
  redirectTo = "/auth/login",
  requireOnboarding = true,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Unauthenticated: redirect to login
        router.push(redirectTo)
      } else if (
        requireOnboarding &&
        profile &&
        profile.onboarding_completed !== true
      ) {
        // Authenticated but onboarding incomplete
        router.push("/onboarding")
      } else {
        // Authenticated and onboarded
        setIsChecking(false)
      }
    }
  }, [user, profile, loading, router, redirectTo, requireOnboarding])

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00C4B4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

export { ProtectedRoute }
