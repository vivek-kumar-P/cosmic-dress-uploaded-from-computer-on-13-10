# 3D Outfit Builder

> A Next.js 15 web application for 3D outfit customization, product browsing, cart management, checkout, and user authentication — powered by Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.6-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?logo=threedotjs)](https://threejs.org/)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running Locally](#running-locally)
- [Database Setup](#database-setup)
- [Deployment](#deployment)
- [Documentation Index](#documentation-index)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**3D Outfit Builder** lets users browse a fashion product catalog, assemble outfits from those products, and visualize them on a 3D avatar in real time. Users can save custom outfits, manage a shopping cart, check out, and receive order confirmation emails — all inside a single Next.js application backed by Supabase (Auth + PostgreSQL database).

The 3D visualization layer is built on [Three.js](https://threejs.org/) via [`@react-three/fiber`](https://r3f.docs.pmnd.rs/) and [`@react-three/drei`](https://drei.pmnd.rs/), and it supports `.gltf` / `.glb` model uploads. All models are auto-normalized to a 1.8 m height so that garments layer consistently across different source assets.

---

## Features

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse tops, bottoms, accessories, and shoes; filter by category, style, and color |
| **3D Outfit Builder** | Drag products onto a 3D avatar; real-time GLTF/GLB model rendering |
| **3D Playground** | Interactive Three.js canvas with model upload support |
| **Avatar Customization** | Configure gender, height, build, skin tone, and body measurements |
| **Saved Outfits** | Persist favorite outfits per user; associate with a specific avatar |
| **Shopping Cart** | Add products, update quantities, persist cart state in React context |
| **Checkout** | Multi-step checkout with shipping address collection |
| **Order Confirmations** | Automated transactional email via Resend after checkout |
| **Authentication** | Email/password sign-up, sign-in, and session management via Supabase Auth |
| **User Profile** | Edit profile details, avatar URL, address, and onboarding status |
| **Favorites / Likes** | Like products; track favorites in a dedicated context |
| **Dark Mode** | System-aware dark/light theme via `next-themes` |
| **Onboarding Flow** | Guided first-run wizard for new users |
| **Gallery** | Browse community-style outfit gallery |

---

## Screenshots

> TODO — Requires Human Input (add screenshots of the running application)

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.2.6 | React framework (App Router) |
| [React](https://react.dev/) | 19 | UI rendering |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | — | Radix-based component system |
| [Framer Motion](https://www.framer.com/motion/) | latest | Page and component animations |
| [GSAP](https://greensock.com/gsap/) | latest | Advanced timeline animations |

### 3D Rendering

| Library | Version | Purpose |
|---------|---------|---------|
| [Three.js](https://threejs.org/) | latest | WebGL 3D engine |
| [@react-three/fiber](https://r3f.docs.pmnd.rs/) | 9.3.0 | React renderer for Three.js |
| [@react-three/drei](https://drei.pmnd.rs/) | 10.7.6 | Three.js helpers (controls, loaders, etc.) |
| [maath](https://github.com/pmndrs/maath) | 0.10.8 | Math utilities for 3D |

### Backend / Data

| Library | Version | Purpose |
|---------|---------|---------|
| [Supabase](https://supabase.com/) | latest | Auth + PostgreSQL database |
| [@supabase/supabase-js](https://github.com/supabase/supabase-js) | latest | Supabase JS client |
| [@supabase/auth-helpers-nextjs](https://github.com/supabase/auth-helpers) | latest | Next.js auth helpers |
| [Resend](https://resend.com/) | 6.7.0 | Transactional email delivery |
| [Zod](https://zod.dev/) | 3.24.1 | Schema validation |

### State / Forms

| Library | Purpose |
|---------|---------|
| [Valtio](https://valtio.pmnd.rs/) | Proxy-based global state for 3D scene |
| [React Hook Form](https://react-hook-form.com/) | Form management |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | Zod integration for forms |

### Tooling

| Tool | Purpose |
|------|---------|
| [pnpm](https://pnpm.io/) | Package manager |
| [ESLint](https://eslint.org/) | Linting |
| [PostCSS](https://postcss.org/) | CSS post-processing |

---

## Folder Structure

```
cosmic-dressing-using-antigravity/
├── app/                        # Next.js App Router — pages, layouts, API routes
│   ├── api/                    # Route Handlers
│   │   ├── health/             # GET /api/health — liveness check
│   │   └── send-order-confirmation/   # POST — sends order email via Resend
│   ├── actions/                # Next.js Server Actions
│   │   ├── auth-actions.ts     # createUserProfile
│   │   └── outfit-actions.ts   # saveOutfit, getUserOutfits, deleteOutfit
│   ├── auth/                   # /auth — sign-in / sign-up pages
│   ├── cart/                   # /cart — shopping cart page
│   ├── checkout/               # /checkout — checkout flow
│   ├── customize/              # /customize — outfit customization interface
│   ├── dashboard/              # /dashboard — user dashboard
│   ├── gallery/                # /gallery — outfit gallery
│   ├── onboarding/             # /onboarding — new user wizard
│   ├── order-confirmation/     # /order-confirmation — post-checkout page
│   ├── orders/                 # /orders — order history
│   ├── outfit-picker/          # /outfit-picker — outfit selection UI
│   ├── preview/                # /preview — outfit preview
│   ├── products/               # /products — product catalog
│   ├── profile/                # /profile — user profile page
│   ├── setup/                  # /setup — admin / setup utilities
│   ├── 3d-playground/          # /3d-playground — free 3D model viewer
│   ├── 3d-preview/             # /3d-preview — outfit 3D preview
│   ├── test-auth/              # /test-auth — auth flow debug page
│   ├── test-connection/        # /test-connection — Supabase connection test
│   ├── layout.tsx              # Root layout with all providers
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
│
├── components/                 # React components
│   ├── 3d/                     # 3D-specific components
│   ├── 3d-viewer/              # GLTF/GLB model viewer
│   ├── asset-manager/          # Product model asset management
│   ├── auth/                   # Login, signup, auth UI
│   ├── cart/                   # Cart sidebar, cart items
│   ├── customizer/             # Color / style customization panels
│   ├── dashboard/              # Dashboard widgets
│   ├── filters/                # Product filter UI
│   ├── gallery/                # Gallery grid and cards
│   ├── layout/                 # Shared layout components
│   ├── onboarding/             # Onboarding wizard steps
│   ├── outfit-builder/         # Drag-and-drop outfit assembly
│   ├── profile/                # Profile edit form
│   ├── ui/                     # shadcn/ui component primitives
│   ├── navbar.tsx              # Top navigation bar
│   ├── footer.tsx              # Site footer
│   ├── landing-hero.tsx        # Homepage hero section
│   ├── three-d-playground.tsx  # Full Three.js canvas playground
│   ├── outfit-picker.tsx       # Product-to-outfit picker
│   └── checkout-form.tsx       # Checkout address + payment form
│
├── contexts/                   # React Context providers
│   ├── auth-context.tsx        # User session state
│   ├── cart-context.tsx        # Shopping cart state
│   ├── likes-context.tsx       # Product likes/favorites state
│   └── orders-context.tsx      # Order history state
│
├── hooks/                      # Custom React hooks
│   ├── use-3d-outfit-loader.ts # Loads 3D outfit data from Supabase
│   ├── use-mobile.ts           # Responsive mobile detection
│   ├── use-model-upload.ts     # Handles GLTF/GLB upload to Supabase storage
│   ├── use-outfit-url-params.ts # Reads outfit config from URL query params
│   ├── use-toast.ts            # Toast notification hook
│   └── useFilters.js           # Product catalog filtering logic
│
├── lib/                        # Shared utilities and data access
│   ├── supabase.ts             # Browser Supabase client (anon key)
│   ├── supabase-server.ts      # Server-side Supabase client (service role)
│   ├── supabase-safe.ts        # Null-safe Supabase client wrapper
│   ├── customization-utils.ts  # Avatar and outfit CRUD helpers
│   ├── model-utils.ts          # Three.js model normalization utilities
│   ├── pricing.ts              # Price formatting / calculation helpers
│   ├── utils.ts                # General utility functions (cn helper)
│   ├── constants/              # App-wide constants
│   ├── emails/                 # Email templates and send utilities (Resend)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Additional utility modules
│
├── types/
│   └── supabase.ts             # Auto-generated Supabase database types
│
├── scripts/                    # SQL migration scripts (run in Supabase SQL Editor)
│   ├── 00-complete-database-setup.sql   # All-in-one setup script
│   ├── 01-create-tables.sql
│   ├── 02-create-rls-policies.sql
│   └── …25-secure-trigger-functions-final.sql
│
├── docs/                       # Project documentation
│   ├── architecture/           # Architecture documents
│   ├── database/               # Database schema and migrations
│   ├── deployment/             # Deployment guides
│   ├── api/                    # API reference
│   └── guides/                 # Developer guides
│
├── docs_pdfs/                  # PDF versions of key documentation
├── public/                     # Static assets (images, models, favicon)
├── styles/                     # Additional global styles
├── .env.example                # Environment variable template
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Installation

**Prerequisites:**

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ — install with `npm install -g pnpm`
- A [Supabase](https://supabase.com/) project (free tier is sufficient)
- A [Resend](https://resend.com/) account (for order confirmation emails)

```bash
# 1. Clone the repository
git clone https://github.com/vivek-kumar-P/cosmic-dressing-3D-Outfit_builder.git
cd cosmic-dressing-3D-Outfit_builder

# 2. Install dependencies
pnpm install
```

---

## Environment Setup

Copy the template and fill in your credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (order confirmation emails)
RESEND_API_KEY=re_your-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are **server-side only** and must never be exposed to the browser. Keys prefixed with `NEXT_PUBLIC_` are safe to expose.

See [docs/deployment/ENVIRONMENT_SETUP.md](./docs/deployment/ENVIRONMENT_SETUP.md) for full details.

---

## Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the production bundle |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

---

## Database Setup

The database schema is managed through SQL migration scripts in `scripts/`. These are run manually in the **Supabase SQL Editor** — there is no automatic migration runner.

**Recommended: run the all-in-one setup script first:**

```sql
-- Run in Supabase SQL Editor:
-- scripts/00-complete-database-setup.sql
```

This single script creates all tables, RLS policies, indexes, functions, and triggers in the correct order.

**Individual migration scripts:**

| Script | Purpose |
|--------|---------|
| `01-create-tables.sql` | Core table definitions |
| `02-create-rls-policies.sql` | Row Level Security policies |
| `03-seed-sample-data.sql` | Sample product data |
| `04-create-functions.sql` | PostgreSQL helper functions |
| `05` – `25` | Incremental fixes and enhancements |

See [docs/database/MIGRATION_INDEX.md](./docs/database/MIGRATION_INDEX.md) for the full migration history.

---

## Deployment

The application is designed to deploy on **Vercel** with **Supabase** as the backend.

1. Push the repository to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com/).
3. Set the environment variables listed in [Environment Setup](#environment-setup).
4. Set build command to `pnpm build`.
5. Deploy.

See [docs/deployment/DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md) for the full guide.

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [docs/architecture/ARCHITECTURE.md](./docs/architecture/ARCHITECTURE.md) | System architecture and module overview |
| [docs/architecture/DATA_FLOW.md](./docs/architecture/DATA_FLOW.md) | Request/response data flow diagrams |
| [docs/architecture/3D_SYSTEM.md](./docs/architecture/3D_SYSTEM.md) | 3D rendering pipeline and model handling |
| [docs/architecture/SECURITY_MODEL.md](./docs/architecture/SECURITY_MODEL.md) | Authentication and RLS security model |
| [docs/database/SCHEMA_REFERENCE.md](./docs/database/SCHEMA_REFERENCE.md) | Full database schema reference |
| [docs/database/MIGRATION_INDEX.md](./docs/database/MIGRATION_INDEX.md) | Migration history |
| [docs/database/schema-snapshot.sql](./docs/database/schema-snapshot.sql) | Live schema snapshot |
| [docs/deployment/DEPLOYMENT_GUIDE.md](./docs/deployment/DEPLOYMENT_GUIDE.md) | Vercel deployment steps |
| [docs/deployment/ENVIRONMENT_SETUP.md](./docs/deployment/ENVIRONMENT_SETUP.md) | Environment variable reference |
| [docs/deployment/SUPABASE_SETUP.md](./docs/deployment/SUPABASE_SETUP.md) | Supabase project setup guide |
| [docs/deployment/DEPLOYMENT_CHECKLIST.md](./docs/deployment/DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [docs/api/API_REFERENCE.md](./docs/api/API_REFERENCE.md) | API routes and Server Actions reference |
| [docs/guides/LOCAL_DEVELOPMENT.md](./docs/guides/LOCAL_DEVELOPMENT.md) | Local development guide |
| [docs/guides/TESTING.md](./docs/guides/TESTING.md) | Testing guide |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch conventions, commit message format, and the pull request checklist.

---

## License

> TODO — Requires Human Input (specify license)