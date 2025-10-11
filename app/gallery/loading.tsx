"use client"

import { Card, CardContent } from "@/components/ui/card"

export default function GalleryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#2a1a4a] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header Skeleton */}
        <div className="mb-6 md:mb-8">
          <div className="h-8 md:h-12 bg-white/10 rounded-lg mb-2 w-64 animate-pulse" />
          <div className="h-4 bg-white/5 rounded w-96 animate-pulse" />
        </div>

        {/* Search Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="h-10 md:h-12 bg-white/10 rounded-lg flex-1 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 md:h-12 w-20 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-10 md:h-12 w-16 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Category Tabs Skeleton */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-16 bg-white/10 rounded-lg animate-pulse flex-shrink-0" />
          ))}
        </div>

        {/* Gallery Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20"
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-white/5 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-12 animate-pulse" />
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="w-3 h-3 bg-white/10 rounded-full animate-pulse" />
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-white/5 rounded w-16 animate-pulse" />
                    <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
