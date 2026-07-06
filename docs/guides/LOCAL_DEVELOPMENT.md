# Local Development Guide

**Purpose:** Complete guide for setting up and running the project locally for development.
**Related:** [CONTRIBUTING.md](../../CONTRIBUTING.md) · [ENVIRONMENT_SETUP.md](../deployment/ENVIRONMENT_SETUP.md) · [SUPABASE_SETUP.md](../deployment/SUPABASE_SETUP.md)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Running the Dev Server](#running-the-dev-server)
- [Project Commands](#project-commands)
- [Directory Conventions](#directory-conventions)
- [Adding a New Page](#adding-a-new-page)
- [Adding a New Component](#adding-a-new-component)
- [Adding a New API Route](#adding-a-new-api-route)
- [Adding a Database Migration](#adding-a-database-migration)
- [Working with 3D Models](#working-with-3d-models)
- [Debugging](#debugging)
- [Documentation Update Rules](#documentation-update-rules)

---

## Prerequisites

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| pnpm | 10+ | `npm install -g pnpm` |
| Git | — | [git-scm.com](https://git-scm.com/) |
| Supabase project | Free tier | [supabase.com](https://supabase.com/) |
| Resend account | Free tier | [resend.com](https://resend.com/) |

---

## Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/vivek-kumar-P/cosmic-dressing-3D-Outfit_builder.git
cd cosmic-dressing-3D-Outfit_builder

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local
# Open .env.local and fill in your Supabase and Resend credentials

# 4. Apply database schema (once, in Supabase SQL Editor)
# Run: scripts/00-complete-database-setup.sql

# 5. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

See [ENVIRONMENT_SETUP.md](../deployment/ENVIRONMENT_SETUP.md) for variable descriptions.
See [SUPABASE_SETUP.md](../deployment/SUPABASE_SETUP.md) for Supabase configuration.

---

## Running the Dev Server

```bash
pnpm dev
```

- The server starts on `http://localhost:3000` by default.
- Next.js uses Fast Refresh — most changes apply instantly without a full reload.
- Server Components and Route Handlers automatically reload on save.

---

## Project Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Fast Refresh |
| `pnpm build` | Build production bundle (also validates TypeScript and Next.js config) |
| `pnpm start` | Start production server (requires `pnpm build` first) |
| `pnpm lint` | Run ESLint across the codebase |

> **Note:** TypeScript errors and ESLint errors are **not blocking** in development mode (see `next.config.mjs`). Run `pnpm build` to catch all TypeScript errors.

---

## Directory Conventions

| Directory | What goes here |
|-----------|---------------|
| `app/` | Pages and route-level logic only (no reusable components) |
| `components/` | All React components. Subdirectory per feature area |
| `components/ui/` | shadcn/ui primitives only — do not add custom business logic here |
| `contexts/` | React Context providers only |
| `hooks/` | Custom React hooks |
| `lib/` | Pure utility functions, data clients, helpers |
| `lib/emails/` | Email templates and send functions |
| `lib/constants/` | Shared constants |
| `types/` | TypeScript types (do not put runtime code here) |
| `scripts/` | SQL migration scripts only (numbered `NN-description.sql`) |
| `public/` | Static assets served as-is |
| `.ai/` | AI-generated scratch files, context, planning (not production code) |

---

## Adding a New Page

Next.js App Router uses file-based routing. To add a new page at `/my-feature`:

```
app/
  my-feature/
    page.tsx     ← required (the page component)
    layout.tsx   ← optional (page-level layout wrapper)
    loading.tsx  ← optional (Suspense loading state)
    error.tsx    ← optional (error boundary)
```

**`page.tsx` template:**

```tsx
// app/my-feature/page.tsx
export default function MyFeaturePage() {
  return (
    <div>
      <h1>My Feature</h1>
    </div>
  )
}
```

If the page needs to read Supabase data server-side, use the server client:

```tsx
import { createServerClient } from "@/lib/supabase-server"

export default async function MyFeaturePage() {
  const supabase = createServerClient()
  const { data } = await supabase.from("products").select("*")
  return <ProductList products={data ?? []} />
}
```

---

## Adding a New Component

```
components/
  my-feature/
    my-feature-card.tsx
    my-feature-list.tsx
```

- Keep components focused — one responsibility per file.
- Use shadcn/ui primitives from `components/ui/` for consistent styling.
- Client-only behavior (useState, useEffect) requires `"use client"` at the top of the file.

---

## Adding a New API Route

```
app/
  api/
    my-endpoint/
      route.ts
```

**`route.ts` template:**

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "ok" })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // ... process body
  return NextResponse.json({ success: true })
}
```

If you need Node.js APIs (e.g., for Resend or other Node-only SDKs):

```typescript
export const runtime = 'nodejs'
```

---

## Adding a Database Migration

See [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md) for the full process.

**Quick reference:**

1. Create `scripts/NN-description.sql` (next number after `25` is `26`).
2. Write idempotent SQL (`IF NOT EXISTS`, `IF EXISTS` guards).
3. Test in your local/dev Supabase project.
4. Run in the Supabase SQL Editor.
5. Update [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md).
6. Update [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md) if the schema changed.

---

## Working with 3D Models

**Supported formats:** `.gltf`, `.glb`

**Model requirements:**
- Should represent a human-scale garment (will be normalized to 1.8 m height).
- If targeting shirt-only coloring, name the mesh or material `"shirt"` or `"fabric"`.

**Testing locally:**
1. Upload a GLTF/GLB file via the `/3d-playground` page (requires Storage bucket configured).
2. Or set `model_url` on a product directly in the Supabase dashboard and browse to that product.

**Model utilities:** See `lib/model-utils.ts` and [3D_SYSTEM.md](../architecture/3D_SYSTEM.md).

---

## Debugging

### Supabase Connection Issues

Visit `http://localhost:3000/test-connection` — this page renders `SupabaseConnectionTest` which attempts to connect and reports the result.

Also check `http://localhost:3000/setup` for config verification.

### Auth Issues

Visit `http://localhost:3000/test-auth` for auth debugging.

### Environment Variable Issues

The `EnvChecker` component (`components/env-checker.tsx`) is used on the `/setup` page to display which environment variables are and are not set.

### 3D Model Issues

All 3D model operations log to the browser console with the prefix `[v0]`:

```
[v0] Model size: { x: 1.2, y: 1.8, z: 0.4 }
[v0] Model center: { x: 0, y: 0.9, z: 0 }
[v0] Applied scale: 1
[v0] Material found: { name: "Fabric", type: "MeshStandardMaterial", ... }
```

Open browser DevTools → Console and filter by `[v0]` to see model loading details.

### Build Errors

```bash
pnpm build
```

TypeScript errors and lint errors will appear in the build output. Fix them before deploying.

---

## Documentation Update Rules

Update documentation when:

- Adding or modifying a feature that changes the architecture
- Adding a new environment variable (update `.env.example` and [ENVIRONMENT_SETUP.md](../deployment/ENVIRONMENT_SETUP.md))
- Adding a database migration (update [MIGRATION_INDEX.md](../database/MIGRATION_INDEX.md) and [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md))
- Adding or modifying an API route or Server Action (update [API_REFERENCE.md](../api/API_REFERENCE.md))
- Changing deployment configuration (update [DEPLOYMENT_GUIDE.md](../deployment/DEPLOYMENT_GUIDE.md))

Do **not** update documentation for:
- Internal refactors that don't change behavior
- Comment and style changes
- Dependency upgrades (unless they change an API)

---

## Related Documents

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Branch and commit conventions
- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) — System architecture
- [API_REFERENCE.md](../api/API_REFERENCE.md) — API routes and Server Actions
- [SCHEMA_REFERENCE.md](../database/SCHEMA_REFERENCE.md) — Database schema
