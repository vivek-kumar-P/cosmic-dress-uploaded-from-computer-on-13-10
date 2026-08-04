export interface UserAddress {
  id?: string
  user_id?: string
  full_name: string
  phone?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state?: string
  country: string
  postal_code?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserPreferences {
  id?: string
  user_id?: string
  preferred_styles?: string[]
  preferred_colors?: string[]
  preferred_sizes?: string[]
  preferred_categories?: string[]
  preferred_occasions?: string[]
  created_at?: string
  updated_at?: string
}
