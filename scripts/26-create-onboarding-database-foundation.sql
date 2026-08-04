-- Migration 26: Create Onboarding Database Foundation
-- Purpose: Setup user_addresses and user_preferences tables, enable RLS, configure policies, and consolidate profiles address columns.

BEGIN;

-- 1. Create user_addresses table for multiple shipping addresses support
CREATE TABLE IF NOT EXISTS public.user_addresses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone text,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    state text,
    country text NOT NULL,
    postal_code text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS user_addresses_select_policy ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_insert_policy ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_update_policy ON public.user_addresses;
DROP POLICY IF EXISTS user_addresses_delete_policy ON public.user_addresses;

-- Create RLS policies with optimized auth.uid() lookup
CREATE POLICY user_addresses_select_policy ON public.user_addresses
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_addresses_insert_policy ON public.user_addresses
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY user_addresses_update_policy ON public.user_addresses
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_addresses_delete_policy ON public.user_addresses
    FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON public.user_addresses(is_default) WHERE is_default = true;

-- Trigger to guarantee only a single default address exists per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.user_addresses 
        SET is_default = false 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON public.user_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON public.user_addresses
    FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();


-- 2. Create user_preferences table for personalization settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferred_styles text[],
    preferred_colors text[],
    preferred_sizes text[],
    preferred_categories text[],
    preferred_occasions text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS user_preferences_select_policy ON public.user_preferences;
DROP POLICY IF EXISTS user_preferences_insert_policy ON public.user_preferences;
DROP POLICY IF EXISTS user_preferences_update_policy ON public.user_preferences;
DROP POLICY IF EXISTS user_preferences_delete_policy ON public.user_preferences;

-- Create RLS policies
CREATE POLICY user_preferences_select_policy ON public.user_preferences
    FOR SELECT USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_preferences_insert_policy ON public.user_preferences
    FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY user_preferences_update_policy ON public.user_preferences
    FOR UPDATE USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_preferences_delete_policy ON public.user_preferences
    FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);


-- 3. Consolidate address fields in profiles table
-- Copy existing data from 'address' to 'street_address' if street_address is null or empty
UPDATE public.profiles
SET street_address = COALESCE(street_address, address)
WHERE street_address IS NULL OR street_address = '';

-- Safe deletion of the redundant address column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS address;

-- Add updated_at trigger for new tables to maintain audit compliance
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at 
    BEFORE UPDATE ON public.user_addresses 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
