"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts"
import { TrendingUp, TrendingDown, Activity, ShoppingBag, Heart, Eye, Calendar, Zap } from "lucide-react"

// Enhanced sample data
const outfitsOverTimeData = [
  { month: "Jan", outfits: 12, purchases: 3, views: 45 },
  { month: "Feb", outfits: 19, purchases: 5, views: 67 },
  { month: "Mar", outfits: 25, purchases: 8, views: 89 },
  { month: "Apr", outfits: 31, purchases: 12, views: 123 },
  { month: "May", outfits: 28, purchases: 9, views: 156 },
  { month: "Jun", outfits: 35, purchases: 15, views: 198 },
  { month: "Jul", outfits: 42, purchases: 18, views: 234 },
  { month: "Aug", outfits: 38, purchases: 14, views: 267 },
]

const categoryPreferencesData = [
  { name: "Casual", value: 35, color: "#00C4B4", trend: "+12%" },
  { name: "Formal", value: 25, color: "#007BFF", trend: "+8%" },
  { name: "Sport", value: 20, color: "#FF6B6B", trend: "+15%" },
  { name: "Party", value: 15, color: "#4ECDC4", trend: "+5%" },
  { name: "Vintage", value: 5, color: "#45B7D1", trend: "-2%" },
]

const purchaseFrequencyData = [
  { day: "Mon", purchases: 4, returns: 1 },
  { day: "Tue", purchases: 3, returns: 0 },
  { day: "Wed", purchases: 6, returns: 2 },
  { day: "Thu", purchases: 2, returns: 0 },
  { day: "Fri", purchases: 8, returns: 1 },
  { day: "Sat", purchases: 12, returns: 3 },
  { day: "Sun", purchases: 5, returns: 1 },
]

const activityTimelineData = [
  { time: "00:00", activity: 2 },
  { time: "04:00", activity: 1 },
  { time: "08:00", activity: 8 },
  { time: "12:00", activity: 15 },
  { time: "16:00", activity: 12 },
  { time: "20:00", activity: 18 },
]

const engagementData = [
  { name: "Likes", value: 85, color: "#FF6B6B" },
  { name: "Shares", value: 65, color: "#4ECDC4" },
  { name: "Comments", value: 45, color: "#45B7D1" },
  { name: "Saves", value: 75, color: "#00C4B4" },
]

const seasonalTrendsData = [
  { season: "Spring", casual: 40, formal: 25, sport: 35 },
  { season: "Summer", casual: 50, formal: 15, sport: 35 },
  { season: "Fall", casual: 35, formal: 35, sport: 30 },
  { season: "Winter", casual: 30, formal: 40, sport: 30 },
]

export default function EnhancedAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Avg. Session</p>
                <p className="text-2xl font-bold text-[#00C4B4]">24m</p>
              </div>
              <div className="bg-[#00C4B4]/20 p-2 rounded-full">
                <Activity className="h-5 w-5 text-[#00C4B4]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#007BFF]/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Conversion</p>
                <p className="text-2xl font-bold text-[#007BFF]">12.5%</p>
              </div>
              <div className="bg-[#007BFF]/20 p-2 rounded-full">
                <ShoppingBag className="h-5 w-5 text-[#007BFF]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#FF6B6B]/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Engagement</p>
                <p className="text-2xl font-bold text-[#FF6B6B]">89%</p>
              </div>
              <div className="bg-[#FF6B6B]/20 p-2 rounded-full">
                <Heart className="h-5 w-5 text-[#FF6B6B]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-xs text-red-500">-2%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#2A1A2A]/90 border-[#4ECDC4]/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Reach</p>
                <p className="text-2xl font-bold text-[#4ECDC4]">2.4K</p>
              </div>
              <div className="bg-[#4ECDC4]/20 p-2 rounded-full">
                <Eye className="h-5 w-5 text-[#4ECDC4]" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+25%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outfits Over Time */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#00C4B4]" />
              Outfits Created Over Time
            </CardTitle>
            <CardDescription>Track your creative journey month by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={outfitsOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #00C4B4",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="views" fill="url(#colorViews)" stroke="#4ECDC4" strokeWidth={2} />
                <Bar dataKey="outfits" fill="#00C4B4" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="purchases" stroke="#007BFF" strokeWidth={3} />
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Preferences - Enhanced Donut */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-[#00C4B4]" />
              Style Preferences
            </CardTitle>
            <CardDescription>Your favorite outfit categories with trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryPreferencesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryPreferencesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #00C4B4",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {categoryPreferencesData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-[#0A0A1A]/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-sm text-white">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-zinc-400">{category.value}%</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          category.trend.startsWith("+")
                            ? "border-green-500 text-green-500"
                            : "border-red-500 text-red-500"
                        }`}
                      >
                        {category.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Frequency */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-[#00C4B4]" />
              Weekly Shopping
            </CardTitle>
            <CardDescription>Purchase patterns by day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={purchaseFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #00C4B4",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="purchases" fill="#00C4B4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returns" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-[#00C4B4]" />
              Daily Activity
            </CardTitle>
            <CardDescription>When you're most active</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #00C4B4",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="activity" stroke="#007BFF" fill="url(#colorActivity)" strokeWidth={2} />
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-[#00C4B4]" />
              Engagement Score
            </CardTitle>
            <CardDescription>How others interact with your style</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={engagementData}>
                <RadialBar dataKey="value" cornerRadius={10} fill={(entry) => entry.color} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #00C4B4",
                    borderRadius: "8px",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {engagementData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-zinc-400">{item.name}</span>
                  <span className="text-xs text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonal Trends */}
      <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-[#00C4B4]" />
            Seasonal Style Trends
          </CardTitle>
          <CardDescription>How your style preferences change throughout the year</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={seasonalTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="season" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #00C4B4",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="casual" stackId="a" fill="#00C4B4" radius={[0, 0, 0, 0]} />
              <Bar dataKey="formal" stackId="a" fill="#007BFF" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sport" stackId="a" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
