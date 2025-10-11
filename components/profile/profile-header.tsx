"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { MapPin, Mail, Phone, Globe, Edit } from "lucide-react"
import Link from "next/link"

export default function ProfileHeader() {
  const { user, profile } = useAuth()

  if (!user || !profile) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-[#1A1A3A] to-[#2A2A4A] border-[#00C4B4]/30">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center md:items-start">
            <Avatar className="h-24 w-24 border-4 border-[#00C4B4]/30">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.full_name || "User"} />
              <AvatarFallback className="bg-[#1A1A1A] text-2xl text-[#00C4B4]">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="mt-2 bg-[#00C4B4]/20 text-[#00C4B4]">
              Verified
            </Badge>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name || profile.username || "User"}</h1>
              {profile.username && profile.full_name && <p className="text-zinc-400">@{profile.username}</p>}
              {profile.bio && <p className="text-zinc-300 mt-2">{profile.bio}</p>}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-zinc-300">
                <Mail className="h-4 w-4 text-[#00C4B4]" />
                <span>{user.email}</span>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone className="h-4 w-4 text-[#00C4B4]" />
                  <span>{profile.phone}</span>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Globe className="h-4 w-4 text-[#00C4B4]" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#00C4B4] transition-colors"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              {(profile.address || profile.city || profile.state || profile.country) && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="h-4 w-4 text-[#00C4B4]" />
                  <span>
                    {[profile.address, profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex md:flex-col gap-2">
            <Button
              asChild
              variant="outline"
              className="border-[#00C4B4]/50 text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
            >
              <Link href="/profile/settings">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
