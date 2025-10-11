-- Comprehensive RLS Security Fix for all tables
-- This script enables RLS and creates proper policies for all tables

-- Enable RLS on all tables that need it
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.colors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    category_id UUID REFERENCES public.categories(id),
    brand TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    model_url TEXT NOT NULL,
    model_type TEXT DEFAULT '3d',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_tag_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.product_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    color_id UUID REFERENCES public.colors(id),
    size_id UUID REFERENCES public.sizes(id),
    sku TEXT UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view colors" ON public.colors;
DROP POLICY IF EXISTS "Anyone can view sizes" ON public.sizes;
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view product_images" ON public.product_images;
DROP POLICY IF EXISTS "Anyone can view product_models" ON public.product_models;
DROP POLICY IF EXISTS "Anyone can view product_tags" ON public.product_tags;
DROP POLICY IF EXISTS "Anyone can view product_tag_relations" ON public.product_tag_relations;
DROP POLICY IF EXISTS "Anyone can view product_variants" ON public.product_variants;

-- Create public read policies for product-related tables
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view colors" ON public.colors
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view sizes" ON public.sizes
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view product_images" ON public.product_images
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product_models" ON public.product_models
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product_tags" ON public.product_tags
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product_tag_relations" ON public.product_tag_relations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view product_variants" ON public.product_variants
    FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.colors TO anon, authenticated;
GRANT SELECT ON public.sizes TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT SELECT ON public.product_models TO anon, authenticated;
GRANT SELECT ON public.product_tags TO anon, authenticated;
GRANT SELECT ON public.product_tag_relations TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;

-- Create user-specific tables with proper RLS
CREATE TABLE IF NOT EXISTS public.user_outfits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    outfit_data JSONB,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_variant_id)
);

CREATE TABLE IF NOT EXISTS public.user_wishlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS on user tables
ALTER TABLE public.user_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

-- Drop existing user table policies
DROP POLICY IF EXISTS "Users can view public outfits and own outfits" ON public.user_outfits;
DROP POLICY IF EXISTS "Users can manage own outfits" ON public.user_outfits;
DROP POLICY IF EXISTS "Users can manage own cart" ON public.user_cart;
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.user_wishlist;

-- Create RLS policies for user tables
CREATE POLICY "Users can view public outfits and own outfits" ON public.user_outfits
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own outfits" ON public.user_outfits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON public.user_cart
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON public.user_wishlist
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions on user tables
GRANT ALL ON public.user_outfits TO authenticated;
GRANT ALL ON public.user_cart TO authenticated;
GRANT ALL ON public.user_wishlist TO authenticated;
GRANT SELECT ON public.user_outfits TO anon;
