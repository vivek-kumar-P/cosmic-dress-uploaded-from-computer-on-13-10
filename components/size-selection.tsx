"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ruler, Info } from "lucide-react"

const sizes = [
  { id: "XS", name: "XS", measurements: "32-34" },
  { id: "S", name: "S", measurements: "34-36" },
  { id: "M", name: "M", measurements: "36-38" },
  { id: "L", name: "L", measurements: "38-40" },
  { id: "XL", name: "XL", measurements: "40-42" },
  { id: "XXL", name: "XXL", measurements: "42-44" },
]

interface SizeSelectionProps {
  selectedSize: string
  onSizeChange: (size: string) => void
}

export default function SizeSelection({ selectedSize, onSizeChange }: SizeSelectionProps) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">Size</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="text-[#00c4b4] hover:text-[#00a89a] hover:bg-[#00c4b4]/10 p-1 h-auto"
        >
          <Info className="h-3 w-3 mr-1" />
          <span className="text-xs">Size Guide</span>
        </Button>
      </div>

      {/* Size Guide */}
      {showGuide && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="h-3 w-3 text-[#00c4b4]" />
            <span className="font-medium text-white">Size Guide (Chest)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-gray-400">
            {sizes.map((size) => (
              <div key={size.id} className="text-center">
                <div className="font-medium text-white">{size.name}</div>
                <div>{size.measurements}"</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => (
          <Button
            key={size.id}
            variant={selectedSize === size.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSizeChange(size.id)}
            className={`relative transition-all duration-200 ${
              selectedSize === size.id
                ? "bg-gradient-to-r from-[#00c4b4] to-[#007bff] text-white border-0 shadow-lg"
                : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-[#00c4b4]/50"
            }`}
          >
            {size.name}
            {selectedSize === size.id && (
              <Badge className="absolute -top-1 -right-1 bg-white text-black text-xs px-1 min-w-0 h-4">✓</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Selected Size Info */}
      {selectedSize && (
        <div className="text-xs text-gray-400 text-center">
          Selected: <span className="text-white font-medium">{selectedSize}</span> (
          {sizes.find((s) => s.id === selectedSize)?.measurements}" chest)
        </div>
      )}
    </div>
  )
}
