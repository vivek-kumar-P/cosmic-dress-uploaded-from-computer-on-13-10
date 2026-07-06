# Contributing to 3D Outfit Builder

**Purpose:** Developer onboarding guide — local setup, workflow conventions, and contribution standards.
**Scope:** All contributors to this repository.
**Related Documents:** [`README.md`](./README.md) · [`docs/guides/LOCAL_DEVELOPMENT.md`](./docs/guides/LOCAL_DEVELOPMENT.md)
**Last Updated:** 2026-07-06
**Status:** Active

---

## Prerequisites

- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)
- A Supabase project (free tier is sufficient for development)
- A Resend account (for email testing)

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/vivek-kumar-P/cosmic-dressing-3D-Outfit_builder.git
cd cosmic-dressing-3D-Outfit_builder

# 2. Install dependencies
pnpm install

# 3. Create your environment file from the template
cp .env.example .env.local
# Fill in your Supabase and Resend credentials (see .env.example for descriptions)

# 4. Run the database setup (once, in Supabase SQL Editor)
# Execute: scripts/00-complete-database-setup.sql

# 5. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Branch Conventions

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/short-name` | New features |
| `fix/short-name` | Bug fixes |
| `docs/short-name` | Documentation only |
| `db/short-name` | Database migrations |

## Database Migrations

When adding a new SQL migration:

1. Name it `NN-description.sql` where `NN` is the next sequential number.
2. Test it in your local Supabase project first.
3. Add an entry to [`docs/database/MIGRATION_INDEX.md`](./docs/database/MIGRATION_INDEX.md).
4. Do **not** place temporary scripts in `scripts/` — use `.ai/scratch/` instead.

## Commit Message Format

```
type(scope): short description

feat(auth): add forgot-password flow
fix(cart): resolve item quantity update race condition
docs(database): update migration index for script 26
db(security): add RLS to orders table
```

## Documentation Updates

See update rules in [`docs/guides/LOCAL_DEVELOPMENT.md`](./docs/guides/LOCAL_DEVELOPMENT.md).
Do not update documentation for small refactors — only for features, migrations, and architectural changes.

## Pull Request Checklist

- [ ] `pnpm build` passes without errors
- [ ] Environment variables added to `.env.example`
- [ ] Database migrations added to `MIGRATION_INDEX.md`
- [ ] Documentation updated if feature/architecture changed
