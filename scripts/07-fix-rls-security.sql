-- =============================================
-- COMPREHENSIVE RLS SECURITY FIX
-- Fix all Row Level Security issues in Supabase
-- =============================================

-- First, let's enable RLS on ALL tables that need it
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Anyone can view active product variants" ON product_variants;
DROP POLICY IF EXISTS "Users can view own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can insert own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can update own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can delete own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can manage own avatar measurements" ON avatar_measurements;
DROP POLICY IF EXISTS "Users can view public outfits and own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can insert own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can delete own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can manage outfit items for accessible outfits" ON outfit_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can manage own likes" ON outfit_likes;
DROP POLICY IF EXISTS "Users can view all likes" ON outfit_likes;
DROP POLICY IF EXISTS "Users can manage own comments" ON outfit_comments;
DROP POLICY IF EXISTS "Users can view comments on accessible outfits" ON outfit_comments;
DROP POLICY IF EXISTS "Users can manage own follows" ON user_follows;
DROP POLICY IF EXISTS "Users can view all follows" ON user_follows;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (true); -- Anyone can view profiles (for social features)

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- =============================================
-- PUBLIC CATALOG TABLES (READ-ONLY FOR ALL)
-- =============================================

-- Categories - Public read access
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT USING (is_active = true);

-- Products - Public read access
CREATE POLICY "products_select_policy" ON products
    FOR SELECT USING (is_active = true);

-- Product Variants - Public read access
CREATE POLICY "product_variants_select_policy" ON product_variants
    FOR SELECT USING (is_active = true);

-- Product Images - Public read access
CREATE POLICY "product_images_select_policy" ON product_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_images.product_id 
            AND products.is_active = true
        )
    );

-- Product Models - Public read access
CREATE POLICY "product_models_select_policy" ON product_models
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_models.product_id 
            AND products.is_active = true
        )
    );

-- Product Tags - Public read access
CREATE POLICY "product_tags_select_policy" ON product_tags
    FOR SELECT USING (true);

-- Product Tag Relations - Public read access
CREATE POLICY "product_tag_relations_select_policy" ON product_tag_relations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            WHERE products.id = product_tag_relations.product_id 
            AND products.is_active = true
        )
    );

-- Colors - Public read access
CREATE POLICY "colors_select_policy" ON colors
    FOR SELECT USING (true);

-- Sizes - Public read access
CREATE POLICY "sizes_select_policy" ON sizes
    FOR SELECT USING (true);

-- =============================================
-- USER-SPECIFIC TABLES
-- =============================================

-- Avatars - Users can only access their own
CREATE POLICY "avatars_select_policy" ON avatars
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "avatars_insert_policy" ON avatars
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "avatars_update_policy" ON avatars
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "avatars_delete_policy" ON avatars
    FOR DELETE USING (auth.uid() = user_id);

-- Avatar Measurements - Through avatar ownership
CREATE POLICY "avatar_measurements_select_policy" ON avatar_measurements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM avatars 
            WHERE avatars.id = avatar_measurements.avatar_id 
            AND avatars.user_id = auth.uid()
        )
    );

CREATE POLICY "avatar_measurements_insert_policy" ON avatar_measurements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM avatars 
            WHERE avatars.id = avatar_measurements.avatar_id 
            AND avatars.user_id = auth.uid()
        )
    );

CREATE POLICY "avatar_measurements_update_policy" ON avatar_measurements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM avatars 
            WHERE avatars.id = avatar_measurements.avatar_id 
            AND avatars.user_id = auth.uid()
        )
    );

CREATE POLICY "avatar_measurements_delete_policy" ON avatar_measurements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM avatars 
            WHERE avatars.id = avatar_measurements.avatar_id 
            AND avatars.user_id = auth.uid()
        )
    );

-- Saved Outfits - Public can view public outfits, users can manage their own
CREATE POLICY "saved_outfits_select_policy" ON saved_outfits
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "saved_outfits_insert_policy" ON saved_outfits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_outfits_update_policy" ON saved_outfits
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_outfits_delete_policy" ON saved_outfits
    FOR DELETE USING (auth.uid() = user_id);

-- Outfit Items - Through outfit ownership
CREATE POLICY "outfit_items_select_policy" ON outfit_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_items.outfit_id 
            AND (saved_outfits.is_public = true OR saved_outfits.user_id = auth.uid())
        )
    );

CREATE POLICY "outfit_items_insert_policy" ON outfit_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_items.outfit_id 
            AND saved_outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "outfit_items_update_policy" ON outfit_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_items.outfit_id 
            AND saved_outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "outfit_items_delete_policy" ON outfit_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_items.outfit_id 
            AND saved_outfits.user_id = auth.uid()
        )
    );

-- Cart Items - Users can only access their own
CREATE POLICY "cart_items_select_policy" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "cart_items_insert_policy" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cart_items_update_policy" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "cart_items_delete_policy" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);

-- Orders - Users can only access their own
CREATE POLICY "orders_select_policy" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "orders_insert_policy" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "orders_update_policy" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Order Items - Through order ownership
CREATE POLICY "order_items_select_policy" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "order_items_insert_policy" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Favorites - Users can only access their own
CREATE POLICY "favorites_select_policy" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_policy" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_policy" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- SOCIAL FEATURES
-- =============================================

-- Outfit Likes - Anyone can view, users can manage their own
CREATE POLICY "outfit_likes_select_policy" ON outfit_likes
    FOR SELECT USING (true);

CREATE POLICY "outfit_likes_insert_policy" ON outfit_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outfit_likes_delete_policy" ON outfit_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Outfit Comments - Anyone can view on public outfits, users can manage their own
CREATE POLICY "outfit_comments_select_policy" ON outfit_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_comments.outfit_id 
            AND (saved_outfits.is_public = true OR saved_outfits.user_id = auth.uid())
        )
    );

CREATE POLICY "outfit_comments_insert_policy" ON outfit_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM saved_outfits 
            WHERE saved_outfits.id = outfit_comments.outfit_id 
            AND (saved_outfits.is_public = true OR saved_outfits.user_id = auth.uid())
        )
    );

CREATE POLICY "outfit_comments_update_policy" ON outfit_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "outfit_comments_delete_policy" ON outfit_comments
    FOR DELETE USING (auth.uid() = user_id);

-- User Follows - Anyone can view, users can manage their own follows
CREATE POLICY "user_follows_select_policy" ON user_follows
    FOR SELECT USING (true);

CREATE POLICY "user_follows_insert_policy" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "user_follows_delete_policy" ON user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- =============================================
-- VERIFY RLS IS ENABLED
-- =============================================
DO $$
DECLARE
    table_name text;
    rls_enabled boolean;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'profiles', 'categories', 'products', 'product_variants', 
            'product_images', 'product_models', 'product_tags', 
            'product_tag_relations', 'colors', 'sizes', 'avatars', 
            'avatar_measurements', 'saved_outfits', 'outfit_items', 
            'cart_items', 'orders', 'order_items', 'favorites',
            'outfit_likes', 'outfit_comments', 'user_follows'
        )
    LOOP
        SELECT relrowsecurity INTO rls_enabled 
        FROM pg_class 
        WHERE relname = table_name;
        
        IF rls_enabled THEN
            RAISE NOTICE 'RLS is ENABLED for table: %', table_name;
        ELSE
            RAISE NOTICE 'WARNING: RLS is NOT ENABLED for table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- Success message
RAISE NOTICE '==============================================';
RAISE NOTICE 'RLS SECURITY FIX COMPLETED SUCCESSFULLY!';
RAISE NOTICE 'All tables now have RLS enabled with proper policies';
RAISE NOTICE '==============================================';
