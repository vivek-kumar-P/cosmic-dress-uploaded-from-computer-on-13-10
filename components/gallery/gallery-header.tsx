"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"

export default function GalleryHeader() {
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Header animation
    gsap.from(".gallery-title", {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
    })

    gsap.from(".gallery-subtitle", {
      opacity: 0,
      y: 30,
      duration: 1,
      delay: 0.3,
      ease: "power3.out",
    })
  }, [])

  return (
    <div ref={headerRef} className="relative py-20 px-4 md:px-8 text-center">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A1A]/80 to-[#1A1A3A]/80"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="gallery-title text-4xl md:text-5xl font-bold mb-4 tracking-tight">Cosmic Collection Gallery</h1>
        <p className="gallery-subtitle text-lg text-zinc-300 max-w-2xl mx-auto">
          Explore our universe of fashion designs, from nebula-inspired streetwear to stardust formal attire
        </p>
      </div>
    </div>
  )
}
