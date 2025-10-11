"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const supabase = getSupabaseClient()
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setStatus("error")
      setMessage("Supabase is not configured")
      return
    }
    setStatus("loading")
    setMessage("")
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) {
      setStatus("error")
      setMessage(error.message)
      return
    }
    setStatus("success")
    setMessage("If the email exists, a reset link has been sent.")
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Forgot password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      {message && (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-green-600"}`}>{message}</p>
      )}
    </div>
  )
}
