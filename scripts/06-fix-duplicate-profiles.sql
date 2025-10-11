-- Remove duplicate profiles, keeping only the most recent one for each user
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM profiles
)
DELETE FROM profiles 
WHERE (id, created_at) IN (
  SELECT p.id, p.created_at 
  FROM profiles p
  INNER JOIN duplicates d ON p.id = d.id 
  WHERE d.rn > 1
);

-- Add a unique constraint to prevent future duplicates
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_unique;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_unique UNIQUE (id);

-- Ensure all existing users have profiles
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
