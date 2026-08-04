"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/auth/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Package,
  Search,
  Download,
  Eye,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
} from "lucide-react"
import { motion } from "framer-motion"
import { useOrders } from "@/contexts/orders-context"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"

type Status = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

const getStatusIcon = (status: Status) => {
  switch (status) {
    case "processing":
      return <RefreshCw className="h-4 w-4" />
    case "shipped":
      return <Truck className="h-4 w-4" />
    case "delivered":
      return <CheckCircle2 className="h-4 w-4" />
    case "cancelled":
      return <XCircle className="h-4 w-4" />
  }
}

const getStatusColor = (status: Status) => {
  switch (status) {
    case "processing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "shipped":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    case "delivered":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30"
  }
}

export default function OrderHistoryPage() {
  const { orders, updateOrderStatus } = useOrders()
  const { addItem } = useCart()
  const router = useRouter()
  const [filteredOrders, setFilteredOrders] = useState(orders)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    let filtered = orders

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, activeTab, orders])

  const handleReorder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    // Add each item back to cart respecting quantity
    order.items.forEach((it) => {
      const base = {
        id: it.id,
        name: it.name,
        category: "reorder",
        price: it.price,
        image: it.image ?? "/images/placeholder.png",
        modelUrl: it.modelUrl ?? "",
        color: it.color ?? "default",
        description: `Reorder from ${order.orderNumber}`,
      }
      for (let i = 0; i < it.quantity; i++) {
        addItem(base)
      }
    })
    router.push("/cart")
  }

  const handleDownloadInvoice = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const html = `<!doctype html>
<html><head><meta charset=\"utf-8\" /><title>Invoice ${order.orderNumber}</title>
<style>body{font-family:system-ui, -apple-system, Segoe UI, Roboto; padding:24px;}
h1{margin-bottom:4px} table{width:100%; border-collapse:collapse; margin-top:16px}
th,td{border:1px solid #ddd; padding:8px; text-align:left}
.totals{margin-top:16px}
</style></head><body>
<h1>Invoice ${order.orderNumber}</h1>
<p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
<p>Status: ${order.status}</p>
<p>Tracking: ${order.trackingNumber ?? "N/A"}</p>
<h3>Items</h3>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead><tbody>
${order.items
      .map(
        (it) =>
          `<tr><td>${it.name}</td><td>${it.quantity}</td><td>$${it.price.toFixed(2)}</td><td>$${(
            it.price * it.quantity
          ).toFixed(2)}</td></tr>`,
      )
      .join("")}
</tbody></table>
<div class=\"totals\">Subtotal: $${order.subtotal.toFixed(2)}<br/>Shipping: $${order.shipping.toFixed(
      2,
    )}<br/>Tax: $${order.tax.toFixed(2)}<br/><strong>Total: $${order.total.toFixed(2)}</strong></div>
<p>Ship To: ${order.shippingAddress?.name ?? ""} - ${order.shippingAddress?.address ?? ""}, ${order.shippingAddress?.city ?? ""} ${order.shippingAddress?.zipCode ?? ""}</p>
</body></html>`
    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${order.orderNumber.replace(/#/g, "")}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute requireOnboarding>
    {isLoading ? (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00C4B4] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading orders...</p>
        </div>
      </div>
    ) : (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A] text-white py-20 px-4 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Order History</h1>
          <p className="text-zinc-400">View and manage your past orders</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search by order number or tracking number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1A1A1A] border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#1A1A1A] border border-zinc-800 mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card className="bg-[#1A1A1A]/80 border-zinc-800">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No orders found</h3>
                    <p className="text-zinc-400 mb-6">
                      {searchQuery
                        ? "Try adjusting your search query"
                        : "Start shopping to see your orders here"}
                    </p>
                    <Button asChild className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                      <Link href="/gallery">Browse Gallery</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg hover:border-[#00C4B4] transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Order Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400 flex-wrap">
                              <span>
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>
                              <span>•</span>
                              <span>{order.items.length} items</span>
                              <span>•</span>
                              <span className="text-[#00C4B4] font-medium">${order.total.toFixed(2)}</span>
                            </div>
                            {order.trackingNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <Truck className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-400">Tracking:</span>
                                <span className="text-white font-mono">{order.trackingNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-zinc-700 hover:bg-zinc-800"
                            >
                              <Link href={`/order-confirmation/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-zinc-700 hover:bg-zinc-800"
                              onClick={() => handleDownloadInvoice(order.id)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Invoice
                            </Button>
                            {order.status === "delivered" && (
                              <Button
                                size="sm"
                                className="bg-[#00C4B4] hover:bg-[#00C4B4]/90 text-black"
                                onClick={() => handleReorder(order.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reorder
                              </Button>
                            )}
                            {order.status === "processing" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800"
                                onClick={() => updateOrderStatus(order.id, "shipped")}
                              >
                                Update to Shipped
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-zinc-700 hover:bg-zinc-800"
                                onClick={() => updateOrderStatus(order.id, "delivered")}
                              >
                                Mark as Delivered
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-[#1A1A1A]/80 border-zinc-800">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-zinc-400 text-sm mb-4">
                If you have any questions about your orders, please contact our customer support.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="border-zinc-700">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-zinc-700">
                  Track Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    )}
    </ProtectedRoute>
  )
}
