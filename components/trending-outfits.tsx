"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Eye, Share2, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

const trendingOutfits = [
  {
    id: 1,
    title: "Summer Breeze Collection",
    creator: "Sarah M.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 1234,
    views: 5678,
    tags: ["Summer", "Casual", "Trendy"],
    trending: true,
  },
  {
    id: 2,
    title: "Urban Street Style",
    creator: "Alex K.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 987,
    views: 3456,
    tags: ["Street", "Urban", "Cool"],
    trending: true,
  },
  {
    id: 3,
    title: "Elegant Evening Wear",
    creator: "Emma R.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 2156,
    views: 7890,
    tags: ["Elegant", "Evening", "Formal"],
    trending: true,
  },
  {
    id: 4,
    title: "Cozy Autumn Vibes",
    creator: "Mike D.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 876,
    views: 2345,
    tags: ["Autumn", "Cozy", "Warm"],
    trending: false,
  },
  {
    id: 5,
    title: "Business Professional",
    creator: "Lisa W.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 654,
    views: 1987,
    tags: ["Business", "Professional", "Smart"],
    trending: false,
  },
  {
    id: 6,
    title: "Bohemian Chic",
    creator: "Maya P.",
    image: "/placeholder.svg?height=400&width=300",
    likes: 1543,
    views: 4321,
    tags: ["Bohemian", "Chic", "Artistic"],
    trending: true,
  },
]

export default function TrendingOutfits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Trending
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {" "}
                Outfits
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most popular and inspiring outfit creations from our community of fashion enthusiasts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white group-hover:bg-gray-50">
                <div className="relative">
                  <Image
                    src={outfit.image || "/placeholder.svg"}
                    alt={outfit.title}
                    width={300}
                    height={400}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {outfit.trending && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-8 h-8 p-0 bg-white/80 backdrop-blur-sm hover:bg-white"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {outfit.title}
                      </h3>
                      <p className="text-sm text-gray-600">by {outfit.creator}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {outfit.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{outfit.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{outfit.views.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-3 text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
          >
            View All Trending Outfits
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
