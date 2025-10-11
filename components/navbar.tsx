"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { Menu, ShoppingCart, User, Star, Home, Palette, GridIcon, LogOut, Loader, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { toast } from "@/hooks/use-toast"

export default function Navbar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [scrolled, setScrolled] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { totalItems } = useCart()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cart animation
  useEffect(() => {
    // GSAP animation for cart badge
    if (totalItems > 0) {
      gsap.fromTo(".cart-badge", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out" })
    }
  }, [totalItems])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "There was a problem signing out",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/customize", label: "Customize", icon: <Palette className="h-4 w-4 mr-2" /> },
    { href: "/gallery", label: "Gallery", icon: <GridIcon className="h-4 w-4 mr-2" /> },
  ]

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }

    return "U"
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A0A1A]/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
      aria-label="Navigation"
    >
      <div className="px-4 md:px-8 py-3 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <div className="relative w-10 h-10 mr-2 flex items-center justify-center">
            <Star className="absolute text-[#00C4B4] w-6 h-6 animate-pulse" />
            <Star className="text-white w-10 h-10" />
          </div>
          <span className="font-bold text-xl">Cosmic Outfits</span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Link href={isAuthenticated ? "/cart" : "/auth/login?returnUrl=/cart"}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="cart-badge absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 bg-[#00C4B4] text-black text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-[#0A0A1A] border-zinc-800">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Navigation Links */}
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center text-lg ${
                        pathname === link.href ? "text-[#00C4B4] font-medium" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}

                  {/* Authenticated User Options */}
                  {isAuthenticated ? (
                    <>
                      <Link href="/dashboard" className="flex items-center text-lg text-zinc-400 hover:text-white">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                      <Link href="/profile" className="flex items-center text-lg text-zinc-400 hover:text-white">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/profile/settings"
                        className="flex items-center text-lg text-zinc-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        className="flex items-center text-lg text-zinc-400 hover:text-white"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? (
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4 mr-2" />
                        )}
                        {isSigningOut ? "Signing Out..." : "Sign Out"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="flex items-center text-lg text-zinc-400 hover:text-white">
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                      <Link href="/auth/register" className="flex items-center text-lg text-zinc-400 hover:text-white">
                        <User className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <nav className="flex items-center gap-1">
            {/* Navigation Links */}
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  className={`px-4 ${
                    pathname === link.href ? "text-[#00C4B4] bg-[#00C4B4]/10" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            <div className="flex items-center ml-2">
              {/* Authenticated User Menu */}
              {isAuthenticated ? (
                <>
                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                          <AvatarFallback className="bg-[#00C4B4] text-black">{getInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1A1A1A] border-zinc-800">
                      <div className="px-2 py-1.5 text-sm font-medium text-white">{profile?.full_name || "User"}</div>
                      <div className="px-2 py-1.5 text-xs text-zinc-400">{user?.email}</div>
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href="/profile/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                      >
                        {isSigningOut ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Signing Out...
                          </>
                        ) : (
                          "Sign Out"
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Sign In/Up Buttons for Non-Authenticated Users */}
                  <Button asChild variant="ghost" className="text-zinc-400 hover:text-white">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#00C4B4] text-[#00C4B4] hover:bg-[#00C4B4]/10 bg-transparent"
                  >
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )}

              {/* Cart Icon */}
              <Link href={isAuthenticated ? "/cart" : "/auth/login?returnUrl=/cart"}>
                <Button variant="ghost" size="icon" className="relative ml-2">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge className="cart-badge absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 bg-[#00C4B4] text-black text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
