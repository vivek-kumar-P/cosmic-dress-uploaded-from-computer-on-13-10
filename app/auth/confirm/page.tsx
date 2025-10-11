"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Loader } from "lucide-react"
import Link from "next/link"

export default function ConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "signup") {
          setStatus("error")
          setMessage("Invalid confirmation link")
          return
        }

        // Verify the token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        })

        if (error) {
          console.error("Email confirmation error:", error)
          setStatus("error")
          setMessage(error.message || "Failed to confirm email")
          return
        }

        if (data.user) {
          setStatus("success")
          setMessage("Email confirmed successfully! You can now sign in.")

          // Redirect to login page after 3 seconds
          setTimeout(() => {
            router.push("/auth/login?confirmed=true")
          }, 3000)
        } else {
          setStatus("error")
          setMessage("Email confirmation failed")
        }
      } catch (error) {
        console.error("Error during email confirmation:", error)
        setStatus("error")
        setMessage("An unexpected error occurred")
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === "loading" && "Confirming Email..."}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Failed"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Please wait while we confirm your email address"}
            {status === "success" && "Your account has been successfully verified"}
            {status === "error" && "There was a problem confirming your email"}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <div className="flex justify-center">
              <Loader className="h-8 w-8 animate-spin text-[#00C4B4]" />
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
              <p className="text-green-200">{message}</p>
              <p className="text-sm text-zinc-400">Redirecting to login page...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="h-12 w-12 text-red-400" />
              </div>
              <p className="text-red-200">{message}</p>
              <div className="space-y-2">
                <Button asChild className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/auth/register">Create New Account</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
