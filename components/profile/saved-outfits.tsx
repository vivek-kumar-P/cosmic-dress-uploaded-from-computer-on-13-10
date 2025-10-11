"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { getUserOutfits, deleteOutfit } from "@/app/actions/outfit-actions"
import { toast } from "@/hooks/use-toast"
import { Eye, Trash2, Heart, Calendar, Tag } from "lucide-react"
import Link from "next/link"

export default function SavedOutfits() {
  const { user } = useAuth()
  const [outfits, setOutfits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchOutfits = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const result = await getUserOutfits(user.id)
        if (result.success && result.outfits) {
          setOutfits(result.outfits)
        } else {
          toast({
            title: "Error fetching outfits",
            description: "Could not load your saved outfits",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching outfits:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOutfits()
  }, [user])

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!user) return

    setIsDeleting(outfitId)
    try {
      const result = await deleteOutfit(outfitId, user.id)
      if (result.success) {
        setOutfits(outfits.filter((outfit) => outfit.id !== outfitId))
        toast({
          title: "Outfit deleted",
          description: "Your outfit has been deleted successfully",
        })
      } else {
        toast({
          title: "Error deleting outfit",
          description: "Could not delete the outfit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting outfit:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="bg-[#1A1A1A]/80 border-[#00C4B4]/30 backdrop-blur-lg">
      <CardHeader>
        <CardTitle>Saved Outfits</CardTitle>
        <CardDescription>View and manage your saved outfits</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all">All Outfits</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : outfits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">You haven't saved any outfits yet.</p>
                <Button asChild className="mt-4 bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                  <Link href="/3d-playground">Create an Outfit</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {outfits.map((outfit) => (
                  <div
                    key={outfit.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-800 hover:border-[#00C4B4]/50 transition-all"
                  >
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="bg-[#1A1A1A] h-16 w-16 rounded-md flex items-center justify-center">
                        {outfit.is_favorite && <Heart className="h-6 w-6 text-[#00C4B4]" fill="#00C4B4" />}
                        {!outfit.is_favorite && <Tag className="h-6 w-6 text-zinc-400" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{outfit.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-zinc-400">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(outfit.created_at)}
                          </div>
                          <div>{outfit.outfit_items?.length || 0} items</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <Button variant="outline" size="sm" className="border-zinc-700 w-full md:w-auto" asChild>
                        <Link href={`/preview?outfit=${outfit.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-red-500 hover:text-red-400 hover:border-red-500 w-full md:w-auto"
                        onClick={() => handleDeleteOutfit(outfit.id)}
                        disabled={isDeleting === outfit.id}
                      >
                        {isDeleting === outfit.id ? (
                          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : outfits.filter((o) => o.is_favorite).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">You don't have any favorite outfits yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outfits
                  .filter((outfit) => outfit.is_favorite)
                  .map((outfit) => (
                    <div
                      key={outfit.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-800 hover:border-[#00C4B4]/50 transition-all"
                    >
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="bg-[#1A1A1A] h-16 w-16 rounded-md flex items-center justify-center">
                          <Heart className="h-6 w-6 text-[#00C4B4]" fill="#00C4B4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{outfit.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-zinc-400">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(outfit.created_at)}
                            </div>
                            <div>{outfit.outfit_items?.length || 0} items</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="border-zinc-700 w-full md:w-auto" asChild>
                          <Link href={`/preview?outfit=${outfit.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-red-500 hover:text-red-400 hover:border-red-500 w-full md:w-auto"
                          onClick={() => handleDeleteOutfit(outfit.id)}
                          disabled={isDeleting === outfit.id}
                        >
                          {isDeleting === outfit.id ? (
                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : outfits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">You haven't saved any outfits recently.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outfits
                  .slice(0, 5) // Show only the 5 most recent outfits
                  .map((outfit) => (
                    <div
                      key={outfit.id}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-[#0A0A1A] rounded-lg border border-zinc-800 hover:border-[#00C4B4]/50 transition-all"
                    >
                      <div className="flex items-center space-x-4 mb-4 md:mb-0">
                        <div className="bg-[#1A1A1A] h-16 w-16 rounded-md flex items-center justify-center">
                          {outfit.is_favorite ? (
                            <Heart className="h-6 w-6 text-[#00C4B4]" fill="#00C4B4" />
                          ) : (
                            <Tag className="h-6 w-6 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{outfit.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-zinc-400">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(outfit.created_at)}
                            </div>
                            <div>{outfit.outfit_items?.length || 0} items</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="border-zinc-700 w-full md:w-auto" asChild>
                          <Link href={`/preview?outfit=${outfit.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-zinc-700 text-red-500 hover:text-red-400 hover:border-red-500 w-full md:w-auto"
                          onClick={() => handleDeleteOutfit(outfit.id)}
                          disabled={isDeleting === outfit.id}
                        >
                          {isDeleting === outfit.id ? (
                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
