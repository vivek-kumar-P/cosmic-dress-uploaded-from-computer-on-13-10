"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Users, AlertTriangle } from "lucide-react"
import { safeSupabase } from "@/lib/supabase-safe"
import { useAuth } from "@/contexts/auth-context"
import { EnvChecker } from "./env-checker"

interface ConnectionStatus {
  database: "connected" | "disconnected" | "testing" | "not-configured"
  auth: "connected" | "disconnected" | "testing" | "not-configured"
  tables: "connected" | "disconnected" | "testing" | "not-configured"
  rls: "connected" | "disconnected" | "testing" | "not-configured"
}

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    database: "not-configured",
    auth: "not-configured",
    tables: "not-configured",
    rls: "not-configured",
  })
  const [testResults, setTestResults] = useState<string[]>([])
  const { user, isAuthenticated, error: authError } = useAuth()

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDatabaseConnection = async () => {
    if (!safeSupabase.isConfigured || !safeSupabase.client) {
      setStatus((prev) => ({ ...prev, database: "not-configured" }))
      addResult(`❌ Database not configured: ${safeSupabase.error}`)
      return false
    }

    try {
      setStatus((prev) => ({ ...prev, database: "testing" }))
      addResult("Testing database connection...")

      const { data, error } = await safeSupabase.client.from("profiles").select("count").limit(1)

      if (error) {
        throw error
      }

      setStatus((prev) => ({ ...prev, database: "connected" }))
      addResult("✅ Database connection successful")
      return true
    } catch (error: any) {
      setStatus((prev) => ({ ...prev, database: "disconnected" }))
      addResult(`❌ Database connection failed: ${error.message}`)
      return false
    }
  }

  const testAuthConnection = async () => {
    if (!safeSupabase.isConfigured || !safeSupabase.client) {
      setStatus((prev) => ({ ...prev, auth: "not-configured" }))
      addResult(`❌ Auth not configured: ${safeSupabase.error}`)
      return false
    }

    try {
      setStatus((prev) => ({ ...prev, auth: "testing" }))
      addResult("Testing auth connection...")

      const {
        data: { session },
        error,
      } = await safeSupabase.client.auth.getSession()

      if (error) {
        throw error
      }

      setStatus((prev) => ({ ...prev, auth: "connected" }))
      addResult(`✅ Auth connection successful${session ? " (User logged in)" : " (No active session)"}`)
      return true
    } catch (error: any) {
      setStatus((prev) => ({ ...prev, auth: "disconnected" }))
      addResult(`❌ Auth connection failed: ${error.message}`)
      return false
    }
  }

  const testTablesExist = async () => {
    if (!safeSupabase.isConfigured || !safeSupabase.client) {
      setStatus((prev) => ({ ...prev, tables: "not-configured" }))
      addResult(`❌ Tables test not configured: ${safeSupabase.error}`)
      return false
    }

    try {
      setStatus((prev) => ({ ...prev, tables: "testing" }))
      addResult("Testing table existence...")

      const tables = ["profiles", "products", "avatars", "saved_outfits", "categories"]
      const results = []

      for (const table of tables) {
        try {
          const { error } = await safeSupabase.client.from(table).select("*").limit(1)
          if (error && !error.message.includes("permission denied")) {
            throw error
          }
          results.push(`✅ Table '${table}' exists`)
        } catch (error: any) {
          results.push(`❌ Table '${table}' error: ${error.message}`)
        }
      }

      results.forEach((result) => addResult(result))
      setStatus((prev) => ({ ...prev, tables: "connected" }))
      return true
    } catch (error: any) {
      setStatus((prev) => ({ ...prev, tables: "disconnected" }))
      addResult(`❌ Table test failed: ${error.message}`)
      return false
    }
  }

  const testRLSPolicies = async () => {
    if (!safeSupabase.isConfigured || !safeSupabase.client) {
      setStatus((prev) => ({ ...prev, rls: "not-configured" }))
      addResult(`❌ RLS test not configured: ${safeSupabase.error}`)
      return false
    }

    try {
      setStatus((prev) => ({ ...prev, rls: "testing" }))
      addResult("Testing RLS policies...")

      // Test public read access to products
      const { data: products, error: productsError } = await safeSupabase.client.from("products").select("*").limit(1)

      if (productsError) {
        throw new Error(`Products access failed: ${productsError.message}`)
      }

      addResult("✅ Public product access working")

      // Test profile access (should work if authenticated, fail if not)
      const { data: profiles, error: profilesError } = await safeSupabase.client.from("profiles").select("*").limit(1)

      if (isAuthenticated) {
        if (profilesError) {
          addResult(`⚠️ Profile access failed (but user is authenticated): ${profilesError.message}`)
        } else {
          addResult("✅ Authenticated profile access working")
        }
      } else {
        if (profilesError) {
          addResult("✅ Profile access properly restricted for unauthenticated users")
        } else {
          addResult("⚠️ Profile access should be restricted for unauthenticated users")
        }
      }

      setStatus((prev) => ({ ...prev, rls: "connected" }))
      return true
    } catch (error: any) {
      setStatus((prev) => ({ ...prev, rls: "disconnected" }))
      addResult(`❌ RLS test failed: ${error.message}`)
      return false
    }
  }

  const runAllTests = async () => {
    setTestResults([])
    addResult("Starting Supabase connection tests...")

    if (!safeSupabase.isConfigured) {
      addResult(`❌ Supabase not configured: ${safeSupabase.error}`)
      addResult("Please check your environment variables and try again.")
      return
    }

    await testDatabaseConnection()
    await testAuthConnection()
    await testTablesExist()
    await testRLSPolicies()

    addResult("All tests completed!")
  }

  useEffect(() => {
    if (safeSupabase.isConfigured) {
      runAllTests()
    } else {
      setTestResults([`❌ Supabase not configured: ${safeSupabase.error}`])
    }
  }, [isAuthenticated])

  const getStatusIcon = (statusValue: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (statusValue) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "not-configured":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBadge = (statusValue: ConnectionStatus[keyof ConnectionStatus]) => {
    switch (statusValue) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-500">
            Connected
          </Badge>
        )
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      case "not-configured":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            Not Configured
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <EnvChecker />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Connection Status
          </CardTitle>
          <CardDescription>Real-time status of your Supabase connection and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!safeSupabase.isConfigured && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Supabase Not Configured</span>
              </div>
              <p className="text-sm text-orange-600 mt-1">{safeSupabase.error}</p>
            </div>
          )}

          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Authentication Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{authError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.database)}
                <span className="font-medium">Database</span>
              </div>
              {getStatusBadge(status.database)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.auth)}
                <span className="font-medium">Authentication</span>
              </div>
              {getStatusBadge(status.auth)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.tables)}
                <span className="font-medium">Tables</span>
              </div>
              {getStatusBadge(status.tables)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(status.rls)}
                <span className="font-medium">RLS Policies</span>
              </div>
              {getStatusBadge(status.rls)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runAllTests} variant="outline" disabled={!safeSupabase.isConfigured}>
              Run Tests Again
            </Button>
            {user && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Logged in as {user.email}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Detailed log of connection tests and results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {testResults.length > 0 ? testResults.join("\n") : "No test results yet..."}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
