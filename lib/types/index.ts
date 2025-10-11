// Centralized type definitions
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
}

export interface Profile {
  id: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  website?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category_id: string
  brand?: string
  colors: string[]
  sizes: string[]
  tags: string[]
  model_url?: string
  images: string[]
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  parent_id?: string
  sort_order: number
}

export interface Avatar {
  id: string
  user_id: string
  name: string
  avatar_data: Record<string, any>
  measurements: Record<string, any>
  is_default: boolean
  created_at: string
}

export interface SavedOutfit {
  id: string
  user_id: string
  avatar_id?: string
  name: string
  description?: string
  is_public: boolean
  tags: string[]
  thumbnail_url?: string
  created_at: string
  updated_at: string
  outfit_items?: OutfitItem[]
}

export interface OutfitItem {
  id: string
  outfit_id: string
  product_id: string
  variant_id?: string
  position_data?: Record<string, any>
  customization_data?: Record<string, any>
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  variant_id?: string
  quantity: number
  added_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  shipping_address: Record<string, any>
  billing_address: Record<string, any>
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  total_price: number
  product?: Product
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  username: string
}

export interface ProfileUpdateForm {
  username?: string
  full_name?: string
  bio?: string
  website?: string
  location?: string
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface FilterState {
  category?: string
  priceRange?: [number, number]
  colors?: string[]
  sizes?: string[]
  tags?: string[]
  sortBy?: "name" | "price" | "created_at" | "popularity"
  sortOrder?: "asc" | "desc"
}
