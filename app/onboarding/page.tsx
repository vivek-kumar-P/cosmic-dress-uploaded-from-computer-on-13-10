import { Suspense } from "react"
import OnboardingFlow from "@/components/onboarding/onboarding-flow"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading onboarding...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingFlow />
    </Suspense>
  )
}
