# Environment Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in project details:
   - Name: "3D Outfit Builder"
   - Database Password: (create a strong password)
   - Region: Choose closest to your location
5. Wait for project creation (2-3 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with https://...)
   - **anon public** key (long string starting with eyJ...)

## Step 3: Create Environment File

Create a `.env.local` file in your project root with:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

Replace the placeholder values with your actual Supabase URL and anon key.

## Step 4: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Run this SQL to create the profiles table:

\`\`\`sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
\`\`\`

## Step 5: Configure Authentication

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. Add **Redirect URLs**: `http://localhost:3000/auth/callback`

## Step 6: Restart Development Server

\`\`\`bash
npm run dev
\`\`\`

Your authentication should now work! The configuration warning will disappear.

## Troubleshooting

- Make sure `.env.local` is in your project root (same level as package.json)
- Restart your development server after adding environment variables
- Check that your Supabase project is active and not paused
- Verify the URL and key are copied correctly (no extra spaces)
\`\`\`

Now let me update the types file to include proper database types:
