-- Migration: 25-secure-trigger-functions-final.sql
-- Description: Fixes function_search_path_mutable for the three SECURITY DEFINER auth
--              trigger functions. Adds SET search_path = public to each function, revokes
--              EXECUTE from PUBLIC, and grants EXECUTE to supabase_auth_admin and postgres.
--
-- Functions targeted:
--   public.handle_new_user()    — SECURITY DEFINER, owner: postgres
--   public.handle_user_update() — SECURITY DEFINER, owner: postgres
--   public.handle_user_delete() — SECURITY DEFINER, owner: postgres
--
-- Functions NOT touched:
--   public.handle_updated_at()          — handled in Migration 24
--   public.update_updated_at_column()   — handled in Migration 24
--   storage.update_updated_at_column()  — different schema, not flagged
--
-- Live database state confirmed before generation:
--   proconfig = NULL for all three functions (search_path not yet set)
--   SECURITY DEFINER = true for all three functions
--   Function bodies verified from live database inspection

BEGIN;

-- ============================================================
-- 1. handle_new_user()
--    SECURITY DEFINER preserved.
--    Body preserved byte-for-byte from live database.
--    Only addition: SET search_path = public
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;

-- ============================================================
-- 2. handle_user_update()
--    SECURITY DEFINER preserved.
--    Body preserved byte-for-byte from live database.
--    Only addition: SET search_path = public
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- ============================================================
-- 3. handle_user_delete()
--    SECURITY DEFINER preserved.
--    Body preserved byte-for-byte from live database.
--    Only addition: SET search_path = public
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;

-- ============================================================
-- 4. Revoke EXECUTE from PUBLIC on all three SECURITY DEFINER functions
--    Prevents any anon or authenticated client from directly calling
--    these functions via the REST /rpc endpoint.
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_user_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_user_delete() FROM PUBLIC;

-- ============================================================
-- 5. Grant EXECUTE to supabase_auth_admin (fires triggers on auth.users)
--    and postgres (superuser). Wrapped in a safety check so the script
--    does not fail on environments where supabase_auth_admin is absent.
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, postgres';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_update() TO supabase_auth_admin, postgres';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO supabase_auth_admin, postgres';
    ELSE
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_update() TO postgres';
        EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_user_delete() TO postgres';
        RAISE WARNING 'Role supabase_auth_admin not found. Granted EXECUTE to postgres only.';
    END IF;
END $$;

COMMIT;
