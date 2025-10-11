"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubscribed(true)
    setIsLoading(false)
    setEmail("")
  }

  return (
    <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Stay in the Fashion Loop</h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Get the latest fashion trends, exclusive design tips, and early access to new features delivered straight
              to your inbox.
            </p>
          </div>

          {/* Newsletter Form */}
          {!isSubscribed ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-purple-200 focus:border-white/40"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-8 py-2 whitespace-nowrap"
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center gap-3 text-white"
            >
              <CheckCircle className="w-6 h-6 text-green-300" />
              <span className="text-lg font-medium">Thank you for subscribing!</span>
            </motion.div>
          )}

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-purple-100"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span>Weekly Fashion Tips</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span>Exclusive Discounts</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-300 rounded-full"></div>
              <span>Early Feature Access</span>
            </div>
          </motion.div>

          {/* Privacy Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-sm text-purple-200 mt-6"
          >
            We respect your privacy. Unsubscribe at any time.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
