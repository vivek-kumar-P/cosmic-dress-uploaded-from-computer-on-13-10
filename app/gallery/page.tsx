"use client"

import { useState, useEffect } from "react"
import { gsap } from "gsap"
import { Search, Filter, Grid, List, Heart, ShoppingCart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const categories = ["All", "Tops", "Bottoms", "Dresses", "Accessories", "Shoes"]
const sortOptions = ["Popular", "Newest", "Price: Low to High", "Price: High to Low"]

const outfits = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Cosmic Outfit ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 50,
  rating: 4 + Math.random(),
  likes: Math.floor(Math.random() * 1000) + 100,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
  image: `/placeholder.svg?height=300&width=300&text=Outfit+${i + 1}`,
  colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"].slice(0, Math.floor(Math.random() * 3) + 1),
}))

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    // Page entrance animations
    gsap.fromTo(".gallery-header", { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

    gsap.fromTo(
      ".gallery-item",
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "back.out(1.7)" },
    )
  }, [])

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredOutfits = outfits.filter((outfit) => {
    const matchesSearch = outfit.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || outfit.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#2a1a4a] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="gallery-header mb-6 md:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00c4b4] to-[#007bff] mb-2">
                Outfit Gallery
              </h1>
              <p className="text-gray-400 text-sm md:text-base">
                Discover and customize amazing outfits created by our community
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search outfits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00c4b4] focus:ring-[#00c4b4] h-10 md:h-12"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 md:h-12 px-3 md:px-4"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                <div className="flex border border-white/20 rounded-lg bg-white/10 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-10 md:h-12 px-3 rounded-none ${
                      viewMode === "grid" ? "bg-[#00c4b4] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-10 md:h-12 px-3 rounded-none ${
                      viewMode === "list" ? "bg-[#00c4b4] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-[#00c4b4] to-[#007bff] text-white border-0"
                        : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">
            {filteredOutfits.length} outfit{filteredOutfits.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          className={`grid gap-4 md:gap-6 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          }`}
        >
          {filteredOutfits.map((outfit) => (
            <Card
              key={outfit.id}
              className={`gallery-item group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-[#00c4b4]/50 transition-all duration-300 hover:scale-105 ${
                viewMode === "list" ? "flex-row" : ""
              }`}
            >
              <CardContent className={`p-0 ${viewMode === "list" ? "flex" : ""}`}>
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-gradient-to-br from-[#1a1a3a] to-[#2a1a4a] ${
                    viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "aspect-square"
                  }`}
                >
                  <img
                    src={outfit.image || "/placeholder.svg"}
                    alt={outfit.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggleLike(outfit.id)}
                      className={`backdrop-blur-sm border-0 ${
                        likedItems.has(outfit.id) ? "bg-red-500 text-white" : "bg-white/20 text-white"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedItems.has(outfit.id) ? "fill-current" : ""}`} />
                    </Button>
                    <Button size="sm" className="bg-[#00c4b4] text-white border-0">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Category Badge */}
                  <Badge className="absolute top-2 left-2 bg-black/50 text-white text-xs">{outfit.category}</Badge>
                </div>

                {/* Content */}
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white text-sm md:text-base group-hover:text-[#00c4b4] transition-colors">
                      {outfit.name}
                    </h3>
                    <span className="text-[#00c4b4] font-bold text-sm md:text-base">${outfit.price}</span>
                  </div>

                  {/* Colors */}
                  <div className="flex items-center gap-1 mb-2">
                    {outfit.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {outfit.likes}
                      </span>
                      <span>★ {outfit.rating.toFixed(1)}</span>
                    </div>

                    {viewMode === "list" && (
                      <Button size="sm" className="bg-gradient-to-r from-[#00c4b4] to-[#007bff] text-white">
                        Customize
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8 md:mt-12">
          <Button variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20 px-8">
            Load More Outfits
          </Button>
        </div>
      </div>
    </div>
  )
}
