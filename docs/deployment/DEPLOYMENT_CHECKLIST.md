# Deployment Checklist

**Purpose:** Checklist to verify the deployment is fully functional before marking it as production-ready.
**Related:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) · [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) · [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)

---

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Variables Checklist](#environment-variables-checklist)
- [Database Checklist](#database-checklist)
- [Post-Deployment Verification](#post-deployment-verification)
- [Smoke Tests](#smoke-tests)

---

## Pre-Deployment Checklist

Complete these before triggering the Vercel deployment.

### Code Quality

- [ ] `pnpm build` passes locally without errors
- [ ] `pnpm lint` runs without errors (or lint errors are acceptable per `next.config.mjs` `ignoreDuringBuilds: true`)
- [ ] No `console.error` or unhandled promise rejections visible in local development
- [ ] `.env.local` is NOT committed to git (`git status` shows it as untracked/ignored)

### Repository

- [ ] Code is pushed to the target branch (usually `main`)
- [ ] `package.json` version updated if applicable
- [ ] `MIGRATION_INDEX.md` updated if new migrations were added

---

## Environment Variables Checklist

Verify all variables are set in Vercel → Settings → Environment Variables for the Production environment.

| Variable | Set? | Notes |
|---------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ☐ | Format: `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ☐ | JWT string from Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ☐ | JWT string — keep secret |
| `RESEND_API_KEY` | ☐ | `re_` prefixed string |
| `RESEND_FROM_EMAIL` | ☐ | Must be a verified Resend sender domain |

---

## Database Checklist

Verify the Supabase project is correctly configured.

| Item | Verified? |
|------|----------|
| `scripts/00-complete-database-setup.sql` has been run | ☐ |
| All tables exist in `public` schema (see [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md)) | ☐ |
| RLS is enabled on all user-scoped tables | ☐ |
| Storage bucket for 3D model uploads is created | ☐ |
| Storage bucket RLS policies allow authenticated users to upload | ☐ |
| Auth Site URL is set to production URL in Supabase Auth settings | ☐ |
| Auth redirect URLs include the production domain | ☐ |
| Resend sender domain is verified | ☐ |

---

## Post-Deployment Verification

Run these checks immediately after the Vercel deployment completes.

### Infrastructure

- [ ] Vercel deployment shows "Ready" status (not "Error")
- [ ] Build logs contain no unexpected errors
- [ ] All environment variables resolved (no `undefined` in build output)

### Application

| URL | Expected Result | Verified? |
|-----|----------------|----------|
| `GET /` | Homepage loads with hero section, feature cards, trending outfits | ☐ |
| `GET /api/health` | `{"status":"ok","timestamp":"...","environment":"production"}` | ☐ |
| `GET /products` | Product catalog renders | ☐ |
| `GET /auth` | Sign-in / sign-up form loads | ☐ |
| `GET /test-connection` | Supabase connection test shows successful connection | ☐ |

---

## Smoke Tests

Perform these functional tests with a real user account.

### Authentication

- [ ] Sign up with a new email address → user created in Supabase Auth
- [ ] Profile row created in `public.profiles` automatically after sign-up
- [ ] Redirect to `/onboarding` after sign-up
- [ ] Complete onboarding → `onboarding_completed` set to `true` in profiles
- [ ] Sign out → session cleared
- [ ] Sign in with same credentials → redirect to `/dashboard`

### Product Catalog

- [ ] `/products` loads products from Supabase
- [ ] Filter by category (tops, bottoms, etc.) works
- [ ] Product detail modal opens on product click

### Outfit Builder

- [ ] `/customize` or `/outfit-picker` loads
- [ ] Selecting a product shows it in the 3D view (or placeholder if no 3D model)
- [ ] Saving an outfit creates a row in `saved_outfits` and rows in `outfit_items`

### Cart and Checkout

- [ ] Adding a product to cart updates cart state
- [ ] Checkout form accepts shipping address
- [ ] Submitting checkout creates rows in `orders` and `order_items`
- [ ] Order confirmation email received at the customer email address

### 3D Playground

- [ ] `/3d-playground` loads Three.js canvas
- [ ] OrbitControls allow camera rotation
- [ ] 3D model file upload (if Storage is configured)

---

## Related Documents

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) — Full deployment steps
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) — Environment variable reference
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Supabase configuration
