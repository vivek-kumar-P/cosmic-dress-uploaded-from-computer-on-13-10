"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Star, ShoppingCart, Heart, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

// Mock product data
const allProducts = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: `Fashion Item ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 20,
  originalPrice: Math.floor(Math.random() * 300) + 50,
  rating: 3.5 + Math.random() * 1.5,
  reviews: Math.floor(Math.random() * 500) + 10,
  category: ["Tops", "Bottoms", "Dresses", "Shoes", "Accessories"][Math.floor(Math.random() * 5)],
  brand: ["Nike", "Adidas", "Zara", "H&M", "Uniqlo"][Math.floor(Math.random() * 5)],
  colors: ["Red", "Blue", "Black", "White", "Green"].slice(0, Math.floor(Math.random() * 3) + 1),
  sizes: ["XS", "S", "M", "L", "XL"].slice(0, Math.floor(Math.random() * 4) + 2),
  image: `/placeholder.svg?height=400&width=400&text=Product+${i + 1}`,
  isNew: Math.random() > 0.8,
  isBestseller: Math.random() > 0.9,
  inStock: Math.random() > 0.1,
}))

const categories = ["All", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"]
const brands = ["All", "Nike", "Adidas", "Zara", "H&M", "Uniqlo"]
const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

function ProductListingContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState(allProducts)
  const [filteredProducts, setFilteredProducts] = useState(allProducts)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "All")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 300])
  const [sortBy, setSortBy] = useState("popular")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  const productsPerPage = 12

  useEffect(() => {
    let filtered = allProducts

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Apply brand filter
    if (selectedBrand !== "All") {
      filtered = filtered.filter((product) => product.brand === selectedBrand)
    }

    // Apply price filter
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = [...filtered].reverse()
        break
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating)
        break
      default:
        // Keep original order for "popular"
        break
    }

    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy])

  const toggleLike = (productId: number) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
          </h1>
          <p className="text-gray-400">
            Showing {filteredProducts.length} of {allProducts.length} products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All")
                    setSelectedBrand("All")
                    setPriceRange([0, 300])
                    setLikedItems(new Set())
                  }}
                  className="text-[#00C4B4] hover:bg-[#00C4B4]/10"
                >
                  Clear All
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Category</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                        className="border-white/20"
                      />
                      <label htmlFor={category} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/20">
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand} className="text-white">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={300}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden border-white/20 text-white hover:bg-white/10"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>

                <div className="flex border border-white/20 rounded-lg bg-white/10 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 rounded-none ${
                      viewMode === "grid" ? "bg-[#00C4B4] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`px-3 rounded-none ${
                      viewMode === "list" ? "bg-[#00C4B4] text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/20">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              }`}
            >
              {paginatedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={`group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-[#00C4B4]/50 transition-all duration-300 hover:scale-105 ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
                      {/* Product Image */}
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "aspect-square"
                        }`}
                      >
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {product.isNew && <Badge className="bg-green-500 text-white text-xs">New</Badge>}
                          {product.isBestseller && (
                            <Badge className="bg-orange-500 text-white text-xs">Bestseller</Badge>
                          )}
                          {!product.inStock && <Badge className="bg-red-500 text-white text-xs">Out of Stock</Badge>}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => toggleLike(product.id)}
                            className={`w-8 h-8 p-0 backdrop-blur-sm border-0 ${
                              likedItems.has(product.id) ? "bg-red-500 text-white" : "bg-white/20 text-white"
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likedItems.has(product.id) ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-8 h-8 p-0 bg-[#00C4B4] text-white border-0"
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Discount */}
                        {product.originalPrice > product.price && (
                          <div className="absolute bottom-3 left-3">
                            <Badge className="bg-red-500 text-white text-xs">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <Link href={`/products/${product.id}`}>
                                <h3 className="font-semibold text-white group-hover:text-[#00C4B4] transition-colors cursor-pointer line-clamp-2">
                                  {product.name}
                                </h3>
                              </Link>
                              <p className="text-sm text-gray-400">
                                {product.brand} • {product.category}
                              </p>
                            </div>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {product.rating.toFixed(1)} ({product.reviews})
                            </span>
                          </div>

                          {/* Colors */}
                          <div className="flex items-center gap-1 mb-3">
                            {product.colors.slice(0, 3).map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-full border border-white/20"
                                style={{ backgroundColor: color.toLowerCase() }}
                              />
                            ))}
                            {product.colors.length > 3 && (
                              <span className="text-xs text-gray-400 ml-1">+{product.colors.length - 3}</span>
                            )}
                          </div>
                        </div>

                        {/* Price and Action */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-[#00C4B4]">${product.price}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                            )}
                          </div>
                          {viewMode === "list" && (
                            <Link href={`/products/${product.id}`}>
                              <Button size="sm" className="bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white">
                                View Details
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-[#00C4B4] text-white"
                          : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00C4B4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </div>
      }
    >
      <ProductListingContent />
    </Suspense>
  )
}
