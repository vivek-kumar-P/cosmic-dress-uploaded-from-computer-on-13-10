# Supabase Setup Guide

**Purpose:** Complete guide for setting up the Supabase project, applying the database schema, and configuring Storage.
**Related:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) · [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) · [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md)

---

## Table of Contents

- [Create a Supabase Project](#create-a-supabase-project)
- [Apply the Database Schema](#apply-the-database-schema)
- [Configure Storage](#configure-storage)
- [Collect API Keys](#collect-api-keys)
- [Configure Auth Settings](#configure-auth-settings)
- [Verify Setup](#verify-setup)
- [Local Development with Supabase](#local-development-with-supabase)

---

## Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and sign in.
2. Click **"New project"**.
3. Fill in:
   - **Organization:** your organization
   - **Name:** `3d-outfit-builder` (or any name)
   - **Database Password:** a strong password — **save this somewhere safe**
   - **Region:** choose the region closest to your users
4. Click **"Create new project"** and wait for provisioning (~2 minutes).

---

## Apply the Database Schema

The database schema is managed through SQL migration scripts in `scripts/`. Run them in the **Supabase SQL Editor**.

### Option A — All-in-One (Recommended for Fresh Projects)

1. In your Supabase project dashboard, go to **SQL Editor**.
2. Click **"New query"**.
3. Open `scripts/00-complete-database-setup.sql` from the project repository.
4. Copy the entire content and paste it into the SQL Editor.
5. Click **"Run"**.

This single script creates all tables, enables RLS, creates all policies, adds indexes, and sets up triggers in the correct order.

### Option B — Run Individual Scripts (for Debugging)

If you need to apply or re-run individual migrations, see [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md) for the full sequence.

Run scripts in numerical order:

```
01 → 02 → 03 → 04 → 05 → ... → 25
```

Each script is idempotent where possible (uses `IF NOT EXISTS`, `IF EXISTS` guards).

---

## Configure Storage

Script `09-create-storage-bucket.sql` and `13-create-storage-bucket.sql` create the 3D model storage bucket. If you are using the all-in-one script (`00-...`), this is already included.

To verify in the Supabase dashboard:

1. Go to **Storage** in the left sidebar.
2. Confirm there is a bucket named something like `model-uploads` or similar.
3. Confirm the bucket has the RLS policy allowing authenticated users to upload files.

> TODO — Requires Human Input: confirm the exact bucket name used in `scripts/09-create-storage-bucket.sql`.

---

## Collect API Keys

After the project is provisioned:

1. Go to **Settings → API** in your Supabase project.
2. Copy the following values:

| Value | Where to find | Use in |
|-------|--------------|--------|
| **Project URL** | "Project URL" box | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / public key** | "Project API keys → anon public" | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role / secret key** | "Project API keys → service_role" | `SUPABASE_SERVICE_ROLE_KEY` |

Add these to your `.env.local` file (local) or Vercel environment variables (production).

---

## Configure Auth Settings

In your Supabase project dashboard → **Authentication → Settings**:

| Setting | Recommended Value | Reason |
|---------|------------------|--------|
| **Email confirmations** | Enabled or Disabled | TODO — Requires Human Input (depends on desired UX) |
| **Site URL** | `http://localhost:3000` (dev) / `https://your-app.vercel.app` (prod) | Required for auth redirect URLs |
| **Redirect URLs** | `http://localhost:3000/**`, `https://your-app.vercel.app/**` | Allow post-auth redirects |
| **JWT Expiry** | Default (3600s) | Session lifetime |

**Why Site URL matters:** Supabase uses the Site URL for email confirmation links. If this is wrong, email confirmations will redirect to the wrong host.

---

## Verify Setup

After applying the schema, verify in the Supabase dashboard:

### Tables (Table Editor)

Confirm all tables exist under the `public` schema:
- `profiles`, `products`, `categories`, `colors`, `sizes`
- `product_variants`, `product_images`, `product_models`
- `product_tags`, `product_tag_relations`
- `avatars`, `avatar_measurements`
- `saved_outfits`, `outfit_items`
- `favorites`, `orders`, `order_items`

### RLS (Authentication → Policies)

Confirm RLS is enabled on all user-scoped tables and policies are visible.

### Connection Test

Use the built-in connection test page in the app:

```
http://localhost:3000/test-connection
```

This page (`app/test-connection/`) uses the `SupabaseConnectionTest` component to verify the client can connect and read from the database.

---

## Local Development with Supabase

This project uses the **hosted Supabase project** for local development (not the Supabase local Docker environment). This means:

- You connect to the real remote Supabase project from your local machine.
- Changes to schema run in the remote project's SQL Editor.
- No local Docker setup is required.

If you want to isolate development, create a separate Supabase project (e.g., `3d-outfit-builder-dev`) and use its keys in `.env.local`.

---

## Related Documents

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — Vercel deployment
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) — Environment variable reference
- [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md) — Migration history
- [SECURITY_MODEL.md](../architecture/SECURITY_MODEL.md) — RLS security model
