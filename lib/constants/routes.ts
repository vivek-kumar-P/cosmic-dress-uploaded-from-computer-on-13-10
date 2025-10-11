// Centralized route definitions
export const ROUTES = {
  // Public routes
  HOME: "/",
  GALLERY: "/gallery",

  // Auth routes
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  PROFILE_SETTINGS: "/profile/settings",

  // Shopping routes
  CUSTOMIZE: "/customize",
  CART: "/cart",
  CHECKOUT: "/checkout",

  // Studio routes
  THREE_D_PLAYGROUND: "/3d-playground",
  OUTFIT_PICKER: "/outfit-picker",

  // API routes
  API: {
    AUTH: "/api/auth",
    PRODUCTS: "/api/products",
    OUTFITS: "/api/outfits",
    CART: "/api/cart",
  },
} as const

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.PROFILE_SETTINGS,
  ROUTES.CART,
  ROUTES.CHECKOUT,
] as const

export const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER] as const
