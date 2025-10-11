-- Add onboarding completion tracking and address fields to profiles table

-- Add new columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add onboarding_completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added onboarding_completed column to profiles table';
    END IF;

    -- Add address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
        ALTER TABLE profiles ADD COLUMN city TEXT;
        RAISE NOTICE 'Added city column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'state') THEN
        ALTER TABLE profiles ADD COLUMN state TEXT;
        RAISE NOTICE 'Added state column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'postal_code') THEN
        ALTER TABLE profiles ADD COLUMN postal_code TEXT;
        RAISE NOTICE 'Added postal_code column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
        ALTER TABLE profiles ADD COLUMN country TEXT;
        RAISE NOTICE 'Added country column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone TEXT;
        RAISE NOTICE 'Added phone column to profiles table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to profiles table';
    END IF;
END $$;

-- Update existing profiles to have onboarding_completed = true if they have basic info
UPDATE profiles 
SET onboarding_completed = true 
WHERE full_name IS NOT NULL 
  AND full_name != '' 
  AND onboarding_completed IS NULL;

-- Create index for onboarding status queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON profiles(onboarding_completed) WHERE onboarding_completed IS NOT NULL;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Onboarding fields added to profiles table successfully.';
    RAISE NOTICE 'Existing profiles with names marked as onboarding completed.';
END $$;
