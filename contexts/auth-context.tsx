"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = getSupabaseClient()

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    if (!supabase) {
      console.error("Supabase client not available")
      return null
    }

    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).limit(1)

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      if (!data || data.length === 0) {
        // Create profile if it doesn't exist
        const newProfile = {
          id: userId,
          email: user?.email || "",
          username: user?.email?.split("@")[0] || "",
          full_name: user?.user_metadata?.full_name || "",
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .limit(1)

        if (createError) {
          console.error("Error creating profile:", createError)
          return null
        }

        return createdProfile?.[0] || null
      }

      return data[0]
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

      return { success: true, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred during sign in"
      return { success: false, error: errorMessage }
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
        .limit(1)

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
        .limit(1)

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile)
      }

      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        setProfile(profileData)
      } else {
        setProfile(null)
      }

      setLoading(false)
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
