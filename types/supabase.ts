export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: "tops" | "bottoms" | "accessories" | "shoes"
          style: "casual" | "formal" | "streetwear" | "activewear"
          image_url: string | null
          model_url: string | null
          is_new: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: "tops" | "bottoms" | "accessories" | "shoes"
          style: "casual" | "formal" | "streetwear" | "activewear"
          image_url?: string | null
          model_url?: string | null
          is_new?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: "tops" | "bottoms" | "accessories" | "shoes"
          style?: "casual" | "formal" | "streetwear" | "activewear"
          image_url?: string | null
          model_url?: string | null
          is_new?: boolean
          created_at?: string
        }
      }
      avatars: {
        Row: {
          id: string
          user_id: string
          name: string
          gender: "male" | "female" | "other" | null
          height: number | null
          build: "slim" | "average" | "athletic" | null
          skin_tone: string | null
          model_data: Json | null
          body_measurements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          gender?: "male" | "female" | "other" | null
          height?: number | null
          build?: "slim" | "average" | "athletic" | null
          skin_tone?: string | null
          model_data?: Json | null
          body_measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          gender?: "male" | "female" | "other" | null
          height?: number | null
          build?: "slim" | "average" | "athletic" | null
          skin_tone?: string | null
          model_data?: Json | null
          body_measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      avatar_measurements: {
        Row: {
          id: string
          avatar_id: string
          measurement_type: string
          value: number
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          avatar_id: string
          measurement_type: string
          value: number
          unit: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          avatar_id?: string
          measurement_type?: string
          value?: number
          unit?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_outfits: {
        Row: {
          id: string
          user_id: string
          avatar_id: string | null
          name: string
          description: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar_id?: string | null
          name: string
          description?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar_id?: string | null
          name?: string
          description?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          product_id: string
          position_data: string | null
          customization_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          product_id: string
          position_data?: string | null
          customization_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          product_id?: string
          position_data?: string | null
          customization_data?: Json | null
          created_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          image_url: string | null
          is_public: boolean
          likes_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          image_url?: string | null
          is_public?: boolean
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          is_public?: boolean
          likes_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      colors: {
        Row: {
          id: string
          name: string
          hex_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          hex_code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          hex_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      sizes: {
        Row: {
          id: string
          name: string
          code: string
          measurements: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          measurements?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size_id: string | null
          color_id: string | null
          price: number | null
          stock_quantity: number
          sku: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size_id?: string | null
          color_id?: string | null
          price?: number | null
          stock_quantity?: number
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size_id?: string | null
          color_id?: string | null
          price?: number | null
          stock_quantity?: number
          sku?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      product_models: {
        Row: {
          id: string
          product_id: string
          model_url: string
          format: string | null
          version: string | null
          model_metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          model_url: string
          format?: string | null
          version?: string | null
          model_metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          model_url?: string
          format?: string | null
          version?: string | null
          model_metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      product_tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      product_tag_relations: {
        Row: {
          id: string
          product_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
