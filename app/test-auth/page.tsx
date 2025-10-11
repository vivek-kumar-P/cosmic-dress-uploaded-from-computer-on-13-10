"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, User } from "lucide-react"
import { toast } from "sonner"

export default function TestAuthPage() {
  const { user, profile, signUp, signIn, signOut, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    fullName: "",
  })

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [profileUpdateData, setProfileUpdateData] = useState({
    full_name: "",
    bio: "",
    city: "",
  })

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testSignUp = async () => {
    if (!signUpData.email || !signUpData.password || !signUpData.fullName) {
      toast.error("Please fill in all sign-up fields")
      return
    }

    setIsLoading(true)
    try {
      const result = await signUp(signUpData.email, signUpData.password, {
        full_name: signUpData.fullName,
      })

      if (result.success) {
        addTestResult("✅ Sign-up successful - Check email for verification")
        toast.success("Sign-up successful! Check your email.")
      } else {
        addTestResult(`❌ Sign-up failed: ${result.error}`)
        toast.error(result.error || "Sign-up failed")
      }
    } catch (error) {
      addTestResult(`❌ Sign-up error: ${error}`)
      toast.error("Sign-up error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testSignIn = async () => {
    if (!signInData.email || !signInData.password) {
      toast.error("Please fill in email and password")
      return
    }

    setIsLoading(true)
    try {
      const result = await signIn(signInData.email, signInData.password)

      if (result.success) {
        addTestResult("✅ Sign-in successful")
        toast.success("Sign-in successful!")
      } else {
        addTestResult(`❌ Sign-in failed: ${result.error}`)
        toast.error(result.error || "Sign-in failed")
      }
    } catch (error) {
      addTestResult(`❌ Sign-in error: ${error}`)
      toast.error("Sign-in error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testProfileUpdate = async () => {
    if (!user) {
      toast.error("Please sign in first")
      return
    }

    setIsLoading(true)
    try {
      const result = await updateProfile(profileUpdateData)

      if (result.success) {
        addTestResult("✅ Profile update successful")
        toast.success("Profile updated successfully!")
      } else {
        addTestResult(`❌ Profile update failed: ${result.error}`)
        toast.error(result.error || "Profile update failed")
      }
    } catch (error) {
      addTestResult(`❌ Profile update error: ${error}`)
      toast.error("Profile update error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const testSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      addTestResult("✅ Sign-out successful")
      toast.success("Signed out successfully!")
    } catch (error) {
      addTestResult(`❌ Sign-out error: ${error}`)
      toast.error("Sign-out error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Authentication System Test</h1>
          <p className="text-zinc-400">Test all authentication features to verify they work correctly</p>
        </div>

        {/* Current User Status */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p className="text-green-400">✅ User is signed in</p>
                <p className="text-white">Email: {user.email}</p>
                <p className="text-white">User ID: {user.id}</p>
                {profile && (
                  <div className="mt-4 p-4 bg-[#0A0A1A] rounded-lg">
                    <h4 className="text-white font-medium mb-2">Profile Data:</h4>
                    <pre className="text-xs text-zinc-300 overflow-auto">{JSON.stringify(profile, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-400">❌ No user signed in</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sign Up Test */}
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
            <CardHeader>
              <CardTitle className="text-white">Test Sign Up</CardTitle>
              <CardDescription>Create a new test account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-white">
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="test@example.com"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-white">
                  Password
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="password123"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="signup-name"
                  placeholder="Test User"
                  value={signUpData.fullName}
                  onChange={(e) => setSignUpData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <Button
                onClick={testSignUp}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]"
              >
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Test Sign Up
              </Button>
            </CardContent>
          </Card>

          {/* Sign In Test */}
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
            <CardHeader>
              <CardTitle className="text-white">Test Sign In</CardTitle>
              <CardDescription>Sign in with existing account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-white">
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="test@example.com"
                  value={signInData.email}
                  onChange={(e) => setSignInData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-white">
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="password123"
                  value={signInData.password}
                  onChange={(e) => setSignInData((prev) => ({ ...prev, password: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <Button
                onClick={testSignIn}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]"
              >
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Test Sign In
              </Button>
            </CardContent>
          </Card>

          {/* Profile Update Test */}
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
            <CardHeader>
              <CardTitle className="text-white">Test Profile Update</CardTitle>
              <CardDescription>Update profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-white">
                  Full Name
                </Label>
                <Input
                  id="profile-name"
                  placeholder="Updated Name"
                  value={profileUpdateData.full_name}
                  onChange={(e) => setProfileUpdateData((prev) => ({ ...prev, full_name: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-bio" className="text-white">
                  Bio
                </Label>
                <Input
                  id="profile-bio"
                  placeholder="Updated bio"
                  value={profileUpdateData.bio}
                  onChange={(e) => setProfileUpdateData((prev) => ({ ...prev, bio: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-city" className="text-white">
                  City
                </Label>
                <Input
                  id="profile-city"
                  placeholder="New York"
                  value={profileUpdateData.city}
                  onChange={(e) => setProfileUpdateData((prev) => ({ ...prev, city: e.target.value }))}
                  className="bg-[#0A0A1A] border-zinc-700 text-white"
                />
              </div>
              <Button
                onClick={testProfileUpdate}
                disabled={isLoading || !user}
                className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]"
              >
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Test Profile Update
              </Button>
            </CardContent>
          </Card>

          {/* Sign Out Test */}
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
            <CardHeader>
              <CardTitle className="text-white">Test Sign Out</CardTitle>
              <CardDescription>Sign out current user</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testSignOut} disabled={isLoading || !user} variant="destructive" className="w-full">
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Test Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30">
          <CardHeader>
            <CardTitle className="text-white">Test Results</CardTitle>
            <CardDescription>Real-time test results and logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0A0A1A] rounded-lg p-4 max-h-96 overflow-auto">
              {testResults.length === 0 ? (
                <p className="text-zinc-500">No tests run yet. Start testing above!</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <p key={index} className="text-sm font-mono text-zinc-300">
                      {result}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={() => setTestResults([])}
              variant="outline"
              className="mt-4 border-zinc-700 bg-transparent text-white"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
