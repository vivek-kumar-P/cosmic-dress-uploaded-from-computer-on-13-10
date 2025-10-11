"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Heart, ShoppingCart, Share2, ArrowLeft, Plus, Minus, Truck, Shield, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"

// Mock product data
const getProductById = (id: string) => ({
  id: Number.parseInt(id),
  name: `Premium Fashion Item ${id}`,
  price: 89,
  originalPrice: 120,
  rating: 4.8,
  reviews: 124,
  category: "Tops",
  brand: "Premium Brand",
  description:
    "This premium fashion item combines style and comfort in a perfect blend. Made with high-quality materials and attention to detail, it's designed to elevate your wardrobe and make you feel confident.",
  features: [
    "Premium quality materials",
    "Comfortable fit",
    "Durable construction",
    "Easy care instructions",
    "Versatile styling options",
  ],
  images: [
    `/placeholder.svg?height=600&width=600&text=Product+${id}+Main`,
    `/placeholder.svg?height=600&width=600&text=Product+${id}+Side`,
    `/placeholder.svg?height=600&width=600&text=Product+${id}+Back`,
    `/placeholder.svg?height=600&width=600&text=Product+${id}+Detail`,
  ],
  colors: [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Navy", value: "#1E3A8A" },
    { name: "Gray", value: "#6B7280" },
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  inStock: true,
  stockCount: 15,
  isNew: true,
  isBestseller: false,
})

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    user: "Sarah M.",
    rating: 5,
    date: "2024-01-15",
    comment: "Absolutely love this item! The quality is amazing and it fits perfectly. Highly recommend!",
    verified: true,
  },
  {
    id: 2,
    user: "Mike R.",
    rating: 4,
    date: "2024-01-10",
    comment: "Great product overall. Good quality and fast shipping. Would buy again.",
    verified: true,
  },
  {
    id: 3,
    user: "Emma L.",
    rating: 5,
    date: "2024-01-08",
    comment: "Perfect fit and excellent material. Exactly what I was looking for!",
    verified: false,
  },
]

// Related products
const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
  id: i + 100,
  name: `Related Item ${i + 1}`,
  price: Math.floor(Math.random() * 100) + 30,
  rating: 4 + Math.random(),
  image: `/placeholder.svg?height=300&width=300&text=Related+${i + 1}`,
}))

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(getProductById(params.id as string))
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "You need to select a size before adding to cart",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: selectedColor.name,
        size: selectedSize,
        quantity: quantity,
      })

      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "You need to select a size before purchasing",
        variant: "destructive",
      })
      return
    }

    // Add to cart and redirect to checkout
    handleAddToCart()
    setTimeout(() => {
      window.location.href = "/cart"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white">
            Products
          </Link>
          <span>/</span>
          <span className="text-white">{product.name}</span>
        </div>

        {/* Back Button */}
        <Link href="/products">
          <Button variant="outline" className="mb-6 border-white/20 text-white hover:bg-white/10 bg-transparent">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-lg border border-white/20">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 lg:h-[600px] object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && <Badge className="bg-green-500 text-white">New</Badge>}
                {product.isBestseller && <Badge className="bg-orange-500 text-white">Bestseller</Badge>}
                {product.originalPrice > product.price && (
                  <Badge className="bg-red-500 text-white">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                )}
              </div>

              {/* Share Button */}
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white border-0"
                onClick={() => {
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  }) || navigator.clipboard.writeText(window.location.href)
                  toast({ title: "Link copied to clipboard!" })
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === index ? "border-[#00C4B4]" : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="border-[#00C4B4] text-[#00C4B4]">
                  {product.brand}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white">
                  {product.category}
                </Badge>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg">{product.rating}</span>
                <span className="text-gray-400">({product.reviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-[#00C4B4]">${product.price}</span>
                {product.originalPrice > product.price && (
                  <span className="text-2xl text-gray-400 line-through">${product.originalPrice}</span>
                )}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Color: {selectedColor.name}</h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor.name === color.name
                        ? "border-[#00C4B4] scale-110"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className={
                      selectedSize === size ? "bg-[#00C4B4] text-white" : "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-white/20 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-white hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-lg font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-400">{product.stockCount} items available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isLoading}
                className="flex-1 bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white text-lg py-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                Add to Cart
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                variant="outline"
                className="flex-1 border-[#00C4B4] text-[#00C4B4] hover:bg-[#00C4B4]/10 text-lg py-6 bg-transparent"
              >
                Buy Now
              </Button>

              <Button
                onClick={() => setIsLiked(!isLiked)}
                variant="outline"
                size="lg"
                className={`border-white/20 hover:bg-white/10 py-6 ${
                  isLiked ? "text-red-400 border-red-400" : "text-white"
                }`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#00C4B4]" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-[#00C4B4]" />
                <span className="text-sm">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#00C4B4]" />
                <span className="text-sm">2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/20">
              <TabsTrigger value="description" className="text-white data-[state=active]:bg-[#00C4B4]">
                Description
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-white data-[state=active]:bg-[#00C4B4]">
                Reviews ({product.reviews})
              </TabsTrigger>
              <TabsTrigger value="shipping" className="text-white data-[state=active]:bg-[#00C4B4]">
                Shipping & Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Product Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00C4B4] rounded-full" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="bg-white/10 backdrop-blur-lg border border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{review.user}</span>
                            {review.verified && <Badge className="bg-green-500 text-white text-xs">Verified</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-400 fill-current" : "text-gray-400"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-400">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Free standard shipping on orders over $50</li>
                        <li>• Express shipping available for $9.99</li>
                        <li>• International shipping available</li>
                        <li>• Orders processed within 1-2 business days</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Returns & Exchanges</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• 30-day return policy</li>
                        <li>• Free returns on all orders</li>
                        <li>• Items must be in original condition</li>
                        <li>• Refunds processed within 5-7 business days</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-3xl font-bold mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-[#00C4B4]/50 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2">{relatedProduct.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#00C4B4]">${relatedProduct.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{relatedProduct.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
