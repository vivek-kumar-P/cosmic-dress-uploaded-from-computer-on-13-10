import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication (middleware-level)
const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/checkout",
  "/orders",
  "/order-confirmation",
]

const AUTH_ROUTES = ["/auth/login", "/auth/register"]

/**
 * Validates that a redirect target is a safe internal path.
 * Prevents open redirect attacks via the `next` query parameter.
 */
function isValidInternalPath(path: string | null): path is string {
  if (!path || typeof path !== "string") return false
  if (!path.startsWith("/")) return false
  if (path.includes("://")) return false
  if (path.startsWith("//")) return false
  return true
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session — required to keep session alive and populate cookie for downstream
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Check if current path is a protected route
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )

  // Check if current path is an auth route
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  )

  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/auth/login"

    if (isValidInternalPath(pathname)) {
      redirectUrl.searchParams.set("next", pathname)
    }

    return NextResponse.redirect(redirectUrl)
  }

  // If user is already authenticated and visits login/register, redirect to dashboard or next target
  if (isAuthRoute && session) {
    const redirectUrl = req.nextUrl.clone()
    const nextParam = req.nextUrl.searchParams.get("next")

    if (nextParam && isValidInternalPath(nextParam)) {
      redirectUrl.pathname = nextParam
      redirectUrl.searchParams.delete("next")
    } else {
      redirectUrl.pathname = "/dashboard"
    }

    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf|mp4|webm)$).*)",
  ],
}
