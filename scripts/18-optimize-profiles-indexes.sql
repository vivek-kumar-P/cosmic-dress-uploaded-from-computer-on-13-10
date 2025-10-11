-- Optimize Profiles Table Indexes
-- Remove unused indexes and add essential ones for better performance

-- First, check what indexes currently exist
DO $$
BEGIN
    RAISE NOTICE 'Current indexes on profiles table:';
END $$;

-- Drop unused indexes that may be causing performance overhead
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_updated_at;

-- Create essential indexes for profiles table
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed) WHERE onboarding_completed IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_search ON profiles USING GIN(to_tsvector('english', full_name)) WHERE full_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(city, country) WHERE city IS NOT NULL AND country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_active_users ON profiles(onboarding_completed, created_at DESC) WHERE onboarding_completed = true;

-- Create composite index for public profile discovery
CREATE INDEX IF NOT EXISTS idx_profiles_public_discovery ON profiles(onboarding_completed, created_at DESC) 
WHERE onboarding_completed = true AND full_name IS NOT NULL;

-- Analyze the table to update statistics
ANALYZE profiles;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Profiles table indexes optimized successfully.';
    RAISE NOTICE 'Removed unused indexes: idx_profiles_email, idx_profiles_updated_at';
    RAISE NOTICE 'Added essential indexes for username, onboarding, search, and location';
END $$;
