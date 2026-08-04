"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import LoginForm from "@/components/auth/login-form"
import { Loader2 } from "lucide-react"

function AuthGuardedLogin() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get("next")

  useEffect(() => {
    if (loading) return

    if (user) {
      // User is already authenticated — redirect them away from login
      if (profile?.onboarding_completed === true) {
        const destination =
          nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
            ? nextParam
            : "/dashboard"
        router.replace(destination)
      } else {
        router.replace("/onboarding")
      }
    }
  }, [user, profile, loading, router, nextParam])

  // While auth state is resolving, show a neutral loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00C4B4]" />
      </div>
    )
  }

  // Already authenticated — show loader while redirect executes
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#00C4B4]" />
      </div>
    )
  }

  // Not authenticated — show the login form
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A]">
          <Loader2 className="h-8 w-8 animate-spin text-[#00C4B4]" />
        </div>
      }
    >
      <AuthGuardedLogin />
    </Suspense>
  )
}
