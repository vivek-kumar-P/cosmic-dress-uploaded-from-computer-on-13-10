# Migration Index

**Purpose:** Chronological record of every SQL migration script, what it does, and why it exists.
**Migration scripts:** `scripts/NN-description.sql`
**Related:** [SCHEMA_REFERENCE.md](./SCHEMA_REFERENCE.md) · [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

## Table of Contents

- [How Migrations Work](#how-migrations-work)
- [Migration History](#migration-history)
- [Adding a New Migration](#adding-a-new-migration)

---

## How Migrations Work

Migrations in this project are **manual SQL scripts** run in the Supabase SQL Editor. There is no automatic migration runner (Flyway, Liquibase, Prisma Migrate, etc.).

**Why manual:** Supabase provides a managed PostgreSQL instance accessed through its web dashboard. Manual scripts are run once and are not tracked by a migration framework — they are tracked in this index instead.

**Recommended order for a fresh database:**

```
Run scripts/00-complete-database-setup.sql first.
It contains the full combined setup in the correct execution order.
Only run individual scripts (01–25) if debugging a specific migration.
```

---

## Migration History

| # | Script | Purpose | Status |
|---|--------|---------|--------|
| 00 | `00-complete-database-setup.sql` | All-in-one setup: tables, RLS, functions, triggers, indexes | ✅ Canonical |
| 01 | `01-create-tables.sql` | Creates all core tables: `profiles`, `products`, `avatars`, `saved_outfits`, `outfit_items`, `favorites`, `orders`, `order_items`, `categories`, `colors`, `sizes`, `product_variants`, `product_images`, `product_models`, `product_tags`, `product_tag_relations` | ✅ Applied |
| 02 | `02-create-rls-policies.sql` | Enables RLS on core tables; creates initial SELECT/INSERT/UPDATE/DELETE policies for `profiles`, `categories`, `products`, `avatars`, `saved_outfits`, `orders`, `order_items` | ✅ Applied |
| 03 | `03-seed-sample-data.sql` | Inserts sample products, categories, and colors for development/demo | ✅ Applied |
| 04 | `04-create-functions.sql` | Creates PostgreSQL helper functions (e.g., updated_at trigger function) | ✅ Applied |
| 05 | `05-update-profiles-table.sql` | Adds additional columns to `profiles` (phone, website, address fields, bio) | ✅ Applied |
| 06 | `06-fix-duplicate-profiles.sql` | Removes duplicate profile rows created by a race condition in early auth trigger | ✅ Applied |
| 07 | `07-fix-rls-security.sql` | Comprehensive RLS fix: enables RLS on all tables including `cart_items`, `outfit_likes`, `outfit_comments`, `user_follows`; drops and recreates all policies correctly | ✅ Applied |
| 08 | `08-fix-auth-triggers.sql` | Fixes the `on auth.users insert` trigger that auto-creates a profile row; resolves trigger function search path issues | ✅ Applied |
| 09 | `09-create-storage-bucket.sql` | Creates the Supabase Storage bucket for 3D model uploads | ✅ Applied |
| 10 | `10-fix-profiles-schema.sql` | Further profiles table fixes: column additions, constraint adjustments, index creation | ✅ Applied |
| 11 | `11-fix-rls-security-corrected.sql` | Corrected version of script 07; drops conflicting policies and re-creates with correct conditions | ✅ Applied |
| 12 | `12-fix-auth-triggers-corrected.sql` | Corrected version of script 08; ensures auth trigger function has `SECURITY DEFINER` and correct search path | ✅ Applied |
| 13 | `13-create-storage-bucket.sql` | Extended storage bucket configuration: bucket policies, public access settings | ✅ Applied |
| 14 | `14-add-onboarding-field.sql` | Adds `onboarding_completed BOOLEAN DEFAULT false` to `profiles`; adds redirect logic hook | ✅ Applied |
| 15 | `15-optimize-rls-policies.sql` | RLS performance optimization: replaces correlated subquery policies with more efficient `JOIN`-based policies; removes redundant policies | ✅ Applied |
| 16 | `16-add-missing-tables.sql` | Adds tables not created in script 01: `cart_items`, `outfit_likes`, `outfit_comments`, `user_follows` | ✅ Applied |
| 17 | `17-add-foreign-key-indexes.sql` | Adds indexes on all foreign key columns to improve JOIN performance | ✅ Applied |
| 18 | `18-optimize-profiles-indexes.sql` | Adds partial indexes on `profiles` for common query patterns (e.g., by username) | ✅ Applied |
| 19 | `19-verify-database-performance.sql` | Diagnostic queries to check index usage, table sizes, and slow queries; does not modify schema | ✅ Applied |
| 20 | `20-fix-storage-rls.sql` | Fixes Storage bucket RLS policies to allow authenticated users to upload 3D models | ✅ Applied |
| 21 | *(not present)* | — | — |
| 22 | `22-enable-catalog-rls.sql` | Enables RLS on catalog tables (`colors`, `sizes`, `product_variants`) that were missing it; adds public SELECT policies | ✅ Applied |
| 23 | `23-add-missing-foreign-key-indexes.sql` | Second pass: adds remaining FK indexes missed in script 17 | ✅ Applied |
| 24 | `24-fix-trigger-search-path.sql` | Sets `search_path = public` on all trigger functions to prevent schema injection | ✅ Applied |
| 25 | `25-secure-trigger-functions-final.sql` | Final hardening of all trigger functions: `SECURITY DEFINER`, explicit `search_path`, reviewed for privilege escalation | ✅ Applied |
| 26 | `26-create-onboarding-database-foundation.sql` | Database setup for onboarding: creates `user_addresses` and `user_preferences` tables with optimized RLS and indexes; cleans up duplicate profiles address fields | ⏳ Generated (Awaiting user apply) |

---

## Adding a New Migration

When adding a database change:

1. **Name it** `NN-short-description.sql` where `NN` is the next available number (currently `26`).
2. **Write idempotent SQL** where possible (`CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, etc.).
3. **Test** in your local/dev Supabase project before running in production.
4. **Run** the script in the Supabase SQL Editor.
5. **Update this file** — add a row to the Migration History table.
6. **Update `SCHEMA_REFERENCE.md`** if the script modifies table structure.

> Do **not** place temporary/scratch scripts in `scripts/` — use `.ai/scratch/` instead (see [CONTRIBUTING.md](../../CONTRIBUTING.md)).
