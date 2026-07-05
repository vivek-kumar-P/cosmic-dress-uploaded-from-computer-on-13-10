-- Migration: 23-add-missing-foreign-key-indexes.sql
-- Description: Adds covering indexes on foreign keys concurrently to optimize performance on joins and queries.
-- Note: As per PostgreSQL requirements, CONCURRENTLY index operations must run outside a transaction block (no BEGIN/COMMIT).

-- 1. avatar_measurements.avatar_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avatar_measurements_avatar_id 
    ON public.avatar_measurements (avatar_id);

-- 2. avatars.user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_avatars_user_id 
    ON public.avatars (user_id);

-- 3. categories.parent_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id 
    ON public.categories (parent_id);

-- 4. favorites.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_favorites_product_id 
    ON public.favorites (product_id);

-- 5. order_items.order_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id 
    ON public.order_items (order_id);

-- 6. order_items.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id 
    ON public.order_items (product_id);

-- 7. orders.user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id 
    ON public.orders (user_id);

-- 8. outfit_items.outfit_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outfit_items_outfit_id 
    ON public.outfit_items (outfit_id);

-- 9. outfit_items.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outfit_items_product_id 
    ON public.outfit_items (product_id);

-- 10. product_images.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_product_id 
    ON public.product_images (product_id);

-- 11. product_models.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_models_product_id 
    ON public.product_models (product_id);

-- 12. product_tag_relations.tag_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_tag_relations_tag_id 
    ON public.product_tag_relations (tag_id);

-- 13. product_variants.color_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_color_id 
    ON public.product_variants (color_id);

-- 14. product_variants.product_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_product_id 
    ON public.product_variants (product_id);

-- 15. product_variants.size_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_size_id 
    ON public.product_variants (size_id);

-- 16. saved_outfits.avatar_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_outfits_avatar_id 
    ON public.saved_outfits (avatar_id);

-- 17. saved_outfits.user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_outfits_user_id 
    ON public.saved_outfits (user_id);
