-- Complete Database Setup for 3D Outfit Builder
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
);

-- =============================================
-- 2. CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand TEXT,
    colors JSONB DEFAULT '[]'::jsonb,
    sizes JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    model_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. PRODUCT VARIANTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku TEXT UNIQUE,
    color TEXT,
    size TEXT,
    price DECIMAL(10,2) CHECK (price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    model_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. AVATARS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS avatars (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    avatar_data JSONB DEFAULT '{}'::jsonb,
    measurements JSONB DEFAULT '{}'::jsonb,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. AVATAR MEASUREMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS avatar_measurements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    avatar_id UUID REFERENCES avatars(id) ON DELETE CASCADE NOT NULL,
    measurement_type TEXT NOT NULL, -- height, chest, waist, hips, etc.
    value DECIMAL(5,2) NOT NULL CHECK (value > 0),
    unit TEXT DEFAULT 'cm' CHECK (unit IN ('cm', 'in', 'ft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. SAVED OUTFITS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS saved_outfits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    avatar_id UUID REFERENCES avatars(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    thumbnail_url TEXT,
    likes_count INTEGER DEFAULT 0 CHECK (likes_count >= 0),
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT description_length CHECK (char_length(description) <= 500)
);

-- =============================================
-- 8. OUTFIT ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS outfit_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    position_data JSONB DEFAULT '{}'::jsonb, -- 3D positioning data
    customization_data JSONB DEFAULT '{}'::jsonb, -- color adjustments, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. CART ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, product_id, variant_id)
);

-- =============================================
-- 10. ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 12. SOCIAL FEATURES TABLES
-- =============================================

-- Outfit Likes
CREATE TABLE IF NOT EXISTS outfit_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, outfit_id)
);

-- Outfit Comments
CREATE TABLE IF NOT EXISTS outfit_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Follows
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- =============================================
-- 13. INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- Avatars indexes
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_is_default ON avatars(is_default);

-- Saved outfits indexes
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_is_public ON saved_outfits(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_created_at ON saved_outfits(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_likes_count ON saved_outfits(likes_count);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_tags ON saved_outfits USING GIN(tags);

-- Outfit items indexes
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_product_id ON outfit_items(product_id);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_added_at ON cart_items(added_at);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Social features indexes
CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user_id ON outfit_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_comments_outfit_id ON outfit_comments(outfit_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- =============================================
-- 14. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (is_active = true);

-- Products policies (public read)
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

-- Product variants policies (public read)
CREATE POLICY "Anyone can view active product variants" ON product_variants FOR SELECT USING (is_active = true);

-- Avatars policies
CREATE POLICY "Users can view own avatars" ON avatars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own avatars" ON avatars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own avatars" ON avatars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own avatars" ON avatars FOR DELETE USING (auth.uid() = user_id);

-- Avatar measurements policies
CREATE POLICY "Users can manage own avatar measurements" ON avatar_measurements FOR ALL USING (
    EXISTS (SELECT 1 FROM avatars WHERE avatars.id = avatar_measurements.avatar_id AND avatars.user_id = auth.uid())
);

-- Saved outfits policies
CREATE POLICY "Users can view public outfits and own outfits" ON saved_outfits FOR SELECT USING (
    is_public = true OR auth.uid() = user_id
);
CREATE POLICY "Users can insert own outfits" ON saved_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON saved_outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON saved_outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit items policies
CREATE POLICY "Users can manage outfit items for accessible outfits" ON outfit_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM saved_outfits 
        WHERE saved_outfits.id = outfit_items.outfit_id 
        AND (saved_outfits.is_public = true OR saved_outfits.user_id = auth.uid())
    )
);

-- Cart items policies
CREATE POLICY "Users can manage own cart items" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Social features policies
CREATE POLICY "Users can manage own likes" ON outfit_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view all likes" ON outfit_likes FOR SELECT USING (true);

CREATE POLICY "Users can manage own comments" ON outfit_comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view comments on accessible outfits" ON outfit_comments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM saved_outfits 
        WHERE saved_outfits.id = outfit_comments.outfit_id 
        AND (saved_outfits.is_public = true OR saved_outfits.user_id = auth.uid())
    )
);

CREATE POLICY "Users can manage own follows" ON user_follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);

-- =============================================
-- 15. FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_avatars_updated_at BEFORE UPDATE ON avatars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_saved_outfits_updated_at BEFORE UPDATE ON saved_outfits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_outfit_comments_updated_at BEFORE UPDATE ON outfit_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update outfit likes count
CREATE OR REPLACE FUNCTION update_outfit_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE saved_outfits 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.outfit_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE saved_outfits 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.outfit_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply likes count trigger
CREATE TRIGGER update_outfit_likes_count_trigger
    AFTER INSERT OR DELETE ON outfit_likes
    FOR EACH ROW EXECUTE FUNCTION update_outfit_likes_count();

-- Function to ensure only one default avatar per user
CREATE OR REPLACE FUNCTION ensure_single_default_avatar()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE avatars 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply default avatar trigger
CREATE TRIGGER ensure_single_default_avatar_trigger
    BEFORE INSERT OR UPDATE ON avatars
    FOR EACH ROW EXECUTE FUNCTION ensure_single_default_avatar();

-- =============================================
-- 16. SAMPLE DATA
-- =============================================

-- Insert sample categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Tops', 'tops', 'Shirts, blouses, and upper body clothing', 1),
('Bottoms', 'bottoms', 'Pants, skirts, and lower body clothing', 2),
('Dresses', 'dresses', 'One-piece garments', 3),
('Outerwear', 'outerwear', 'Jackets, coats, and outer layers', 4),
('Shoes', 'shoes', 'Footwear of all types', 5),
('Accessories', 'accessories', 'Bags, jewelry, and other accessories', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, brand, colors, sizes, tags) 
SELECT 
    'Classic White T-Shirt',
    'A comfortable cotton t-shirt perfect for everyday wear',
    29.99,
    c.id,
    'BasicWear',
    '["white", "black", "gray"]'::jsonb,
    '["XS", "S", "M", "L", "XL"]'::jsonb,
    ARRAY['casual', 'basic', 'cotton']
FROM categories c WHERE c.slug = 'tops'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, category_id, brand, colors, sizes, tags) 
SELECT 
    'Slim Fit Jeans',
    'Modern slim-fit jeans with stretch comfort',
    79.99,
    c.id,
    'DenimCo',
    '["blue", "black", "gray"]'::jsonb,
    '["28", "30", "32", "34", "36"]'::jsonb,
    ARRAY['denim', 'casual', 'stretch']
FROM categories c WHERE c.slug = 'bottoms'
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Tables created: profiles, categories, products, avatars, saved_outfits, and more';
    RAISE NOTICE 'RLS policies applied for security';
    RAISE NOTICE 'Indexes created for performance';
    RAISE NOTICE 'Sample data inserted';
END $$;
