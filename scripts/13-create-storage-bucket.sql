-- Create storage bucket for user avatars and images
-- This script sets up the storage bucket with proper RLS policies

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create the outfit-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfit-images', 'outfit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Outfit images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload outfit images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own outfit images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own outfit images" ON storage.objects;

-- Create policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create policies for product-images bucket (public read, admin write)
CREATE POLICY "Product images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Create policies for outfit-images bucket
CREATE POLICY "Outfit images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'outfit-images');

CREATE POLICY "Users can upload outfit images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'outfit-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update their own outfit images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'outfit-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own outfit images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'outfit-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
