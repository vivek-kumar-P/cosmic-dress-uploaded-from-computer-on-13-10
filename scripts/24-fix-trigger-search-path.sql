-- Migration: 24-fix-trigger-search-path.sql
-- Description: Fixes mutable search_path warnings on public.handle_updated_at() and
--              public.update_updated_at_column() by locking their search_path to the
--              public schema. No business logic, ownership, permissions, or trigger
--              bindings are changed.
--
-- Functions targeted:
--   public.handle_updated_at()         — SECURITY INVOKER, owner: postgres
--   public.update_updated_at_column()  — SECURITY INVOKER, owner: postgres
--
-- Functions NOT touched:
--   public.handle_new_user()           — handled in Migration 21
--   public.handle_user_update()        — handled in Migration 21
--   public.handle_user_delete()        — handled in Migration 21
--   storage.update_updated_at_column() — different schema, not flagged

BEGIN;

-- 1. Add SET search_path = public to handle_updated_at()
--    Body is preserved byte-for-byte from live database inspection.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 2. Add SET search_path = public to update_updated_at_column()
--    Body is preserved byte-for-byte from live database inspection.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMIT;
