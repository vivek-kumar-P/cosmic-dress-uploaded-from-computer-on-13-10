"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ConfigCheck() {
  const [isConfigured, setIsConfigured] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if Supabase environment variables are configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setIsConfigured(false)
    }
  }, [])

  // Don't render on server side to avoid hydration issues
  if (!isClient) {
    return null
  }

  // Don't show anything if properly configured
  if (isConfigured) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert className="max-w-4xl mx-auto bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <strong>Configuration Required:</strong> Supabase environment variables are missing. Authentication features
            will be disabled until configured.
          </div>
          <div className="flex gap-2 ml-4">
            <Link href="/setup">
              <Button
                variant="outline"
                size="sm"
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100 bg-transparent"
              >
                <Settings className="h-4 w-4 mr-1" />
                Setup Guide
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
