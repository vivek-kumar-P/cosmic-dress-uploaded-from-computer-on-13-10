import { Home, Palette, Grid, Sparkles, User, ShoppingCart, Settings, BarChart3 } from "lucide-react"
import { ROUTES } from "./routes"

export const MAIN_NAVIGATION = [
  {
    label: "Home",
    href: ROUTES.HOME,
    icon: Home,
    description: "Welcome to Cosmic Outfits",
  },
  {
    label: "Gallery",
    href: ROUTES.GALLERY,
    icon: Grid,
    description: "Browse outfit collections",
  },
  {
    label: "Customize",
    href: ROUTES.CUSTOMIZE,
    icon: Palette,
    description: "Create your perfect outfit",
  },
  {
    label: "3D Studio",
    href: ROUTES.THREE_D_PLAYGROUND,
    icon: Sparkles,
    description: "Advanced 3D outfit builder",
  },
] as const

export const USER_NAVIGATION = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: BarChart3,
    description: "Your personal dashboard",
  },
  {
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
    description: "Manage your profile",
  },
  {
    label: "Settings",
    href: ROUTES.PROFILE_SETTINGS,
    icon: Settings,
    description: "Account settings",
  },
  {
    label: "Cart",
    href: ROUTES.CART,
    icon: ShoppingCart,
    description: "Shopping cart",
  },
] as const

export const FOOTER_NAVIGATION = {
  product: [
    { label: "Features", href: "/#features" },
    { label: "Gallery", href: ROUTES.GALLERY },
    { label: "3D Studio", href: ROUTES.THREE_D_PLAYGROUND },
    { label: "Pricing", href: "/pricing" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Community", href: "/community" },
    { label: "Status", href: "/status" },
    { label: "API Docs", href: "/docs" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Cookies", href: "/cookies" },
    { label: "Licenses", href: "/licenses" },
  ],
} as const
