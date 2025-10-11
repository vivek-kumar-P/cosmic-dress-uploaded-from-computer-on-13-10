-- =============================================
-- AUTHENTICATION TRIGGERS AND FUNCTIONS
-- Fix automatic profile creation and auth issues
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Function to clean up user data on deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete user's data in correct order (respecting foreign keys)
    DELETE FROM public.outfit_comments WHERE user_id = OLD.id;
    DELETE FROM public.outfit_likes WHERE user_id = OLD.id;
    DELETE FROM public.user_follows WHERE follower_id = OLD.id OR following_id = OLD.id;
    DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = OLD.id);
    DELETE FROM public.orders WHERE user_id = OLD.id;
    DELETE FROM public.cart_items WHERE user_id = OLD.id;
    DELETE FROM public.favorites WHERE user_id = OLD.id;
    DELETE FROM public.outfit_items WHERE outfit_id IN (SELECT id FROM public.saved_outfits WHERE user_id = OLD.id);
    DELETE FROM public.saved_outfits WHERE user_id = OLD.id;
    DELETE FROM public.avatar_measurements WHERE avatar_id IN (SELECT id FROM public.avatars WHERE user_id = OLD.id);
    DELETE FROM public.avatars WHERE user_id = OLD.id;
    DELETE FROM public.profiles WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger for user deletion
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'AUTHENTICATION TRIGGERS SETUP COMPLETED!';
    RAISE NOTICE 'New users will automatically get profiles created';
    RAISE NOTICE 'User updates and deletions are properly handled';
    RAISE NOTICE '==============================================';
END $$;
