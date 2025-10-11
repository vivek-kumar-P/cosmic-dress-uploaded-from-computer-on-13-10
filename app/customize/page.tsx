"use client"

import { useState, useEffect } from "react"
import { gsap } from "gsap"
import { ArrowLeft, Palette, Shirt, Users, Save, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import SizeSelection from "@/components/size-selection"
import CanvasStage from "@/components/customizer/CanvasStage"
import CustomTabs from "@/components/customizer/controls/Tabs"
import ColorPicker from "@/components/customizer/controls/ColorPicker"
import FilePicker from "@/components/customizer/controls/FilePicker"
import LogoPresets from "@/components/customizer/controls/LogoPresets"
import LogoGrid from "@/components/customizer/controls/LogoGrid"
import ChatBot from "@/components/customizer/ChatBot"
import ScreenshotButton from "@/components/customizer/ScreenshotButton"

const categories = [
  { id: "tops", name: "Tops", icon: <Shirt className="h-4 w-4" />, count: 24 },
  { id: "bottoms", name: "Bottoms", icon: <Shirt className="h-4 w-4" />, count: 18 },
  { id: "shoes", name: "Shoes", icon: <Shirt className="h-4 w-4" />, count: 12 },
  { id: "accessories", name: "Accessories", icon: <Shirt className="h-4 w-4" />, count: 8 },
]

const colors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#D7BDE2",
  "#A3E4D7",
]

export default function CustomizePage() {
  const [selectedCategory, setSelectedCategory] = useState("tops")
  const [selectedColor, setSelectedColor] = useState("#FF6B6B")
  const [selectedSize, setSelectedSize] = useState("M")

  useEffect(() => {
    // Page entrance animations
    gsap.fromTo(".customize-header", { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })

    gsap.fromTo(
      ".customize-content",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" },
    )
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#2a1a4a] text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="customize-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00c4b4] to-[#007bff]">
                3D Outfit Builder
              </h1>
              <p className="text-sm md:text-base text-gray-400 mt-1">Create your perfect look</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 flex-1 sm:flex-none"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 flex-1 sm:flex-none"
            >
              <Share2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <ScreenshotButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="customize-content grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 h-[400px] md:h-[600px]">
              <CardContent className="p-4 md:p-6 h-full">
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a3a] to-[#2a1a4a] rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0">
                    <CanvasStage />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="order-1 lg:order-2">
            <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
              <CardContent className="p-4 md:p-6">
                {/* T-Shirt Customizer Controls */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-300">T‑Shirt Customizer</h2>
                  </div>
                  <CustomTabs active={"color"} onChange={() => {}} />
                  <ColorPicker />
                  <FilePicker />
                  <LogoPresets />
                  <div>
                    <h3 className="text-xs font-medium text-gray-400 mb-2">Quick Logos</h3>
                    <LogoGrid />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-400 mb-2">Chat-bot</h3>
                    <div className="min-h-[200px]">
                      <ChatBot />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="btn btn-sm" onClick={() => location.reload()}>Reset</button>
                    <button className="btn btn-sm" onClick={() => (window as any).dispatchEvent(new Event('toggle-logo'))}>Toggle Logo</button>
                    <button className="btn btn-sm" onClick={() => (window as any).dispatchEvent(new Event('toggle-full'))}>Toggle Full</button>
                    <ScreenshotButton />
                  </div>
                </div>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                  {/* Category Tabs */}
                  <TabsList className="grid grid-cols-2 lg:grid-cols-1 gap-2 bg-transparent p-0 h-auto mb-6">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c4b4]/20 data-[state=active]:to-[#007bff]/20 data-[state=active]:border-[#00c4b4]/50 text-white hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                          {category.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Category Content */}
                  {categories.map((category) => (
                    <TabsContent key={category.id} value={category.id} className="mt-0">
                      <div className="space-y-6">
                        {/* Items Grid */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-300 mb-3">Choose Item</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square bg-gradient-to-br from-white/5 to-white/10 rounded-lg border border-white/10 hover:border-[#00c4b4]/50 cursor-pointer transition-all duration-200 hover:scale-105 flex items-center justify-center"
                              >
                                <Shirt className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Color Selection */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-300 mb-3">Choose Color</h3>
                          <div className="grid grid-cols-4 gap-2">
                            {colors.map((color, i) => (
                              <button
                                key={i}
                                onClick={() => setSelectedColor(color)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                                  selectedColor === color ? "border-white shadow-lg" : "border-white/20"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Size Selection */}
                        <SizeSelection selectedSize={selectedSize} onSizeChange={setSelectedSize} />

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <Button className="w-full bg-gradient-to-r from-[#00c4b4] to-[#007bff] hover:from-[#00a89a] hover:to-[#0056d6] text-white font-semibold py-3">
                            Add to Outfit
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10"
                          >
                            Preview in AR
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions - Mobile */}
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-[#0a0a1a]/90 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-white/20 bg-white/10 text-white">
              <Palette className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-[#00c4b4] to-[#007bff]">
              <Save className="h-4 w-4 mr-2" />
              Save Look
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
