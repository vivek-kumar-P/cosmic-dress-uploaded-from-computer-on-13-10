"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, Shirt, Zap, Sparkles, Save, Eye, ArrowLeft, Plus, Minus, RotateCcw, Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

const outfitCategories = [
  { value: "casual", label: "Casual", color: "#00C4B4" },
  { value: "formal", label: "Formal", color: "#007BFF" },
  { value: "sport", label: "Sport", color: "#FF6B6B" },
  { value: "party", label: "Party", color: "#4ECDC4" },
  { value: "vintage", label: "Vintage", color: "#45B7D1" },
]

const clothingItems = [
  { id: 1, name: "Classic T-Shirt", category: "tops", color: "#FF6B6B" },
  { id: 2, name: "Denim Jacket", category: "outerwear", color: "#4ECDC4" },
  { id: 3, name: "Slim Jeans", category: "bottoms", color: "#007BFF" },
  { id: 4, name: "Sneakers", category: "shoes", color: "#00C4B4" },
  { id: 5, name: "Baseball Cap", category: "accessories", color: "#45B7D1" },
]

export default function CreateOutfitPage() {
  const { user } = useAuth()
  const [outfitName, setOutfitName] = useState("")
  const [outfitDescription, setOutfitDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleItemToggle = (itemId: number) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSaveOutfit = async () => {
    if (!user || !outfitName.trim()) {
      toast({
        title: "Error",
        description: "Please provide an outfit name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const supabase = getSupabaseClient()

    try {
      const outfitData = {
        user_id: user.id,
        name: outfitName,
        description: outfitDescription,
        category: selectedCategory,
        items: selectedItems,
        is_public: isPublic,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("saved_outfits").insert([outfitData])

      if (error) throw error

      toast({
        title: "Success!",
        description: "Your outfit has been saved successfully",
      })

      // Reset form
      setOutfitName("")
      setOutfitDescription("")
      setSelectedCategory("")
      setSelectedItems([])
    } catch (error) {
      console.error("Error saving outfit:", error)
      toast({
        title: "Error",
        description: "Failed to save outfit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A1A] via-[#1A1A3A] to-[#2A1A4A] p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              asChild
              variant="outline"
              className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
                Create New Outfit
              </h1>
              <p className="text-zinc-400">Design your perfect cosmic look</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              className="border-[#4ECDC4]/50 text-[#4ECDC4] hover:bg-[#4ECDC4]/10 bg-transparent"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSaveOutfit}
              disabled={isSaving}
              className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4] hover:from-[#0056b3] hover:to-[#009688]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Outfit"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Preview Area */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  3D Outfit Preview
                </CardTitle>
                <CardDescription>Visualize your outfit in real-time</CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <div className="relative h-full bg-gradient-to-br from-[#007BFF]/10 to-[#00C4B4]/10 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#00C4B4]/20 to-[#007BFF]/20 rounded-full flex items-center justify-center mx-auto">
                      <Palette className="h-16 w-16 text-[#00C4B4]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">3D Avatar Preview</h3>
                      <p className="text-zinc-400 mb-4">Your outfit will appear here as you build it</p>
                      <Button
                        asChild
                        variant="outline"
                        className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                      >
                        <Link href="/3d-playground">
                          <Zap className="h-4 w-4 mr-2" />
                          Open 3D Studio
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* 3D Controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Outfit Configuration */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Outfit Details</CardTitle>
                <CardDescription>Name and describe your creation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="outfit-name">Outfit Name</Label>
                  <Input
                    id="outfit-name"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="My Cosmic Look"
                    className="bg-[#0A0A1A]/50 border-[#00C4B4]/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="outfit-description">Description</Label>
                  <Textarea
                    id="outfit-description"
                    value={outfitDescription}
                    onChange={(e) => setOutfitDescription(e.target.value)}
                    placeholder="Describe your outfit style..."
                    className="bg-[#0A0A1A]/50 border-[#00C4B4]/30 text-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-[#0A0A1A]/50 border-[#00C4B4]/30 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#00C4B4]/30">
                      {outfitCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value} className="text-white">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clothing Items */}
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shirt className="h-5 w-5 mr-2 text-[#00C4B4]" />
                  Clothing Items
                </CardTitle>
                <CardDescription>Select items for your outfit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clothingItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedItems.includes(item.id)
                          ? "bg-[#00C4B4]/20 border-[#00C4B4]/50"
                          : "bg-[#0A0A1A]/50 border-zinc-700 hover:border-[#00C4B4]/30"
                      }`}
                      onClick={() => handleItemToggle(item.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-zinc-400 text-sm capitalize">{item.category}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${
                          selectedItems.includes(item.id)
                            ? "text-[#00C4B4] hover:text-[#00C4B4]"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {selectedItems.includes(item.id) ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle>Sharing Settings</CardTitle>
                <CardDescription>Control who can see your outfit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Make Public</p>
                    <p className="text-zinc-400 text-sm">Allow others to see and like your outfit</p>
                  </div>
                  <Button
                    variant={isPublic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPublic(!isPublic)}
                    className={
                      isPublic
                        ? "bg-gradient-to-r from-[#007BFF] to-[#00C4B4]"
                        : "border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                    }
                  >
                    {isPublic ? "Public" : "Private"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
            <CardHeader>
              <CardTitle>Selected Items ({selectedItems.length})</CardTitle>
              <CardDescription>Items included in your outfit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((itemId) => {
                  const item = clothingItems.find((i) => i.id === itemId)
                  return (
                    <Badge
                      key={itemId}
                      className="bg-gradient-to-r from-[#007BFF]/20 to-[#00C4B4]/20 text-white border-[#00C4B4]/50"
                    >
                      <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item?.color }}></div>
                      {item?.name}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
