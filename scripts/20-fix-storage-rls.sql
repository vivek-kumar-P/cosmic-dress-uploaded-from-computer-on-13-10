-- Fix Row Level Security for Supabase Storage
-- This addresses the RLS policy violation error when uploading avatars

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar uploads are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Create comprehensive storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = 'avatars'
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND (SELECT auth.uid()) IS NOT NULL
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[2]
);

-- Ensure the bucket is public for read access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Storage RLS policies created successfully for avatars bucket.';
    RAISE NOTICE 'Users can now upload, update, and delete their own avatars.';
    RAISE NOTICE 'All avatars are publicly viewable.';
END $$;
