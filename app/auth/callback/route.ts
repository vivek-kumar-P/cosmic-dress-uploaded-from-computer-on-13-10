import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(new URL("/auth/login?error=confirmation_failed", request.url))
      }

      if (data.user) {
        // Check if profile exists, create if it doesn't
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create one
          const { error: createError } = await supabase.from("profiles").insert({
            id: data.user.id,
            username: data.user.email?.split("@")[0] || `user_${Date.now()}`,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
            avatar_url: null,
            bio: null,
          })

          if (createError) {
            console.error("Error creating profile:", createError)
          }
        }

        // Redirect to dashboard or intended page
        return NextResponse.redirect(new URL(next === "/" ? "/dashboard" : next, request.url))
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
    }
  }

  // If no code or error occurred, redirect to login
  return NextResponse.redirect(new URL("/auth/login?error=invalid_callback", request.url))
}
