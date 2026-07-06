# docs/deployment/

**Purpose:** End-to-end deployment and infrastructure documentation.
**Audience:** Engineers deploying the application, DevOps, new contributors.

## Contents

| File | Description |
|------|-------------|
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | Step-by-step Vercel deployment guide |
| [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md) | Every environment variable — description, source, and security classification |
| [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) | Supabase project configuration (Auth, storage buckets, RLS, security settings) |
| [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) | Pre-deploy and post-deploy verification checklist |

## Rules

- Update when the deployment process changes — not for application code changes.
- `ENVIRONMENT_SETUP.md` must stay in sync with `.env.example` at the project root.
- `SUPABASE_SETUP.md` must be updated after each security migration cycle.
