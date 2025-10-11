"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Menu, X, ShoppingCart, LogOut, Loader } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ROUTES, MAIN_NAVIGATION, USER_NAVIGATION } from "@/lib/constants/navigation"
import { toast } from "@/hooks/use-toast"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()
  const { user, profile, isAuthenticated, signOut } = useAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
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

  const getInitialsAvatar = () => {
    const name = profile?.full_name || user?.email?.split("@")[0] || "User"
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    return `https://ui-avatars.com/api/?name=${initials}&background=1A1A1A&color=00C4B4&size=128`
  }

  const isActive = (href: string) => {
    if (href === ROUTES.HOME) {
      return pathname === ROUTES.HOME
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0A0A1A]/95 backdrop-blur-lg border-b border-[#00C4B4]/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#00C4B4] to-[#007BFF] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">3D</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#00C4B4] to-[#007BFF] bg-clip-text text-transparent">
              OutfitBuilder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {MAIN_NAVIGATION.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href) ? "text-[#00C4B4]" : "text-zinc-300 hover:text-white"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C4B4] to-[#007BFF]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" asChild className="relative">
                  <Link href={ROUTES.CART}>
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5 bg-[#00C4B4] text-black text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8 border-2 border-[#00C4B4]/30">
                        <AvatarImage src={profile?.avatar_url || getInitialsAvatar()} />
                        <AvatarFallback className="bg-[#1A1A1A] text-[#00C4B4]">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#1A1A1A] border-[#00C4B4]/30" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-white">{profile?.full_name || "User"}</p>
                        <p className="w-[200px] truncate text-sm text-zinc-400">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-zinc-700" />

                    {USER_NAVIGATION.map((item) => (
                      <DropdownMenuItem key={item.href} asChild className="text-white hover:bg-[#00C4B4]/20">
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-zinc-700" />
                    <DropdownMenuItem
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="mr-2 h-4 w-4" />
                      )}
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={ROUTES.LOGIN}>Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#007BFF] to-[#00C4B4]">
                  <Link href={ROUTES.REGISTER}>Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0A0A1A]/95 backdrop-blur-lg border-b border-[#00C4B4]/20"
          >
            <div className="px-4 py-4 space-y-2">
              {MAIN_NAVIGATION.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? "text-[#00C4B4] bg-[#00C4B4]/10"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-800"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="border-t border-zinc-700 pt-4 mt-4">
                    {USER_NAVIGATION.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-md"
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? (
                        <Loader className="mr-3 h-5 w-5 animate-spin" />
                      ) : (
                        <LogOut className="mr-3 h-5 w-5" />
                      )}
                      {isSigningOut ? "Signing Out..." : "Sign Out"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-zinc-700 pt-4 mt-4 space-y-2">
                  <Link
                    href={ROUTES.LOGIN}
                    className="block px-3 py-2 text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-[#007BFF] to-[#00C4B4] text-white rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
