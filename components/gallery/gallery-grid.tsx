"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ShoppingBag, Loader } from "lucide-react"
import ProductModelViewer from "@/components/3d/product-model-viewer"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface GalleryGridProps {
  filters?: {
    category?: string[]
    style?: string[]
    priceRange?: [number, number]
    search?: string
  }
}

export default function GalleryGrid({ filters }: GalleryGridProps) {
  const { user } = useAuth()
  const gridRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<string>("newest")
  const prevFiltersRef = useRef<typeof filters>()

  // Sample fallback products with 3D models
  const fallbackProducts = [
    {
      id: "fb-1",
      name: "Classic White T-Shirt",
      price: 29.99,
      category: "tops",
      style: "casual",
      is_new: true,
      model_url: "/models/tshirt_white.glb",
    },
    {
      id: "fb-2",
      name: "Black Denim Jeans",
      price: 59.99,
      category: "bottoms",
      style: "casual",
      is_new: false,
      model_url: "/models/jeans_black.glb",
    },
    {
      id: "fb-3",
      name: "Leather Jacket",
      price: 199.99,
      category: "tops",
      style: "streetwear",
      is_new: true,
      model_url: "/models/jacket_leather.glb",
    },
    {
      id: "fb-4",
      name: "Running Shoes",
      price: 89.99,
      category: "shoes",
      style: "activewear",
      is_new: false,
      model_url: "/models/shoes_running.glb",
    },
    {
      id: "fb-5",
      name: "Summer Dress",
      price: 79.99,
      category: "tops",
      style: "casual",
      is_new: true,
      model_url: "/models/dress_summer.glb",
    },
    {
      id: "fb-6",
      name: "Formal Suit",
      price: 299.99,
      category: "tops",
      style: "formal",
      is_new: false,
      model_url: "/models/suit_formal.glb",
    },
    {
      id: "fb-7",
      name: "Winter Coat",
      price: 149.99,
      category: "tops",
      style: "casual",
      is_new: false,
      model_url: "/models/coat_winter.glb",
    },
    {
      id: "fb-8",
      name: "Casual Sneakers",
      price: 69.99,
      category: "shoes",
      style: "casual",
      is_new: true,
      model_url: "/models/sneakers_casual.glb",
    },
    {
      id: "fb-9",
      name: "Silver Necklace",
      price: 49.99,
      category: "accessories",
      style: "formal",
      is_new: false,
      model_url: "/models/necklace_silver.glb",
    },
    {
      id: "fb-10",
      name: "Baseball Cap",
      price: 24.99,
      category: "accessories",
      style: "casual",
      is_new: true,
      model_url: "/models/cap_baseball.glb",
    },
    {
      id: "fb-11",
      name: "Yoga Pants",
      price: 54.99,
      category: "bottoms",
      style: "activewear",
      is_new: false,
      model_url: "/models/pants_yoga.glb",
    },
    {
      id: "fb-12",
      name: "Designer Sunglasses",
      price: 129.99,
      category: "accessories",
      style: "streetwear",
      is_new: true,
      model_url: "/models/sunglasses_designer.glb",
    },
    {
      id: "fb-13",
      name: "Formal Dress Shoes",
      price: 119.99,
      category: "shoes",
      style: "formal",
      is_new: false,
      model_url: "/models/shoes_formal.glb",
    },
    {
      id: "fb-14",
      name: "Wool Sweater",
      price: 79.99,
      category: "tops",
      style: "casual",
      is_new: false,
      model_url: "/models/sweater_wool.glb",
    },
    {
      id: "fb-15",
      name: "Leather Belt",
      price: 39.99,
      category: "accessories",
      style: "formal",
      is_new: true,
      model_url: "/models/belt_leather.glb",
    },
  ]

  // Memoize the fetchProducts function to avoid recreating it on every render
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)

    try {
      let query = supabase.from("products").select("*")

      // Apply filters
      if (filters) {
        if (filters.category && filters.category.length > 0) {
          query = query.in("category", filters.category)
        }

        if (filters.style && filters.style.length > 0) {
          query = query.in("style", filters.style)
        }

        if (filters.priceRange) {
          query = query.gte("price", filters.priceRange[0]).lte("price", filters.priceRange[1])
        }

        if (filters.search) {
          query = query.ilike("name", `%${filters.search}%`)
        }
      }

      // Apply sorting
      if (sortBy === "price-low-high") {
        query = query.order("price", { ascending: true })
      } else if (sortBy === "price-high-low") {
        query = query.order("price", { ascending: false })
      } else {
        // Default to newest
        query = query.order("created_at", { ascending: false })
      }

      // Apply pagination
      query = query.range((page - 1) * 12, page * 12 - 1)

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
      setHasMore(data && data.length === 12)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error loading products",
        description: "There was a problem loading the products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, sortBy])

  // Fetch products when filters, page, or sortBy change
  useEffect(() => {
    // Check if filters have actually changed to avoid unnecessary fetches
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)

    if (filtersChanged || prevFiltersRef.current === undefined) {
      // Reset to page 1 when filters change
      if (filtersChanged && page !== 1) {
        setPage(1)
        return // The page change will trigger another useEffect call
      }

      fetchProducts()
      prevFiltersRef.current = filters
    }
  }, [filters, page, sortBy, fetchProducts])

  // Fetch user favorites
  useEffect(() => {
    if (!user) {
      setFavorites([])
      return
    }

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase.from("favorites").select("product_id").eq("user_id", user.id)

        if (error) throw error

        setFavorites(data.map((fav) => fav.product_id))
      } catch (error) {
        console.error("Error fetching favorites:", error)
      }
    }

    fetchFavorites()
  }, [user])

  // GSAP animations
  useEffect(() => {
    if (!gridRef.current || isLoading || products.length === 0) return

    // Clear existing ScrollTriggers to prevent duplicates
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())

    // Grid items animation
    gsap.from(".gallery-item", {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: gridRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    })

    return () => {
      // Clean up ScrollTriggers when component unmounts
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [isLoading, products])

  // Toggle favorite
  const toggleFavorite = async (productId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      })
      return
    }

    try {
      if (favorites.includes(productId)) {
        // Remove from favorites
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId)

        setFavorites(favorites.filter((id) => id !== productId))
      } else {
        // Add to favorites
        await supabase.from("favorites").insert({
          user_id: user.id,
          product_id: productId,
        })

        setFavorites([...favorites, productId])
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "There was a problem updating your favorites",
        variant: "destructive",
      })
    }
  }

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
    setPage(1) // Reset to first page when sorting changes
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">All Items</h2>
          <p className="text-zinc-400">Showing {products.length} results</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="bg-[#1A1A1A] border border-zinc-700 rounded-md px-3 py-2 text-sm"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-8 w-8 animate-spin text-[#00C4B4]" />
        </div>
      ) : products.length === 0 ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Sample Gallery Items</h2>
              <p className="text-zinc-400">Showing sample items while no search results found</p>
            </div>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fallbackProducts.map((item) => (
              <Card
                key={item.id}
                className="gallery-item bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg overflow-hidden group"
              >
                <div className="relative h-[350px] overflow-hidden">
                  <ProductModelViewer
                    modelUrl={item.model_url || "/models/duck.glb"}
                    height="350px"
                    width="100%"
                    autoRotate={true}
                    interactive={false}
                    className="w-full h-full"
                  />

                  {item.is_new && <Badge className="absolute top-3 left-3 bg-[#00C4B4] text-black">New</Badge>}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-white text-white hover:bg-white/20"
                    >
                      <Link href={`/outfit-picker?item=${item.id}`}>
                        <Eye className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full border-white text-white hover:bg-white/20"
                    >
                      <ShoppingBag className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="text-[#00C4B4] font-bold">${item.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      {item.style.charAt(0).toUpperCase() + item.style.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => (
            <Card
              key={item.id}
              className="gallery-item bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg overflow-hidden group"
            >
              <div className="relative h-[350px] overflow-hidden">
                <ProductModelViewer
                  modelUrl={item.model_url || "/assets/3d/duck.glb"}
                  height="350px"
                  width="100%"
                  autoRotate={true}
                  interactive={false}
                  className="w-full h-full"
                />

                {item.is_new && <Badge className="absolute top-3 left-3 bg-[#00C4B4] text-black">New</Badge>}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-white text-white hover:bg-white/20"
                  >
                    <Link href={`/outfit-picker?item=${item.id}`}>
                      <Eye className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 rounded-full ${
                      favorites.includes(item.id)
                        ? "bg-[#00C4B4]/20 border-[#00C4B4] text-[#00C4B4]"
                        : "border-white text-white hover:bg-white/20"
                    }`}
                    onClick={(e) => toggleFavorite(item.id, e)}
                  >
                    <ShoppingBag className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-[#00C4B4] font-bold">${item.price}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                    {item.style.charAt(0).toUpperCase() + item.style.slice(1)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="border-[#00C4B4] text-[#00C4B4] hover:bg-[#00C4B4]/10"
            onClick={() => setPage(page + 1)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
