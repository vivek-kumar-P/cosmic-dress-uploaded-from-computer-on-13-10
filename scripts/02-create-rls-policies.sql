-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Products policies (public read)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

-- Avatars policies
CREATE POLICY "Users can view own avatars" ON avatars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own avatars" ON avatars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatars" ON avatars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own avatars" ON avatars
  FOR DELETE USING (auth.uid() = user_id);

-- Saved outfits policies
CREATE POLICY "Users can view own outfits" ON saved_outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public outfits" ON saved_outfits
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own outfits" ON saved_outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" ON saved_outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" ON saved_outfits
  FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
