import { SupabaseConnectionTest } from "@/components/supabase-connection-test"

export default function TestConnectionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Supabase Connection Test</h1>
          <p className="text-gray-600">
            This page helps you verify that your Supabase configuration is working correctly. Check the environment
            variables and connection status below.
          </p>
        </div>

        <SupabaseConnectionTest />
      </div>
    </div>
  )
}
