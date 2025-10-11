"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const shipping = totalPrice > 50 ? 0 : 9.99
  const tax = totalPrice * 0.08
  const finalTotal = totalPrice - discount + shipping + tax

  const handleApplyPromo = async () => {
    setIsApplyingPromo(true)

    // Simulate API call
    setTimeout(() => {
      if (promoCode.toLowerCase() === "save10") {
        setDiscount(totalPrice * 0.1)
        toast({
          title: "Promo code applied!",
          description: "You saved 10% on your order",
        })
      } else if (promoCode.toLowerCase() === "free20") {
        setDiscount(20)
        toast({
          title: "Promo code applied!",
          description: "You saved $20 on your order",
        })
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again",
          variant: "destructive",
        })
      }
      setIsApplyingPromo(false)
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white px-8 py-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Shopping Cart</h1>
            <p className="text-gray-400 mt-2">{totalItems} items in your cart</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.color}-${item.size}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="w-full sm:w-32 h-32 flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>Color: {item.color}</span>
                                <span>Size: {item.size}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id, item.color, item.size)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-white/20 rounded-lg">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))
                                }
                                className="text-white hover:bg-white/10"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-4 py-2 text-lg font-semibold">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                                className="text-white hover:bg-white/10"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#00C4B4]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-400">${item.price.toFixed(2)} each</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={!promoCode || isApplyingPromo}
                      variant="outline"
                      className="border-[#00C4B4] text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                    >
                      {isApplyingPromo ? (
                        <div className="w-4 h-4 border-2 border-[#00C4B4] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Try "SAVE10" for 10% off or "FREE20" for $20 off</p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-[#00C4B4]">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                {shipping > 0 && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-6">
                    <p className="text-sm text-blue-300">Add ${(50 - totalPrice).toFixed(2)} more for free shipping!</p>
                  </div>
                )}

                {/* Checkout Button */}
                <Link href="/checkout">
                  <Button className="w-full bg-gradient-to-r from-[#00C4B4] to-[#007BFF] text-white text-lg py-6 mb-4">
                    Proceed to Checkout
                  </Button>
                </Link>

                {/* Security Features */}
                <div className="text-center text-sm text-gray-400">
                  <p className="mb-2">🔒 Secure checkout with SSL encryption</p>
                  <p>💳 We accept all major credit cards</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
