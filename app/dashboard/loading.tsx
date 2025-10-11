"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-full bg-[#1A1A1A]/50" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 bg-[#1A1A1A]/50" />
              <Skeleton className="h-4 w-48 bg-[#1A1A1A]/50" />
              <div className="flex space-x-2">
                <Skeleton className="h-6 w-24 bg-[#1A1A1A]/50" />
                <Skeleton className="h-6 w-32 bg-[#1A1A1A]/50" />
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-24 bg-[#1A1A1A]/50" />
            <Skeleton className="h-10 w-32 bg-[#1A1A1A]/50" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 bg-[#0A0A1A]/50" />
                    <Skeleton className="h-8 w-16 bg-[#0A0A1A]/50" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-full bg-[#0A0A1A]/50" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-2 w-full bg-[#0A0A1A]/50" />
                  <Skeleton className="h-3 w-24 bg-[#0A0A1A]/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-12 w-full bg-[#1A1A1A]/50" />

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 bg-[#0A0A1A]/50" />
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-[#0A0A1A]/50 rounded-lg">
                      <Skeleton className="h-8 w-8 rounded-full bg-[#1A1A1A]/50" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full bg-[#1A1A1A]/50" />
                        <Skeleton className="h-3 w-20 bg-[#1A1A1A]/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32 bg-[#0A0A1A]/50" />
                  <Skeleton className="h-48 w-full bg-[#0A0A1A]/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
