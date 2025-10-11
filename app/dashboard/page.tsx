"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Settings,
  ShoppingBag,
  Palette,
  Heart,
  Eye,
  TrendingUp,
  Calendar,
  Activity,
  Award,
  MapPin,
  Mail,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import EnhancedAnalytics from "@/components/dashboard/enhanced-analytics"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import ProtectedRoute from "@/components/auth/protected-route"

// Sample data for charts
const activityData = [
  { name: "Mon", outfits: 4, likes: 12 },
  { name: "Tue", outfits: 3, likes: 8 },
  { name: "Wed", outfits: 6, likes: 15 },
  { name: "Thu", outfits: 2, likes: 6 },
  { name: "Fri", outfits: 8, likes: 22 },
  { name: "Sat", outfits: 5, likes: 18 },
  { name: "Sun", outfits: 7, likes: 20 },
]

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalOutfits: 0,
    totalLikes: 0,
    totalViews: 0,
    recentActivity: [],
    favoriteOutfits: [],
    achievements: [],
  })
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      const supabase = getSupabaseClient()
      if (!supabase) return

      try {
        // Fetch user's outfits
        const { data: outfits } = await supabase.from("saved_outfits").select("*").eq("user_id", user.id)

        // Mock data for now
        const mockData = {
          totalOutfits: outfits?.length || 0,
          totalLikes: Math.floor(Math.random() * 100) + 50,
          totalViews: Math.floor(Math.random() * 500) + 200,
          recentActivity: [
            { action: "Created new outfit", time: "2 hours ago", type: "create" },
            { action: 'Liked "Summer Vibes"', time: "5 hours ago", type: "like" },
            { action: "Shared outfit to gallery", time: "1 day ago", type: "share" },
            { action: "Updated profile", time: "2 days ago", type: "update" },
          ],
          favoriteOutfits: outfits?.slice(0, 3) || [],
          achievements: [
            { name: "Style Pioneer", description: "Created 10+ outfits", earned: true },
            { name: "Trendsetter", description: "Got 50+ likes", earned: true },
            { name: "Fashion Explorer", description: "Tried 5+ categories", earned: false },
          ],
        }

        setDashboardData(mockData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error loading dashboard",
          description: "Could not load your dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchDashboardData()
  }, [user])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-[#00C4B4]/50 shadow-lg shadow-[#00C4B4]/20">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-[#007BFF] to-[#00C4B4] text-white text-2xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
                  Welcome back, {profile?.full_name || user?.email?.split("@")[0]}!
                </h1>
                <p className="text-zinc-400 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile?.city && profile?.country
                    ? `${profile.city}, ${profile.country}`
                    : profile?.country || "Cosmic Explorer"}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] text-white border-0">
                    Level 5 Stylist
                  </Badge>
                  <Badge variant="outline" className="border-[#00C4B4]/50 text-[#00C4B4]">
                    Premium Member
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                asChild
                variant="outline"
                className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
              >
                <Link href="/profile/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:from-[#0056b3] hover:to-[#009688]"
              >
                <Link href="/3d-playground">
                  <Palette className="h-4 w-4 mr-2" />
                  Create Outfit
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#00C4B4]/30 backdrop-blur-lg hover:border-[#00C4B4]/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">Total Outfits</p>
                    <p className="text-3xl font-bold text-white group-hover:text-[#00C4B4] transition-colors">
                      {dashboardData.totalOutfits}
                    </p>
                  </div>
                  <div className="bg-[#00C4B4]/20 p-3 rounded-full group-hover:bg-[#00C4B4]/30 transition-colors">
                    <Palette className="h-6 w-6 text-[#00C4B4]" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-zinc-500 mt-1">+12% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#007BFF]/30 backdrop-blur-lg hover:border-[#007BFF]/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">Total Likes</p>
                    <p className="text-3xl font-bold text-white group-hover:text-[#007BFF] transition-colors">
                      {dashboardData.totalLikes}
                    </p>
                  </div>
                  <div className="bg-[#007BFF]/20 p-3 rounded-full group-hover:bg-[#007BFF]/30 transition-colors">
                    <Heart className="h-6 w-6 text-[#007BFF]" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-zinc-500 mt-1">+8% from last week</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#FF6B6B]/30 backdrop-blur-lg hover:border-[#FF6B6B]/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">Profile Views</p>
                    <p className="text-3xl font-bold text-white group-hover:text-[#FF6B6B] transition-colors">
                      {dashboardData.totalViews}
                    </p>
                  </div>
                  <div className="bg-[#FF6B6B]/20 p-3 rounded-full group-hover:bg-[#FF6B6B]/30 transition-colors">
                    <Eye className="h-6 w-6 text-[#FF6B6B]" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-zinc-500 mt-1">+25% from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#4ECDC4]/30 backdrop-blur-lg hover:border-[#4ECDC4]/50 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm font-medium">Achievements</p>
                    <p className="text-3xl font-bold text-white group-hover:text-[#4ECDC4] transition-colors">
                      {dashboardData.achievements.filter((a) => a.earned).length}
                    </p>
                  </div>
                  <div className="bg-[#4ECDC4]/20 p-3 rounded-full group-hover:bg-[#4ECDC4]/30 transition-colors">
                    <Award className="h-6 w-6 text-[#4ECDC4]" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={66} className="h-2" />
                  <p className="text-xs text-zinc-500 mt-1">2 of 3 unlocked</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-[#1A1A1A]/50 backdrop-blur-lg border border-[#00C4B4]/20">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#007BFF] data-[state=active]:to-[#00C4B4]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="outfits"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#007BFF] data-[state=active]:to-[#00C4B4]"
              >
                My Outfits
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#007BFF] data-[state=active]:to-[#00C4B4]"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#007BFF] data-[state=active]:to-[#00C4B4]"
              >
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-[#00C4B4]" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-[#0A0A1A]/50 rounded-lg">
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "create"
                              ? "bg-[#00C4B4]/20 text-[#00C4B4]"
                              : activity.type === "like"
                                ? "bg-[#FF6B6B]/20 text-[#FF6B6B]"
                                : activity.type === "share"
                                  ? "bg-[#007BFF]/20 text-[#007BFF]"
                                  : "bg-[#4ECDC4]/20 text-[#4ECDC4]"
                          }`}
                        >
                          {activity.type === "create" && <Palette className="h-4 w-4" />}
                          {activity.type === "like" && <Heart className="h-4 w-4" />}
                          {activity.type === "share" && <TrendingUp className="h-4 w-4" />}
                          {activity.type === "update" && <Settings className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.action}</p>
                          <p className="text-zinc-400 text-xs">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Weekly Activity Chart */}
                <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-[#00C4B4]" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1A1A1A",
                            border: "1px solid #00C4B4",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="outfits"
                          stroke="#00C4B4"
                          fill="url(#colorOutfits)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorOutfits" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C4B4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00C4B4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-[#00C4B4]" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dashboardData.achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          achievement.earned
                            ? "bg-gradient-to-br from-[#00C4B4]/20 to-[#007BFF]/20 border-[#00C4B4]/50"
                            : "bg-[#0A0A1A]/50 border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${achievement.earned ? "bg-[#00C4B4]/30" : "bg-zinc-700"}`}>
                            <Award className={`h-5 w-5 ${achievement.earned ? "text-[#00C4B4]" : "text-zinc-400"}`} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${achievement.earned ? "text-white" : "text-zinc-400"}`}>
                              {achievement.name}
                            </h4>
                            <p className="text-xs text-zinc-500">{achievement.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Outfits Tab */}
            <TabsContent value="outfits" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.favoriteOutfits.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Palette className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No outfits yet</h3>
                    <p className="text-zinc-400 mb-6">Start creating your first cosmic outfit!</p>
                    <Button asChild className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                      <Link href="/3d-playground">Create Outfit</Link>
                    </Button>
                  </div>
                ) : (
                  dashboardData.favoriteOutfits.map((outfit, index) => (
                    <Card
                      key={index}
                      className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg hover:border-[#00C4B4]/50 transition-all group"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-[#007BFF]/20 to-[#00C4B4]/20 rounded-lg mb-4 flex items-center justify-center">
                          <Palette className="h-12 w-12 text-[#00C4B4]" />
                        </div>
                        <h4 className="font-medium text-white mb-2">{outfit.name}</h4>
                        <p className="text-zinc-400 text-sm mb-4">{outfit.description || "Custom outfit"}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Heart className="h-4 w-4 text-[#FF6B6B]" />
                            <span className="text-sm text-zinc-400">12</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <EnhancedAnalytics />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info */}
                <Card className="lg:col-span-2 bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal details and account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                        <div className="flex items-center space-x-2 p-3 bg-[#0A0A1A]/50 rounded-lg">
                          <User className="h-4 w-4 text-[#00C4B4]" />
                          <span className="text-white">{profile?.full_name || "Not set"}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Email</label>
                        <div className="flex items-center space-x-2 p-3 bg-[#0A0A1A]/50 rounded-lg">
                          <Mail className="h-4 w-4 text-[#00C4B4]" />
                          <span className="text-white">{user?.email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Location</label>
                        <div className="flex items-center space-x-2 p-3 bg-[#0A0A1A]/50 rounded-lg">
                          <MapPin className="h-4 w-4 text-[#00C4B4]" />
                          <span className="text-white">
                            {profile?.city && profile?.country
                              ? `${profile.city}, ${profile.country}`
                              : profile?.country || "Not set"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Member Since</label>
                        <div className="flex items-center space-x-2 p-3 bg-[#0A0A1A]/50 rounded-lg">
                          <Calendar className="h-4 w-4 text-[#00C4B4]" />
                          <span className="text-white">
                            {new Date(profile?.created_at || user?.created_at || "").toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                      <Link href="/profile/settings">Edit Profile</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                    >
                      <Link href="/3d-playground">
                        <Palette className="h-4 w-4 mr-2" />
                        Create New Outfit
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start border-[#007BFF]/50 text-[#007BFF] hover:bg-[#007BFF]/10 bg-transparent"
                    >
                      <Link href="/gallery">
                        <Eye className="h-4 w-4 mr-2" />
                        Browse Gallery
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start border-[#FF6B6B]/50 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 bg-transparent"
                    >
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        View Public Profile
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 bg-transparent"
                    >
                      <Link href="/products">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Shop Products
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}
