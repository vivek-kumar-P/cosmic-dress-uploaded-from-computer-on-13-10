"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import Link from "next/link"
import {
  ArrowRight,
  Search,
  Filter,
  ShoppingBag,
  RefreshCw,
  Maximize2,
  ShoppingCart,
  Heart,
  CheckCircle,
  PlusCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ProductModelViewer from "@/components/3d/product-model-viewer"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import OutfitCombinationView from "@/components/outfit-combination-view"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"

// Mock outfit items with custom 3D models
const outfitItems = [
  {
    id: 1,
    name: "Cosmic T-Shirt",
    category: "tops",
    price: 35,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#4A90E2",
    description: "A comfortable t-shirt with cosmic design patterns.",
  },
  {
    id: 2,
    name: "Nebula Hoodie",
    category: "tops",
    price: 65,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#8E44AD",
    description: "Stay warm with this nebula-inspired hoodie featuring galaxy patterns.",
  },
  {
    id: 3,
    name: "Stardust Jeans",
    category: "bottoms",
    price: 55,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#2C3E50",
    description: "Classic jeans with a modern twist, featuring subtle stardust accents.",
  },
  {
    id: 4,
    name: "Galaxy Shorts",
    category: "bottoms",
    price: 40,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#27AE60",
    description: "Comfortable shorts with galaxy-inspired design, perfect for casual wear.",
  },
  {
    id: 5,
    name: "Orbit Belt",
    category: "accessories",
    price: 25,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#E67E22",
    description: "A stylish belt with orbital patterns and a sleek buckle design.",
  },
  {
    id: 6,
    name: "Meteor Sneakers",
    category: "shoes",
    price: 85,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#E74C3C",
    description: "Comfortable sneakers with meteor-inspired design elements.",
  },
  {
    id: 7,
    name: "Comet Watch",
    category: "accessories",
    price: 120,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#F1C40F",
    description: "A premium watch with comet-inspired design and glow-in-the-dark features.",
  },
  {
    id: 8,
    name: "Solar Flare Jacket",
    category: "tops",
    price: 90,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#D35400",
    description: "A stylish jacket inspired by solar flares, with reflective accents.",
  },
  {
    id: 9,
    name: "Lunar Boots",
    category: "shoes",
    price: 95,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#7F8C8D",
    description: "Durable boots with lunar-inspired design, perfect for any adventure.",
  },
  {
    id: 10,
    name: "Asteroid Beanie",
    category: "accessories",
    price: 28,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#9B59B6",
    description: "A warm beanie with asteroid pattern, perfect for cold days.",
  },
  {
    id: 11,
    name: "Cosmic Sweatpants",
    category: "bottoms",
    price: 45,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#34495E",
    description: "Comfortable sweatpants with cosmic design elements.",
  },
  {
    id: 12,
    name: "Starlight Socks",
    category: "accessories",
    price: 15,
    image: "/placeholder.svg?height=150&width=150",
    modelUrl: "/assets/3d/duck.glb", // Using duck as placeholder
    color: "#1ABC9C",
    description: "Comfortable socks with starlight patterns that glow in the dark.",
  },
]

export default function OutfitPicker() {
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [category, setCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [loading, setLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState<(typeof outfitItems)[0] | null>(null)
  const [showCombination, setShowCombination] = useState(false)
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null)

  const { addItem, items: cartItems } = useCart()

  // Refs for model rotation control
  const modelRotationRefs = useRef<{ [key: number]: { rotationSpeed: number } }>({})

  // Filter items based on category and search term
  const filteredItems = outfitItems.filter((item) => {
    const matchesCategory = category === "all" || item.category === category
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "low-high") return a.price - b.price
    if (sortBy === "high-low") return b.price - a.price
    return 0 // 'newest' - keep original order
  })

  // Get selected items data
  const selectedItemsData = outfitItems.filter((item) => selectedItems.includes(item.id))

  const toggleItem = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    } else {
      // Check if max 5 items
      if (selectedItems.length < 5) {
        setSelectedItems([...selectedItems, itemId])

        // Animate selection
        gsap.fromTo(
          `#item-${itemId}`,
          { borderColor: "#00C4B4", scale: 1.05 },
          {
            borderColor: "#00C4B4",
            scale: 1,
            duration: 0.3,
            ease: "back.out",
          },
        )
      } else {
        // Show error (max 5 items)
        gsap.to(".max-items-error", {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out",
          onComplete: () => {
            setTimeout(() => {
              gsap.to(".max-items-error", {
                opacity: 0,
                y: -10,
                duration: 0.3,
              })
            }, 3000)
          },
        })
      }
    }
  }

  // Handle item hover
  const handleItemHover = (itemId: number | null) => {
    setHoveredItemId(itemId)

    // Update rotation speed in ref
    if (itemId !== null) {
      if (!modelRotationRefs.current[itemId]) {
        modelRotationRefs.current[itemId] = { rotationSpeed: 0.02 } // Fast rotation on hover
      } else {
        modelRotationRefs.current[itemId].rotationSpeed = 0.02
      }
    }
  }

  // Handle item hover end
  const handleItemHoverEnd = (itemId: number) => {
    setHoveredItemId(null)

    // Reset rotation speed in ref
    if (modelRotationRefs.current[itemId]) {
      modelRotationRefs.current[itemId].rotationSpeed = 0.005 // Normal rotation speed
    }
  }

  // Open quick preview
  const openQuickPreview = (e: React.MouseEvent, item: (typeof outfitItems)[0]) => {
    e.stopPropagation() // Prevent triggering the card click (item selection)
    setPreviewItem(item)
  }

  // Add selected items to cart
  const addSelectedItemsToCart = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to add to your cart",
        variant: "destructive",
      })
      return
    }

    selectedItemsData.forEach((item) => {
      addItem(item)
    })

    toast({
      title: "Items added to cart",
      description: `${selectedItems.length} item${selectedItems.length > 1 ? "s" : ""} added to your cart`,
    })
  }

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)

      // Animate items when loaded
      gsap.fromTo(
        ".outfit-item",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out",
        },
      )
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Initialize rotation speeds for all items
  useEffect(() => {
    outfitItems.forEach((item) => {
      if (!modelRotationRefs.current[item.id]) {
        modelRotationRefs.current[item.id] = { rotationSpeed: 0.005 } // Default rotation speed
      }
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-[#0A0A1A]/80 backdrop-blur-lg p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search items..."
              className="bg-[#1A1A1A] border-zinc-700 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-[#1A1A1A] border-zinc-700 w-[130px]">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-zinc-700">
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="tops">Tops</SelectItem>
                <SelectItem value="bottoms">Bottoms</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-[#1A1A1A] border-zinc-700 w-[130px]">
                <div className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-zinc-700">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="low-high">Price: Low-High</SelectItem>
                <SelectItem value="high-low">Price: High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-[#1A1A1A] text-[#00C4B4] border-[#00C4B4]/50">
              {selectedItems.length}/5 items selected
            </Badge>

            {selectedItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 hover:bg-[#00C4B4]/20 hover:border-[#00C4B4]"
                onClick={() => setShowCombination(true)}
              >
                Preview Combination
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={addSelectedItemsToCart}
              disabled={selectedItems.length === 0}
              className="bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black border-0"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>

            <Button
              asChild
              disabled={selectedItems.length === 0}
              className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90 border-0"
            >
              <Link href="/3d-playground">
                Continue to 3D View <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="max-items-error opacity-0 translate-y-[-10px] bg-red-500/90 text-white text-sm p-2 rounded mt-2 absolute top-full left-0 right-0">
          You can select a maximum of 5 items.
        </div>
      </div>

      {/* Cart Section */}
      {selectedItems.length > 0 && (
        <div className="bg-[#1A1A3A] p-4 rounded-lg mb-6 border border-[#00C4B4]/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-[#00C4B4]" />
              Your Selected Items
            </h3>
            <Link href="/cart">
              <Button className="bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black">Go to Cart</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {selectedItemsData.map((item) => (
              <div key={item.id} className="bg-[#0A0A1A] rounded-lg p-3 flex items-center gap-3 border border-zinc-800">
                <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-[#00C4B4] text-sm">${item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-zinc-400">
                Total:{" "}
                <span className="text-white font-bold">
                  ${selectedItemsData.reduce((sum, item) => sum + item.price, 0)}
                </span>
              </p>
            </div>
            <Button onClick={addSelectedItemsToCart} className="bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black">
              Add All to Cart
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-[#1A1A1A] rounded-lg h-[240px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedItems.map((item) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    id={`item-${item.id}`}
                    className={`outfit-item cursor-pointer transition-all overflow-hidden ${
                      selectedItems.includes(item.id)
                        ? "border-[#00C4B4] bg-[#00C4B4]/5"
                        : "border-zinc-700 hover:border-zinc-500 bg-[#1A1A1A]/60"
                    }`}
                    onClick={() => toggleItem(item.id)}
                    onMouseEnter={() => handleItemHover(item.id)}
                    onMouseLeave={() => handleItemHoverEnd(item.id)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-[200px]">
                        <ProductModelViewer
                          modelUrl={item.modelUrl}
                          interactive={false}
                          autoRotate={true}
                          rotationSpeed={hoveredItemId === item.id ? 0.02 : 0.005}
                          modelColor={item.color}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}: {item.name}
                        </div>
                        {selectedItems.includes(item.id) && (
                          <div className="absolute top-2 right-2 bg-[#00C4B4] text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedItems.indexOf(item.id) + 1}
                          </div>
                        )}

                        {/* Action buttons overlay */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/0 hover:bg-black/40 transition-all opacity-0 hover:opacity-100 flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white text-black border-0 shadow-lg hover:bg-[#00C4B4] hover:text-white transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              openQuickPreview(e, item)
                            }}
                          >
                            <Maximize2 className="h-5 w-5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white text-black border-0 shadow-lg hover:bg-[#00C4B4] hover:text-white transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              addItem(item)
                              toast({
                                title: "Added to cart",
                                description: `${item.name} added to your cart`,
                              })
                            }}
                          >
                            <ShoppingCart className="h-5 w-5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-white text-black border-0 shadow-lg hover:bg-[#00C4B4] hover:text-white transition-all"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Add favorite functionality here
                              toast({
                                title: "Added to favorites",
                                description: `${item.name} added to your favorites`,
                              })
                            }}
                          >
                            <Heart className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-1 truncate">{item.name}</h3>
                        <div className="flex justify-between items-center">
                          <p className="text-[#00C4B4] font-bold">${item.price}</p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-[#00C4B4]/10 hover:text-[#00C4B4]"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleItem(item.id)
                              }}
                            >
                              {selectedItems.includes(item.id) ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <PlusCircle className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-[#00C4B4]/10 hover:text-[#00C4B4]"
                              onClick={(e) => {
                                e.stopPropagation()
                                addItem(item)
                                toast({
                                  title: "Added to cart",
                                  description: `${item.name} added to your cart`,
                                })
                              }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1A1A1A] border-zinc-700">
                  <div className="text-center">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-400">${item.price}</p>
                    <p className="text-xs text-[#00C4B4] mt-1">
                      {selectedItems.includes(item.id) ? "Click to remove" : "Click to add to outfit"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}

      {!loading && sortedItems.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">No items found</h3>
          <p className="text-zinc-500">Try adjusting your filters or search term</p>
        </div>
      )}

      {/* Quick Preview Dialog */}
      <Dialog open={previewItem !== null} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="bg-[#1A1A1A] border-zinc-700 text-white max-w-3xl">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{previewItem.name}</DialogTitle>
                <DialogDescription className="text-zinc-400">{previewItem.description}</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="h-[300px] bg-[#0A0A1A] rounded-lg overflow-hidden">
                  <ProductModelViewer
                    modelUrl={previewItem.modelUrl}
                    interactive={true}
                    autoRotate={true}
                    height="300px"
                    modelColor={previewItem.color}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-400">Category</h4>
                    <p className="capitalize">{previewItem.category}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-zinc-400">Price</h4>
                    <p className="text-[#00C4B4] text-xl font-bold">${previewItem.price}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-zinc-400">Color</h4>
                    <div className="flex items-center mt-1">
                      <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: previewItem.color }}></div>
                      <span>Custom Color</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      className="flex-1 bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black"
                      onClick={() => {
                        addItem(previewItem)
                        toast({
                          title: "Added to cart",
                          description: `${previewItem.name} added to your cart`,
                        })
                        setPreviewItem(null)
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>

                    <Button
                      className="flex-1 bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90 border-0"
                      onClick={() => {
                        if (!selectedItems.includes(previewItem.id)) {
                          toggleItem(previewItem.id)
                        }
                        setPreviewItem(null)
                      }}
                    >
                      {selectedItems.includes(previewItem.id) ? "Already in Your Selection" : "Add to Selection"}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Outfit Combination View */}
      <Dialog open={showCombination} onOpenChange={setShowCombination}>
        <DialogContent className="bg-[#1A1A1A] border-zinc-700 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Your Outfit Combination</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Preview how your selected items look together
            </DialogDescription>
          </DialogHeader>

          <OutfitCombinationView items={selectedItemsData} />

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" className="border-zinc-700" onClick={() => setShowCombination(false)}>
              Continue Shopping
            </Button>

            <Button
              onClick={() => {
                addSelectedItemsToCart()
                setShowCombination(false)
              }}
              className="bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black"
            >
              Add All to Cart
            </Button>

            <Button asChild className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:opacity-90 border-0">
              <Link href="/3d-playground">
                Go to 3D Playground <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
