# 3D Outfit Builder - Application Architecture

## 🏗️ Overall Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: React Context + Local Storage
- **Animations**: Framer Motion + GSAP
- **3D Visualization**: CSS-based 3D transforms

## 📁 Project Structure

\`\`\`
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── settings/
│   ├── (shop)/                   # Shopping experience
│   │   ├── gallery/
│   │   ├── customize/
│   │   ├── cart/
│   │   └── checkout/
│   ├── (studio)/                 # Creative tools
│   │   ├── 3d-playground/
│   │   └── outfit-picker/
│   ├── api/                      # API routes
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Authentication components
│   ├── dashboard/                # Dashboard-specific components
│   ├── gallery/                  # Gallery components
│   ├── profile/                  # Profile components
│   ├── cart/                     # Shopping cart components
│   ├── 3d/                       # 3D visualization components
│   └── layout/                   # Layout components (navbar, footer)
├── contexts/                     # React contexts
├── hooks/                        # Custom hooks
├── lib/                          # Utility libraries
├── types/                        # TypeScript type definitions
└── scripts/                      # Database scripts
\`\`\`

## 🗄️ Database Schema

### Core Tables

#### 1. User Management
\`\`\`sql
-- Profiles (extends Supabase auth.users)
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- User preferences
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  theme TEXT DEFAULT 'dark',
  notifications JSONB,
  privacy_settings JSONB
)
\`\`\`

#### 2. Product Catalog
\`\`\`sql
-- Categories
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER
)

-- Products
products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id),
  brand TEXT,
  colors JSONB,
  sizes JSONB,
  tags TEXT[],
  model_url TEXT,
  images JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

-- Product variants (colors, sizes)
product_variants (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  sku TEXT UNIQUE,
  color TEXT,
  size TEXT,
  price DECIMAL(10,2),
  stock_quantity INTEGER,
  model_url TEXT
)
\`\`\`

#### 3. 3D Avatar System
\`\`\`sql
-- User avatars
avatars (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  avatar_data JSONB, -- 3D model configuration
  measurements JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Avatar measurements
avatar_measurements (
  id UUID PRIMARY KEY,
  avatar_id UUID REFERENCES avatars(id),
  measurement_type TEXT, -- height, chest, waist, etc.
  value DECIMAL(5,2),
  unit TEXT DEFAULT 'cm'
)
\`\`\`

#### 4. Outfit System
\`\`\`sql
-- Saved outfits
saved_outfits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  avatar_id UUID REFERENCES avatars(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  thumbnail_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Outfit items (products in an outfit)
outfit_items (
  id UUID PRIMARY KEY,
  outfit_id UUID REFERENCES saved_outfits(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  position_data JSONB, -- 3D positioning
  customization_data JSONB -- colors, adjustments
)
\`\`\`

#### 5. Shopping System
\`\`\`sql
-- Shopping cart (persistent)
cart_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER DEFAULT 1,
  added_at TIMESTAMP
)

-- Orders
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMP
)

-- Order items
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
)
\`\`\`

#### 6. Social Features
\`\`\`sql
-- Outfit likes
outfit_likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  outfit_id UUID REFERENCES saved_outfits(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, outfit_id)
)

-- Comments
outfit_comments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  outfit_id UUID REFERENCES saved_outfits(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP
)

-- User follows
user_follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP,
  UNIQUE(follower_id, following_id)
)
\`\`\`

## 🔗 Page Flow & Navigation

### 1. Authentication Flow
\`\`\`
Landing Page (/) 
    ↓
Register (/auth/register) → Email Confirmation → Login
    ↓
Login (/auth/login) → Dashboard (/dashboard)
\`\`\`

### 2. Main User Journey
\`\`\`
Dashboard (/dashboard)
    ├── Profile Management (/profile)
    │   ├── Settings (/profile/settings)
    │   └── Saved Outfits (/profile/outfits)
    ├── Shopping Experience
    │   ├── Gallery (/gallery) → Product Details
    │   ├── Customize (/customize) → 3D Builder
    │   ├── Cart (/cart) → Checkout (/checkout)
    │   └── Order History (/orders)
    └── Creative Tools
        ├── 3D Playground (/3d-playground)
        └── Outfit Picker (/outfit-picker)
\`\`\`

### 3. Navigation Hierarchy
\`\`\`
Primary Navigation:
├── Home (/)
├── Gallery (/gallery)
├── Customize (/customize)
├── 3D Studio (/3d-playground)
└── Profile Menu
    ├── Dashboard (/dashboard)
    ├── Profile (/profile)
    ├── Settings (/profile/settings)
    ├── Cart (/cart)
    └── Sign Out

Secondary Navigation:
├── Gallery Filters & Search
├── Product Categories
├── Outfit Collections
└��─ User-Generated Content
\`\`\`

## 🎯 Component Architecture

### 1. Layout Components
\`\`\`typescript
// Global Layout
app/layout.tsx
├── Navbar (components/layout/navbar.tsx)
├── Main Content
└── Footer (components/layout/footer.tsx)

// Page-specific Layouts
├── AuthLayout (for login/register)
├── DashboardLayout (for protected pages)
└── ShopLayout (for shopping pages)
\`\`\`

### 2. Feature Components
\`\`\`typescript
// Authentication
components/auth/
├── LoginForm
├── RegisterForm
├── ProtectedRoute
└── AuthProvider

// 3D Visualization
components/3d/
├── AvatarModel
├── ProductModelViewer
├── OutfitCombinationView
└── ThreeScene

// Shopping
components/shop/
├── ProductCard
├── ProductGrid
├── CartItem
├── CheckoutForm
└── OrderSummary
\`\`\`

## 🔄 State Management Strategy

### 1. Global State (React Context)
\`\`\`typescript
// Authentication State
AuthContext: {
  user, session, isAuthenticated,
  signIn, signUp, signOut, updateProfile
}

// Shopping Cart State
CartContext: {
  items, totalItems, totalPrice,
  addItem, removeItem, updateQuantity, clearCart
}

// 3D Builder State
BuilderContext: {
  selectedAvatar, selectedItems, currentOutfit,
  updateAvatar, addItem, removeItem, saveOutfit
}
\`\`\`

### 2. Local State (Component Level)
- Form states
- UI states (modals, dropdowns)
- Temporary selections
- Animation states

### 3. Server State (Supabase)
- User profiles
- Product catalog
- Saved outfits
- Order history

## 🛡️ Security & Permissions

### Row Level Security (RLS) Policies
\`\`\`sql
-- Profiles: Users can only see/edit their own profile
-- Outfits: Users can see public outfits + their own private ones
-- Cart: Users can only access their own cart
-- Orders: Users can only see their own orders
\`\`\`

### API Route Protection
\`\`\`typescript
// Middleware for protected routes
middleware.ts: {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/api/protected/:path*']
}
\`\`\`

## 📱 Responsive Design Strategy

### Breakpoints
\`\`\`css
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
\`\`\`

### Mobile-First Components
- Collapsible navigation
- Touch-friendly 3D controls
- Optimized image loading
- Gesture support

## 🚀 Performance Optimization

### 1. Code Splitting
\`\`\`typescript
// Route-based splitting (automatic with App Router)
// Component-based splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'))
\`\`\`

### 2. Image Optimization
\`\`\`typescript
// Next.js Image component
// Supabase Storage for user uploads
// CDN for product images
\`\`\`

### 3. Database Optimization
\`\`\`sql
-- Indexes on frequently queried columns
-- Pagination for large datasets
-- Caching strategies
\`\`\`

## 🔧 Development Workflow

### 1. Environment Setup
\`\`\`bash
# Development
npm run dev

# Database migrations
npm run db:migrate

# Type generation
npm run types:generate
\`\`\`

### 2. Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical user flows

### 3. Deployment
\`\`\`bash
# Vercel deployment
vercel --prod

# Database migrations on production
npm run db:migrate:prod
