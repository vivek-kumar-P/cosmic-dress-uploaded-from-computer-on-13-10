"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Filter, X } from "lucide-react"

interface GalleryFiltersProps {
  onFiltersChange: (filters: {
    category: string[]
    style: string[]
    priceRange: [number, number]
  }) => void
  initialFilters: {
    category: string[]
    style: string[]
    priceRange: [number, number]
  }
}

export default function GalleryFilters({ onFiltersChange, initialFilters }: GalleryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.category)
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialFilters.style)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Sync with initialFilters when they change
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      return
    }

    setPriceRange(initialFilters.priceRange)
    setSelectedCategories(initialFilters.category)
    setSelectedStyles(initialFilters.style)
  }, [initialFilters, isInitialized])

  const categories = [
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "accessories", label: "Accessories" },
    { id: "shoes", label: "Shoes" },
    { id: "collections", label: "Full Collections" },
  ]

  const styles = [
    { id: "casual", label: "Cosmic Casual" },
    { id: "formal", label: "Stardust Formal" },
    { id: "streetwear", label: "Nebula Streetwear" },
    { id: "activewear", label: "Orbit Activewear" },
  ]

  const applyFilters = () => {
    // Update URL with filter params
    const params = new URLSearchParams()

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    }

    if (selectedStyles.length > 0) {
      params.set("style", selectedStyles.join(","))
    }

    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    router.push(`/gallery?${params.toString()}`)

    // Notify parent component
    onFiltersChange({
      category: selectedCategories,
      style: selectedStyles,
      priceRange,
    })

    setShowMobileFilters(false)
  }

  const resetFilters = () => {
    setPriceRange([0, 200])
    setSelectedCategories([])
    setSelectedStyles([])

    // Clear URL params
    router.push("/gallery")

    // Notify parent component
    onFiltersChange({
      category: [],
      style: [],
      priceRange: [0, 200],
    })

    setShowMobileFilters(false)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleStyle = (styleId: string) => {
    setSelectedStyles((prev) => (prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]))
  }

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-6 flex justify-between items-center">
        <Button
          variant="outline"
          className="border-zinc-700 flex items-center gap-2"
          onClick={() => setShowMobileFilters(true)}
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      {/* Mobile filter drawer */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/80 z-50 transition-opacity duration-300 ${showMobileFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`absolute right-0 top-0 bottom-0 w-[300px] bg-[#1A1A1A] p-6 transition-transform duration-300 ${showMobileFilters ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl">Filters</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filter content - same as desktop */}
          <div className="space-y-8">
            {/* Price Range */}
            <div>
              <h3 className="font-medium mb-4">Price Range</h3>
              <Slider
                value={priceRange}
                min={0}
                max={200}
                step={5}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex justify-between mt-2 text-sm text-zinc-400">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Categories */}
            <div>
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`mobile-category-${category.id}`} className="text-zinc-300">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Styles */}
            <div>
              <h3 className="font-medium mb-4">Styles</h3>
              <div className="space-y-3">
                {styles.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-style-${style.id}`}
                      checked={selectedStyles.includes(style.id)}
                      onCheckedChange={() => toggleStyle(style.id)}
                    />
                    <Label htmlFor={`mobile-style-${style.id}`} className="text-zinc-300">
                      {style.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" className="w-full border-zinc-700" onClick={resetFilters}>
                Reset All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop filters */}
      <div className="hidden lg:block sticky top-24 space-y-8">
        <div>
          <h3 className="font-medium mb-4">Price Range</h3>
          <Slider
            value={priceRange}
            min={0}
            max={200}
            step={5}
            onValueChange={(value) => setPriceRange(value as [number, number])}
          />
          <div className="flex justify-between mt-2 text-sm text-zinc-400">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        <div>
          <h3 className="font-medium mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <Label htmlFor={`category-${category.id}`} className="text-zinc-300">
                  {category.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        <div>
          <h3 className="font-medium mb-4">Styles</h3>
          <div className="space-y-3">
            {styles.map((style) => (
              <div key={style.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`style-${style.id}`}
                  checked={selectedStyles.includes(style.id)}
                  onCheckedChange={() => toggleStyle(style.id)}
                />
                <Label htmlFor={`style-${style.id}`} className="text-zinc-300">
                  {style.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-zinc-800" />

        <div className="pt-2 space-y-3">
          <Button className="w-full bg-gradient-to-r from-[#007BFF] to-[#00C4B4]" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" className="w-full border-zinc-700" onClick={resetFilters}>
            Reset All
          </Button>
        </div>
      </div>
    </>
  )
}
