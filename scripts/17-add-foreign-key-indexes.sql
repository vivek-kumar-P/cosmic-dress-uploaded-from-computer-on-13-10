-- Add missing foreign key indexes for optimal query performance
-- This script addresses all foreign key columns that currently lack covering indexes

-- Avatar measurements table
CREATE INDEX IF NOT EXISTS idx_avatar_measurements_avatar_id ON avatar_measurements(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_measurements_user_lookup ON avatar_measurements(avatar_id, measurement_type);

-- Avatars table
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_user_active ON avatars(user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Categories table
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_hierarchy ON categories(parent_id, sort_order) WHERE parent_id IS NOT NULL;

-- Favorites table
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_product ON favorites(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_recent ON favorites(user_id, created_at DESC);

-- Order items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_product ON order_items(order_id, product_id);

-- Orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_recent ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_date ON orders(status, created_at DESC);

-- Outfit items table
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_product_id ON outfit_items(product_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_product ON outfit_items(outfit_id, product_id);

-- Product images table
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_primary ON product_images(product_id, is_primary DESC, sort_order);

-- Product models table
CREATE INDEX IF NOT EXISTS idx_product_models_product_id ON product_models(product_id);
CREATE INDEX IF NOT EXISTS idx_product_models_product_version ON product_models(product_id, version DESC);

-- Product tag relations table
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_product_id ON product_tag_relations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_tag_id ON product_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_relations_product_tag ON product_tag_relations(product_id, tag_id);

-- Product variants table
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_id ON product_variants(size_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_color_id ON product_variants(color_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_active ON product_variants(product_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_size_color ON product_variants(product_id, size_id, color_id);

-- Saved outfits table
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_avatar_id ON saved_outfits(avatar_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_favorite ON saved_outfits(user_id, is_favorite DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_recent ON saved_outfits(user_id, created_at DESC);

-- Outfits table (public gallery)
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_public ON outfits(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_outfits_user_public ON outfits(user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_outfits_trending ON outfits(is_public, likes_count DESC, created_at DESC) WHERE is_public = true;

-- Additional performance indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_style ON products(category, style);
CREATE INDEX IF NOT EXISTS idx_products_new_items ON products(is_new, created_at DESC) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE onboarding_completed IS NOT NULL;

-- Analyze tables to update statistics
ANALYZE avatar_measurements;
ANALYZE avatars;
ANALYZE categories;
ANALYZE favorites;
ANALYZE order_items;
ANALYZE orders;
ANALYZE outfit_items;
ANALYZE product_images;
ANALYZE product_models;
ANALYZE product_tag_relations;
ANALYZE product_variants;
ANALYZE saved_outfits;
ANALYZE outfits;
ANALYZE products;
ANALYZE profiles;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Foreign key indexes created successfully. Database performance optimized.';
END $$;
