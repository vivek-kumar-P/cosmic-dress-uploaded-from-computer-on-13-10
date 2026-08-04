"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#00C4B4] mb-4" />
          <p className="text-zinc-400">Loading onboarding...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Unauthenticated → redirect to login
        router.push("/auth/login?next=/onboarding")
      } else if (profile?.onboarding_completed === true) {
        // Already onboarded → redirect to dashboard
        router.push("/dashboard")
      } else {
        // Authenticated + not onboarded → show onboarding
        setReady(true)
      }
    }
  }, [user, profile, loading, router])

  if (loading || !ready) {
    return <OnboardingLoading />
  }

  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingFlow />
    </Suspense>
  )
}
