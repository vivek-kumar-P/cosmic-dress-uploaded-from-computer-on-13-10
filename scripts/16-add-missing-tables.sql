-- Add Missing Tables for Complete Social Features
-- This script creates tables that may be referenced but not yet created

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES saved_outfits(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can only favorite a product or outfit once
    UNIQUE(user_id, product_id),
    UNIQUE(user_id, outfit_id),
    
    -- Ensure either product_id or outfit_id is set, but not both
    CHECK (
        (product_id IS NOT NULL AND outfit_id IS NULL) OR 
        (product_id IS NULL AND outfit_id IS NOT NULL)
    )
);

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_models table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    model_url TEXT NOT NULL,
    model_type TEXT DEFAULT '3d' CHECK (model_type IN ('3d', 'ar', 'vr')),
    version INTEGER DEFAULT 1,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_tag_relations table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_tag_relations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, tag_id)
);

-- Create colors table if it doesn't exist
CREATE TABLE IF NOT EXISTS colors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    hex_code TEXT NOT NULL,
    rgb_values JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sizes table if it doesn't exist
CREATE TABLE IF NOT EXISTS sizes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'clothing', 'shoes', 'accessories'
    measurements JSONB, -- chest, waist, length, etc.
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, category)
);

-- Update product_variants to reference colors and sizes tables
DO $$
BEGIN
    -- Add foreign key columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'color_id') THEN
        ALTER TABLE product_variants ADD COLUMN color_id UUID REFERENCES colors(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'size_id') THEN
        ALTER TABLE product_variants ADD COLUMN size_id UUID REFERENCES sizes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add missing columns to avatar_measurements if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avatar_measurements' AND column_name = 'user_id') THEN
        ALTER TABLE avatar_measurements ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Update existing records to set user_id based on avatar relationship
        UPDATE avatar_measurements 
        SET user_id = avatars.user_id 
        FROM avatars 
        WHERE avatar_measurements.avatar_id = avatars.id;
    END IF;
END $$;

-- Add is_favorite column to saved_outfits if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'saved_outfits' AND column_name = 'is_favorite') THEN
        ALTER TABLE saved_outfits ADD COLUMN is_favorite BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Anyone can view active tags" ON tags FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view colors" ON colors FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view sizes" ON sizes FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view product models" ON product_models FOR SELECT USING (true);
CREATE POLICY "Anyone can view product tag relations" ON product_tag_relations FOR SELECT USING (true);

-- Insert sample data
INSERT INTO colors (name, hex_code, rgb_values) VALUES
('Black', '#000000', '{"r": 0, "g": 0, "b": 0}'),
('White', '#FFFFFF', '{"r": 255, "g": 255, "b": 255}'),
('Red', '#FF0000', '{"r": 255, "g": 0, "b": 0}'),
('Blue', '#0000FF', '{"r": 0, "g": 0, "b": 255}'),
('Green', '#00FF00', '{"r": 0, "g": 255, "b": 0}'),
('Gray', '#808080', '{"r": 128, "g": 128, "b": 128}')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sizes (name, category, sort_order) VALUES
('XS', 'clothing', 1),
('S', 'clothing', 2),
('M', 'clothing', 3),
('L', 'clothing', 4),
('XL', 'clothing', 5),
('XXL', 'clothing', 6),
('6', 'shoes', 1),
('7', 'shoes', 2),
('8', 'shoes', 3),
('9', 'shoes', 4),
('10', 'shoes', 5),
('11', 'shoes', 6),
('12', 'shoes', 7)
ON CONFLICT (name, category) DO NOTHING;

INSERT INTO tags (name, slug, description) VALUES
('casual', 'casual', 'Casual everyday wear'),
('formal', 'formal', 'Formal and business attire'),
('sporty', 'sporty', 'Athletic and sportswear'),
('trendy', 'trendy', 'Latest fashion trends'),
('vintage', 'vintage', 'Retro and vintage styles'),
('minimalist', 'minimalist', 'Clean and simple designs')
ON CONFLICT (name) DO NOTHING;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Missing tables created successfully!';
    RAISE NOTICE 'Added: favorites, product_images, product_models, tags, product_tag_relations, colors, sizes';
    RAISE NOTICE 'Updated: product_variants with color_id and size_id references';
    RAISE NOTICE 'Sample data inserted for colors, sizes, and tags';
END $$;
