"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Palette, Shirt, Sparkles, Users, ShoppingBag, Zap } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Palette,
    title: "3D Outfit Builder",
    description:
      "Visualize your perfect outfit in stunning 3D before you buy. Mix and match pieces to create your unique style.",
    link: "/3d-playground",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shirt,
    title: "Smart Recommendations",
    description: "Get personalized outfit suggestions based on your style preferences, body type, and occasion.",
    link: "/customize",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Virtual Try-On",
    description: "See how clothes look on you with our advanced AR technology. No more guessing about fit and style.",
    link: "/gallery",
    color: "from-green-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Style Community",
    description: "Connect with fashion enthusiasts, share your outfits, and get inspired by trending styles.",
    link: "/gallery",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: ShoppingBag,
    title: "Curated Collections",
    description: "Discover handpicked fashion items from top brands and emerging designers worldwide.",
    link: "/products",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Styling",
    description: "Get complete outfit suggestions in seconds. Perfect for busy lifestyles and last-minute events.",
    link: "/outfit-picker",
    color: "from-yellow-500 to-orange-500",
  },
]

export default function FeatureCards() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="features-section py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0A0A1A] to-[#1A1A3A]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#00C4B4] via-white to-[#007BFF] bg-clip-text text-transparent">
              Revolutionary Fashion Experience
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform the way you shop for clothes with our cutting-edge technology and personalized styling solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const delay = index * 0.1

            const cardContent = (
              <Card
                key={index}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 overflow-hidden hover:border-[#00C4B4]/50 transition-all duration-500 hover:scale-105"
              >
                <CardContent className="p-8 h-full flex flex-col">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00C4B4] transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-300 mb-6 flex-grow leading-relaxed">{feature.description}</p>

                  <Link href={feature.link}>
                    <Button
                      variant="outline"
                      className="w-full border-[#00C4B4]/30 text-[#00C4B4] hover:bg-[#00C4B4]/10 hover:border-[#00C4B4] transition-all duration-300 bg-transparent"
                    >
                      Explore Feature
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )

            // Render immediately without animation on SSR to prevent invisible content,
            // and animate smoothly after hydration.
            if (!mounted) {
              return (
                <div key={index} className="opacity-100 translate-y-0">
                  {cardContent}
                </div>
              )
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: delay,
                  duration: 0.6,
                }}
                className="will-change-transform will-change-opacity"
              >
                {cardContent}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
