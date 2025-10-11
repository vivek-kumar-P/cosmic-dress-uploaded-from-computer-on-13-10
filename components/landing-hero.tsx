"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Star, ShoppingCart, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { gsap } from "gsap"

const featuredProducts = [
  {
    id: 1,
    name: "Cosmic Denim Jacket",
    price: 89,
    originalPrice: 120,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300&text=Cosmic+Jacket",
    category: "Jackets",
    isNew: true,
  },
  {
    id: 2,
    name: "Stellar Sneakers",
    price: 65,
    originalPrice: 85,
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300&text=Stellar+Sneakers",
    category: "Shoes",
    isBestseller: true,
  },
  {
    id: 3,
    name: "Galaxy Print Dress",
    price: 75,
    originalPrice: 95,
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=300&text=Galaxy+Dress",
    category: "Dresses",
    isNew: true,
  },
]

const categories = [
  { name: "All", count: 1200, active: true },
  { name: "Tops", count: 340 },
  { name: "Bottoms", count: 280 },
  { name: "Dresses", count: 190 },
  { name: "Shoes", count: 220 },
  { name: "Accessories", count: 170 },
]

export default function LandingHero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    // Hero entrance animations
    gsap.fromTo(".hero-title", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 })

    gsap.fromTo(
      ".hero-subtitle",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.4 },
    )

    gsap.fromTo(
      ".hero-search",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.6 },
    )

    gsap.fromTo(
      ".featured-product",
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, delay: 0.8, ease: "back.out(1.7)" },
    )
  }, [])

  const handleSearch = () => {
    // Navigate to product listing with search query
    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#00C4B4]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#007BFF]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00C4B4]/10 to-[#007BFF]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Hero Content */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00C4B4]/20 to-[#007BFF]/20 backdrop-blur-sm border border-[#00C4B4]/30 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="h-4 w-4 text-[#00C4B4]" />
            <span className="text-sm font-medium">New Collection Available</span>
          </motion.div>

          <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
              Discover Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#007BFF] via-[#00C4B4] to-white bg-clip-text text-transparent">
              Perfect Style
            </span>
          </h1>

          <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Browse thousands of curated fashion items, filter by your preferences, and build your dream wardrobe with
            our 3D outfit builder.
          </p>

          {/* Search and Filter Section */}
          <div className="hero-search max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search for products, brands, or styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#00C4B4] focus:ring-[#00C4B4] text-lg"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-14 px-8 bg-gradient-to-r from-[#00C4B4] to-[#007BFF] hover:opacity-90 text-white font-semibold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className={`${
                      selectedCategory === category.name
                        ? "bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white border-0"
                        : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {category.name}
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Products</h2>
            <Link href="/products">
              <Button
                variant="outline"
                className="border-[#00C4B4] text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="featured-product group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-[#00C4B4]/50 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {product.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                      {product.isBestseller && <Badge className="bg-orange-500 text-white">Bestseller</Badge>}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 backdrop-blur-sm text-white border-0"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Discount Badge */}
                    {product.originalPrice > product.price && (
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-red-500 text-white">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-[#00C4B4] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-400">{product.category}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-[#00C4B4]">${product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-[#00C4B4]/20 to-[#007BFF]/20 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Build Your Perfect Outfit?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Use our advanced 3D outfit builder to visualize how different pieces work together before you buy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white px-8">
                  Browse All Products
                </Button>
              </Link>
              <Link href="/3d-playground">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 bg-transparent"
                >
                  Try 3D Builder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
