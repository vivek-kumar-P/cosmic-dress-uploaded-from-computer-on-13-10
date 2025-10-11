"use client"

import { motion } from "framer-motion"
import { ArrowRight, Palette, Eye, ShoppingBag, Share2 } from "lucide-react"

const steps = [
  {
    icon: Palette,
    title: "Design & Customize",
    description:
      "Choose from hundreds of clothing items and customize colors, patterns, and styles to create your unique look.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Eye,
    title: "Visualize in 3D",
    description:
      "See your outfit come to life with our advanced 3D visualization technology. Rotate, zoom, and inspect every detail.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: ShoppingBag,
    title: "Shop & Purchase",
    description:
      "Love your creation? Purchase the items directly through our platform with seamless checkout experience.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Share2,
    title: "Share & Inspire",
    description:
      "Share your designs with the community, get feedback, and inspire others with your fashion creativity.",
    color: "from-orange-500 to-red-500",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create stunning 3D outfits in just four simple steps. From design to purchase, we've made fashion design
            accessible to everyone.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-green-200 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                {/* Step Number */}
                <div className="relative mb-6">
                  <div
                    className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${step.color} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-sm font-bold text-gray-700">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 text-gray-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
            Get Started Today
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
