-- Optimize RLS Policies for Performance
-- This script consolidates multiple permissive policies and optimizes auth function calls

-- Drop existing policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

DROP POLICY IF EXISTS "Users can view own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can insert own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can update own avatars" ON avatars;
DROP POLICY IF EXISTS "Users can delete own avatars" ON avatars;

DROP POLICY IF EXISTS "Users can view own measurements" ON avatar_measurements;
DROP POLICY IF EXISTS "Users can insert own measurements" ON avatar_measurements;
DROP POLICY IF EXISTS "Users can update own measurements" ON avatar_measurements;
DROP POLICY IF EXISTS "Users can delete own measurements" ON avatar_measurements;

DROP POLICY IF EXISTS "Users can view own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Public outfits viewable by all" ON saved_outfits;
DROP POLICY IF EXISTS "Users can insert own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON saved_outfits;
DROP POLICY IF EXISTS "Users can delete own outfits" ON saved_outfits;

DROP POLICY IF EXISTS "Users can view own outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can insert own outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can update own outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can delete own outfit items" ON outfit_items;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users can update own order items" ON order_items;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

-- Create performance indexes for RLS policies
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_measurements_user_id ON avatar_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_public ON saved_outfits(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- PROFILES TABLE - Consolidated policies
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (
    id = (SELECT auth.uid()) OR 
    (is_public = true AND onboarding_completed = true)
  );

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- AVATARS TABLE - Consolidated policies
CREATE POLICY "avatars_select_policy" ON avatars
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "avatars_insert_policy" ON avatars
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "avatars_update_policy" ON avatars
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "avatars_delete_policy" ON avatars
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- AVATAR_MEASUREMENTS TABLE - Consolidated policies
CREATE POLICY "avatar_measurements_select_policy" ON avatar_measurements
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "avatar_measurements_insert_policy" ON avatar_measurements
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "avatar_measurements_update_policy" ON avatar_measurements
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "avatar_measurements_delete_policy" ON avatar_measurements
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- SAVED_OUTFITS TABLE - Consolidated policies with public/private logic
CREATE POLICY "saved_outfits_select_policy" ON saved_outfits
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR 
    (is_public = true AND (SELECT auth.uid()) IS NOT NULL)
  );

CREATE POLICY "saved_outfits_insert_policy" ON saved_outfits
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_outfits_update_policy" ON saved_outfits
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "saved_outfits_delete_policy" ON saved_outfits
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- OUTFIT_ITEMS TABLE - Consolidated policies with outfit ownership check
CREATE POLICY "outfit_items_select_policy" ON outfit_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM saved_outfits 
      WHERE saved_outfits.id = outfit_items.outfit_id 
      AND (
        saved_outfits.user_id = (SELECT auth.uid()) OR 
        (saved_outfits.is_public = true AND (SELECT auth.uid()) IS NOT NULL)
      )
    )
  );

CREATE POLICY "outfit_items_insert_policy" ON outfit_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_outfits 
      WHERE saved_outfits.id = outfit_items.outfit_id 
      AND saved_outfits.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "outfit_items_update_policy" ON outfit_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM saved_outfits 
      WHERE saved_outfits.id = outfit_items.outfit_id 
      AND saved_outfits.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_outfits 
      WHERE saved_outfits.id = outfit_items.outfit_id 
      AND saved_outfits.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "outfit_items_delete_policy" ON outfit_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM saved_outfits 
      WHERE saved_outfits.id = outfit_items.outfit_id 
      AND saved_outfits.user_id = (SELECT auth.uid())
    )
  );

-- ORDERS TABLE - Consolidated policies
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ORDER_ITEMS TABLE - Consolidated policies with order ownership check
CREATE POLICY "order_items_select_policy" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "order_items_insert_policy" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "order_items_update_policy" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = (SELECT auth.uid())
    )
  );

-- FAVORITES TABLE - Consolidated policies
CREATE POLICY "favorites_select_policy" ON favorites
  FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY "favorites_insert_policy" ON favorites
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "favorites_delete_policy" ON favorites
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON avatars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON avatar_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON saved_outfits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON outfit_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON favorites TO authenticated;

-- Grant select on public data for anonymous users
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON saved_outfits TO anon;
GRANT SELECT ON outfit_items TO anon;
