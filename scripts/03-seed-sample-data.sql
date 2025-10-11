-- Insert sample colors
INSERT INTO colors (name, hex_code) VALUES
  ('Black', '#000000'),
  ('White', '#FFFFFF'),
  ('Navy', '#000080'),
  ('Gray', '#808080'),
  ('Red', '#FF0000'),
  ('Blue', '#0000FF'),
  ('Green', '#008000'),
  ('Brown', '#A52A2A'),
  ('Khaki', '#F0E68C') -- Added Khaki color for new product
ON CONFLICT (hex_code) DO NOTHING;

-- Insert sample sizes
INSERT INTO sizes (name, code, measurements) VALUES
  ('Extra Small', 'XS', '{"chest": 32, "waist": 26, "hips": 34}'),
  ('Small', 'S', '{"chest": 36, "waist": 30, "hips": 38}'),
  ('Medium', 'M', '{"chest": 40, "waist": 34, "hips": 42}'),
  ('Large', 'L', '{"chest": 44, "waist": 38, "hips": 46}'),
  ('Extra Large', 'XL', '{"chest": 48, "waist": 42, "hips": 50}'),
  ('Double Extra Large', 'XXL', '{"chest": 52, "waist": 46, "hips": 54}'),
  ('One Size', 'OS', '{}') -- Added One Size for new product
ON CONFLICT (code) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (id, name, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Tops', 'T-shirts, shirts, and upper body clothing'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bottoms', 'Pants, shorts, and lower body clothing'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Shoes', 'Footwear and accessories'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Accessories', 'Hats, bags, and other accessories')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, description, price, category_id, color, size) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Classic T-Shirt', 'Comfortable cotton t-shirt', 29.99, '550e8400-e29b-41d4-a716-446655440001', 'Blue', 'M'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Denim Jeans', 'Classic blue denim jeans', 79.99, '550e8400-e29b-41d4-a716-446655440002', 'Blue', 'M'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Sneakers', 'Comfortable white sneakers', 99.99, '550e8400-e29b-41d4-a716-446655440003', 'White', '9'),
  ('650e8400-e29b-41d4-a716-446655440004', 'Baseball Cap', 'Adjustable baseball cap', 24.99, '550e8400-e29b-41d4-a716-446655440004', 'Black', 'One Size'),
  ('650e8400-e29b-41d4-a716-446655440005', 'Hoodie', 'Warm cotton hoodie', 59.99, '550e8400-e29b-41d4-a716-446655440001', 'Gray', 'L'),
  ('650e8400-e29b-41d4-a716-446655440006', 'Cargo Shorts', 'Comfortable cargo shorts', 49.99, '550e8400-e29b-41d4-a716-446655440002', 'Khaki', 'M')
ON CONFLICT (id) DO NOTHING;

-- Insert sample product tags
INSERT INTO product_tags (name, slug) VALUES
  ('Cotton', 'cotton'),
  ('Denim', 'denim'),
  ('Leather', 'leather'),
  ('Comfortable', 'comfortable'),
  ('Professional', 'professional'),
  ('Casual', 'casual'),
  ('Streetwear', 'streetwear'),
  ('Athletic', 'athletic'),
  ('Sustainable', 'sustainable'),
  ('Premium', 'premium')
ON CONFLICT (slug) DO NOTHING;
