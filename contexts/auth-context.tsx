"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  website?: string
  street_address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  gender?: string
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error: string | null }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; onboardingCompleted?: boolean; error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error: string | null }>
  refreshProfile: () => Promise<void>
  completeOnboarding: (profileData: Partial<Profile>) => Promise<{ success: boolean; error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  /**
   * `loading` stays true until BOTH the session AND profile fetch are complete.
   * This prevents ProtectedRoute from making premature redirect decisions when
   * the session is known but the profile hasn't loaded yet.
   */
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = getSupabaseClient()

  /**
   * When signIn() explicitly fetches the profile and sets it, we use this ref
   * to signal onAuthStateChange that it should skip its own fetchProfile on the
   * upcoming SIGNED_IN event — preventing a redundant double-fetch race.
   */
  const skipNextProfileFetch = useRef(false)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!supabase) {
      console.error("Supabase client not available")
      return null
    }

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        // Profile doesn't exist yet — create it
        if (error.code === "PGRST116") {
          const currentUser = await supabase.auth.getUser()
          const newProfile = {
            id: userId,
            email: currentUser.data.user?.email || "",
            username: currentUser.data.user?.email?.split("@")[0] || "",
            full_name: currentUser.data.user?.user_metadata?.full_name || "",
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { data: createdProfile } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single()

          return createdProfile || null
        }
        console.error("Error fetching profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in fetchProfile:", error)
      return null
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    const profileData = await fetchProfile(user.id)
    setProfile(profileData)
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    if (!supabase) {
      return { success: false, error: "Supabase client not available" }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || "",
            ...userData,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign up"
      return { success: false, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { success: false, error: "Supabase client not available" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      let onboardingCompleted = false
      if (data?.user) {
        // Explicitly fetch profile here so we can read onboarding_completed
        // synchronously for the redirect decision in LoginForm.
        // Signal the onAuthStateChange listener to skip its own fetch for the
        // upcoming SIGNED_IN event to prevent a redundant double-fetch.
        skipNextProfileFetch.current = true
        const userProfile = await fetchProfile(data.user.id)
        if (userProfile) {
          setProfile(userProfile)
          onboardingCompleted = !!userProfile.onboarding_completed
        }
      }

      return { success: true, onboardingCompleted, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign in"
      return { success: false, onboardingCompleted: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      console.error("Supabase client not available")
      return
    }

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      } else {
        setUser(null)
        setSession(null)
        setProfile(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !user) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()

      if (error) {
        return { success: false, error: error.message }
      }

      if (data && data[0]) {
        setProfile(data[0])
      }

      return { success: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred updating profile"
      return { success: false, error: errorMessage }
    }
  }

  const completeOnboarding = async (profileData: Partial<Profile>) => {
    if (!supabase || !user) {
      return { success: false, error: "Not authenticated" }
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()

      if (error) {
        return { success: false, error: error.message }
      }

      if (data && data[0]) {
        setProfile(data[0])
      }

      return { success: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred completing onboarding"
      return { success: false, error: errorMessage }
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    /**
     * Use onAuthStateChange as the single source of truth for session state.
     * The INITIAL_SESSION event fires immediately on mount with the current
     * session (equivalent to a getSession() call), so we don't need a separate
     * getSession() call which would cause a double fetchProfile race.
     *
     * IMPORTANT: loading stays true until fetchProfile completes, so that
     * ProtectedRoute never makes redirect decisions with stale (null) profile data.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        if (event === "SIGNED_IN" && skipNextProfileFetch.current) {
          // signIn() already fetched and set the profile — skip duplicate fetch.
          // Profile is already set, so we can mark loading as done immediately.
          skipNextProfileFetch.current = false
          setLoading(false)
        } else {
          // INITIAL_SESSION (page load/navigation), TOKEN_REFRESHED, USER_UPDATED,
          // or a SIGNED_IN from OAuth/magic-link (no prior explicit signIn() call).
          // Keep loading=true while profile fetches, then clear it when done.
          fetchProfile(session.user.id)
            .then((profileData) => {
              setProfile(profileData)
            })
            .catch(console.error)
            .finally(() => {
              setLoading(false)
            })
        }
      } else {
        // SIGNED_OUT or session expired — clear profile and unblock loading
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const isAuthenticated = !!user && !!session

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    completeOnboarding,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
