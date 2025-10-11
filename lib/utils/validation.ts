import { z } from "zod"

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Profile schemas
export const profileUpdateSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  full_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
})

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category_id: z.string().uuid("Invalid category ID"),
  brand: z.string().optional(),
  colors: z.array(z.string()),
  sizes: z.array(z.string()),
  tags: z.array(z.string()),
})

// Outfit schemas
export const outfitSchema = z.object({
  name: z.string().min(1, "Outfit name is required").max(100),
  description: z.string().max(500).optional(),
  is_public: z.boolean().default(false),
  tags: z.array(z.string()).max(10),
})

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validatePassword = (password: string): boolean => {
  return z.string().min(6).safeParse(password).success
}

export const validateUsername = (username: string): boolean => {
  return z.string().min(3).max(20).safeParse(username).success
}
