import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ExternalLink, Database, Key, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Setup Your 3D Outfit Builder</h1>
          <p className="text-xl text-gray-300">Follow these steps to configure your Supabase backend</p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Create Supabase Project */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Step 1: Create Supabase Project
              </CardTitle>
              <CardDescription className="text-gray-300">
                Set up your backend database and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>
                  Go to{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Create a new account or sign in</li>
                <li>Click "New Project" and fill in the details</li>
                <li>Wait for your project to be created (this takes a few minutes)</li>
              </ol>
            </CardContent>
          </Card>

          {/* Step 2: Get API Keys */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Key className="h-5 w-5" />
                Step 2: Get Your API Keys
              </CardTitle>
              <CardDescription className="text-gray-300">Copy your project URL and API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>In your Supabase dashboard, go to Settings → API</li>
                <li>Copy the "Project URL" and "anon public" key</li>
                <li>
                  Create a <code className="bg-black/30 px-2 py-1 rounded">.env.local</code> file in your project root
                </li>
              </ol>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-gray-300">
                  <strong>Add these to your .env.local file:</strong>
                  <pre className="mt-2 bg-black/30 p-3 rounded text-sm overflow-x-auto">
                    {`NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`}
                  </pre>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3: Set up Database */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Step 3: Set up Database Tables
              </CardTitle>
              <CardDescription className="text-gray-300">Run the SQL script to create necessary tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>In your Supabase dashboard, go to SQL Editor</li>
                <li>Create a new query and paste the setup script</li>
                <li>Run the script to create all necessary tables</li>
              </ol>

              <Alert className="bg-green-500/10 border-green-500/20">
                <AlertDescription className="text-gray-300">
                  The database setup script is available in your project at:
                  <code className="bg-black/30 px-2 py-1 rounded ml-1">scripts/00-complete-database-setup.sql</code>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 4: Configure Authentication */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5" />
                Step 4: Configure Site URL
              </CardTitle>
              <CardDescription className="text-gray-300">Set up redirect URLs for email confirmation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Go to Authentication → URL Configuration</li>
                <li>
                  Set Site URL to: <code className="bg-black/30 px-2 py-1 rounded">http://localhost:3000</code>
                </li>
                <li>
                  Add Redirect URLs:{" "}
                  <code className="bg-black/30 px-2 py-1 rounded">http://localhost:3000/auth/callback</code>
                </li>
                <li>For production, use your actual domain</li>
              </ol>
            </CardContent>
          </Card>

          {/* Final Step */}
          <Card className="bg-green-500/10 backdrop-blur-lg border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5" />
                You're All Set!
              </CardTitle>
              <CardDescription className="text-gray-300">
                Restart your development server and test the authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">Go to Homepage</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                    Test Registration
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
