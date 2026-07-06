# Deployment Guide

**Purpose:** Step-by-step instructions for deploying the 3D Outfit Builder to Vercel with Supabase as the backend.
**Related:** [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) · [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) · [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## Table of Contents

- [Target Platform](#target-platform)
- [Prerequisites](#prerequisites)
- [Step 1 — Prepare the Repository](#step-1--prepare-the-repository)
- [Step 2 — Set Up Supabase](#step-2--set-up-supabase)
- [Step 3 — Set Up Resend](#step-3--set-up-resend)
- [Step 4 — Deploy to Vercel](#step-4--deploy-to-vercel)
- [Step 5 — Verify the Deployment](#step-5--verify-the-deployment)
- [Redeploys and Updates](#redeploys-and-updates)
- [Related Documents](#related-documents)

---

## Target Platform

| Component | Platform |
|-----------|---------|
| Application | [Vercel](https://vercel.com/) |
| Database + Auth | [Supabase](https://supabase.com/) |
| Email | [Resend](https://resend.com/) |
| 3D Model Storage | Supabase Storage (included in Supabase project) |

---

## Prerequisites

Before deploying:

- [ ] Repository pushed to GitHub, GitLab, or Bitbucket
- [ ] Supabase project created and database schema applied (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- [ ] Resend account created and sender domain verified
- [ ] All environment variable values collected (see [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md))
- [ ] `pnpm build` passes locally without errors

---

## Step 1 — Prepare the Repository

```bash
# Ensure the build passes locally
pnpm build

# Verify no secrets are committed
git diff --cached
git log --oneline -5
```

> **Critical:** Confirm `.env.local` is listed in `.gitignore` and has never been committed.

---

## Step 2 — Set Up Supabase

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for the full guide.

**Quick checklist:**
1. Create a Supabase project at [app.supabase.com](https://app.supabase.com).
2. Run `scripts/00-complete-database-setup.sql` in the Supabase SQL Editor.
3. Collect your project URL and keys from **Settings → API**.
4. Create a Storage bucket for 3D model uploads (script 09 / 13 handles this).

---

## Step 3 — Set Up Resend

1. Create an account at [resend.com](https://resend.com/).
2. Add and verify your sending domain (e.g., `yourdomain.com`).
3. Create an API key with "Full Access" scope.
4. Note the API key and your verified sender email (`noreply@yourdomain.com`).

---

## Step 4 — Deploy to Vercel

### 4a. Import Project

1. Go to [vercel.com/new](https://vercel.com/new).
2. Click **"Import Git Repository"**.
3. Select your repository.
4. Vercel will auto-detect it as a Next.js project.

### 4b. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Build Command | `pnpm build` |
| Output Directory | `.next` (Next.js default) |
| Install Command | `pnpm install` |

### 4c. Set Environment Variables

In the Vercel project dashboard → **Settings → Environment Variables**, add:

| Variable | Value | Environment |
|---------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-ref.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Production, Preview, Development |
| `RESEND_API_KEY` | `re_your-api-key` | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | `noreply@yourdomain.com` | Production, Preview, Development |

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-side secrets. Vercel keeps them encrypted and does not expose them to the browser.

### 4d. Deploy

Click **"Deploy"**. Vercel will build and deploy the application.

---

## Step 5 — Verify the Deployment

After deployment completes, run through this checklist:

| Test | Expected Result |
|------|----------------|
| `GET https://your-app.vercel.app/` | Homepage loads with hero section |
| `GET https://your-app.vercel.app/api/health` | `{"status":"ok","timestamp":"...","environment":"production"}` |
| `GET https://your-app.vercel.app/auth` | Auth page loads |
| Sign up with a new email | User created, profile row inserted, redirect to onboarding |
| Sign in with the same email | Successful sign-in, redirect to dashboard |
| Browse `/products` | Product catalog loads from Supabase |
| Complete a test checkout | Order confirmation email received |

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for the full checklist.

---

## Redeploys and Updates

Vercel automatically redeploys on every push to the `main` branch (configurable).

For environment variable changes:
1. Update the variable in Vercel dashboard → Settings → Environment Variables.
2. Trigger a redeploy: Vercel dashboard → Deployments → "Redeploy".

---

## Related Documents

- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) — Complete variable reference
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) — Supabase configuration
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) — Pre/post-deployment checklist
- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — System design
