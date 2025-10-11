"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from "lucide-react"

interface EnvVar {
  name: string
  value: string | undefined
  required: boolean
  description: string
}

export function EnvChecker() {
  const [showValues, setShowValues] = useState(false)
  const [envVars, setEnvVars] = useState<EnvVar[]>([])

  useEffect(() => {
    const vars: EnvVar[] = [
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        value: process.env.NEXT_PUBLIC_SUPABASE_URL,
        required: true,
        description: "Your Supabase project URL",
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        required: true,
        description: "Your Supabase anonymous key",
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        value: process.env.SUPABASE_SERVICE_ROLE_KEY,
        required: false,
        description: "Your Supabase service role key (for server operations)",
      },
    ]
    setEnvVars(vars)
  }, [])

  const getStatusIcon = (value: string | undefined, required: boolean) => {
    if (value) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (required) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (value: string | undefined, required: boolean) => {
    if (value) {
      return (
        <Badge variant="default" className="bg-green-500">
          Set
        </Badge>
      )
    } else if (required) {
      return <Badge variant="destructive">Missing</Badge>
    } else {
      return <Badge variant="secondary">Optional</Badge>
    }
  }

  const maskValue = (value: string | undefined) => {
    if (!value) return "Not set"
    if (!showValues) {
      return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
    }
    return value
  }

  const allRequiredSet = envVars.filter((v) => v.required).every((v) => v.value)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Environment Variables
          <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)}>
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showValues ? "Hide" : "Show"} Values
          </Button>
        </CardTitle>
        <CardDescription>Check if all required Supabase environment variables are configured</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!allRequiredSet && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Missing Required Environment Variables</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Please set all required environment variables in your deployment settings or .env.local file.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {envVars.map((envVar) => (
            <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(envVar.value, envVar.required)}
                  <span className="font-medium text-sm">{envVar.name}</span>
                  {envVar.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">{envVar.description}</p>
                <p className="text-xs font-mono mt-1 text-gray-500">{maskValue(envVar.value)}</p>
              </div>
              <div className="ml-4">{getStatusBadge(envVar.value, envVar.required)}</div>
            </div>
          ))}
        </div>

        {allRequiredSet && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">All Required Variables Set</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Your Supabase environment variables are properly configured.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
