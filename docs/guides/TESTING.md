# Testing Guide

**Purpose:** Guide for testing the 3D Outfit Builder application — what can be tested, how, and what cannot be automated.
**Related:** [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) · [DEPLOYMENT_CHECKLIST.md](../deployment/DEPLOYMENT_CHECKLIST.md)

---

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Coverage Status](#test-coverage-status)
- [Manual Testing](#manual-testing)
  - [Built-in Debug Pages](#built-in-debug-pages)
  - [Auth Flow Tests](#auth-flow-tests)
  - [Product Catalog Tests](#product-catalog-tests)
  - [3D System Tests](#3d-system-tests)
  - [Cart and Checkout Tests](#cart-and-checkout-tests)
  - [Email Tests](#email-tests)
  - [Database Tests](#database-tests)
- [Automated Testing](#automated-testing)
- [Pre-deployment Testing](#pre-deployment-testing)

---

## Testing Philosophy

> TODO — Requires Human Input: This project does not currently have an automated test suite (no test runner configuration found in `package.json` or project root). This document describes manual testing procedures based on the existing debug pages and features in the application. Automated tests should be added in future iterations.

The application relies on:

1. **Manual end-to-end testing** using the running application and Supabase dashboard.
2. **Built-in debug pages** (`/test-auth`, `/test-connection`, `/setup`) for verifying infrastructure.
3. **TypeScript** for compile-time correctness (run `pnpm build` to surface all type errors).
4. **Next.js build** as a smoke test for invalid configurations.

---

## Test Coverage Status

| Area | Automated Tests | Manual Tests |
|------|---------------|-------------|
| Authentication flow | ❌ None | ✅ Via `/test-auth` |
| Supabase connection | ❌ None | ✅ Via `/test-connection` |
| Product catalog | ❌ None | ✅ Manual browse |
| 3D rendering | ❌ None | ✅ Manual via `/3d-playground` |
| Cart state | ❌ None | ✅ Manual via `/cart` |
| Checkout + order | ❌ None | ✅ Manual via `/checkout` |
| Email sending | ❌ None | ✅ Manual via test checkout |
| API health | ❌ None | ✅ `GET /api/health` |
| TypeScript types | ✅ `pnpm build` | — |
| ESLint | ✅ `pnpm lint` | — |

---

## Manual Testing

### Built-in Debug Pages

The application ships with several debug/test pages that can be used to verify infrastructure without going through the full UI flow:

#### `/test-connection`

Tests the Supabase connection using the browser anon client.

```
http://localhost:3000/test-connection
```

**What it checks:**
- Can the browser client initialize with the configured env vars?
- Can it execute a simple SELECT query against the database?

**Expected result:** Green "Connected" status with query results.

#### `/test-auth`

Tests the authentication flow.

```
http://localhost:3000/test-auth
```

**What it checks:**
- Supabase Auth initialization
- Session detection
- Sign-in / sign-out flow

#### `/setup`

Shows environment variable configuration status using the `EnvChecker` component.

```
http://localhost:3000/setup
```

**What it checks:**
- Which `NEXT_PUBLIC_*` variables are set
- Database connection via `ConfigCheck` component

---

### Auth Flow Tests

**Test: Sign Up**

1. Navigate to `/auth`.
2. Choose "Sign Up" mode.
3. Enter a valid email and password.
4. Submit the form.
5. **Expected:** User appears in Supabase Auth dashboard under Authentication → Users.
6. **Expected:** A row is created in `public.profiles` with the user's ID.
7. **Expected:** Redirect to `/onboarding`.

**Test: Onboarding Completion**

1. Complete the onboarding wizard.
2. **Expected:** `profiles.onboarding_completed` is set to `true` in Supabase.
3. **Expected:** Redirect to dashboard or home page.

**Test: Sign In**

1. Navigate to `/auth`.
2. Enter the same email and password used during sign-up.
3. Submit the form.
4. **Expected:** Redirect to `/dashboard` or home.
5. **Expected:** Navbar shows authenticated state (profile icon, logout option).

**Test: Sign Out**

1. Click sign out in the navbar.
2. **Expected:** Session cleared.
3. **Expected:** Redirect to home or auth page.
4. **Expected:** Protected pages (e.g., `/dashboard`, `/orders`) redirect to `/auth`.

---

### Product Catalog Tests

**Test: Browse Catalog**

1. Navigate to `/products`.
2. **Expected:** Product grid loads with items from Supabase.
3. **Expected:** Each product card shows name, price, image, and category.

**Test: Filter by Category**

1. On `/products`, select a category filter (e.g., "Tops").
2. **Expected:** Only products with `category = 'tops'` are shown.

**Test: Product Detail Modal**

1. Click on a product card.
2. **Expected:** `ProductDetailModal` opens with full product details.
3. **Expected:** "Add to Cart" button adds the product to cart state.

---

### 3D System Tests

**Test: 3D Playground**

1. Navigate to `/3d-playground`.
2. **Expected:** Three.js canvas renders with `OrbitControls` (can rotate/zoom with mouse).
3. **Expected:** Default scene or avatar model loads.
4. **Optional:** Upload a `.gltf` or `.glb` file.
5. **Expected:** Uploaded model appears normalized to ~1.8 m height in the scene.

**Test: Model Console Logging**

1. Open browser DevTools → Console.
2. Load a 3D model.
3. **Expected:** Console shows `[v0]` prefixed messages:
   - `[v0] Model size: { x: ..., y: ..., z: ... }`
   - `[v0] Applied scale: ...`
   - `[v0] Material found: { name: ..., type: ... }`

**Test: Color Application**

1. Load a 3D model that has a "shirt" or "fabric" named mesh.
2. Apply a custom color via the color picker.
3. **Expected:** Only the shirt mesh changes color; other meshes remain unchanged.
4. Reset to default.
5. **Expected:** Original materials restored.

---

### Cart and Checkout Tests

**Test: Add to Cart**

1. Browse `/products` and click "Add to Cart" on a product.
2. **Expected:** Cart icon in navbar shows item count.
3. **Expected:** `/cart` page shows the added item.

**Test: Update Quantity**

1. On `/cart`, change the quantity of an item.
2. **Expected:** Total price updates accordingly.

**Test: Checkout Flow**

1. Add at least one item to cart.
2. Navigate to `/checkout`.
3. Fill in the shipping address form.
4. Submit the order.
5. **Expected:** Row created in `public.orders` with `status = 'pending'`.
6. **Expected:** Rows created in `public.order_items` for each cart item.
7. **Expected:** Cart is cleared.
8. **Expected:** Redirect to `/order-confirmation`.

---

### Email Tests

**Test: Order Confirmation Email**

1. Complete a test checkout with a real email address.
2. **Expected:** `POST /api/send-order-confirmation` returns `{ success: true }`.
3. **Expected:** Email arrives in the inbox with order details.

**Test: API Direct Call**

```bash
curl -X POST http://localhost:3000/api/send-order-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-id",
    "orderNumber": "ORD-TEST001",
    "customerEmail": "you@example.com",
    "items": [],
    "total": 99.99
  }'
```

**Expected response:** `{"success":true,"message":"Order confirmation email sent successfully","messageId":"..."}`

---

### Database Tests

**Test: RLS Enforcement**

1. In the Supabase SQL Editor, run as the anon role:
   ```sql
   -- Should return nothing (RLS blocks unauthenticated access)
   SELECT * FROM profiles;
   SELECT * FROM orders;
   ```
2. **Expected:** Empty result set (RLS blocks the query).

**Test: Products Publicly Readable**

1. In the Supabase SQL Editor, run as the anon role:
   ```sql
   SELECT COUNT(*) FROM products;
   ```
2. **Expected:** Returns the product count (RLS allows public read).

---

## Automated Testing

No automated test suite is configured. `package.json` does not include Jest, Vitest, Playwright, or Cypress.

**Recommended future additions:**

| Test Type | Suggested Tool | Priority |
|-----------|---------------|---------|
| Unit tests for `lib/model-utils.ts` | Vitest | High |
| Unit tests for `lib/pricing.ts` | Vitest | Medium |
| API route integration tests | Vitest + `msw` | Medium |
| End-to-end auth flow | Playwright | High |
| End-to-end checkout flow | Playwright | High |
| 3D model loading | TODO — Requires Human Input (browser environment needed) | Low |

To add Vitest:

```bash
pnpm add -D vitest @vitejs/plugin-react
```

Then add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

---

## Pre-deployment Testing

Before deploying to production, run the full [DEPLOYMENT_CHECKLIST.md](../deployment/DEPLOYMENT_CHECKLIST.md).

At minimum:

```bash
# Type safety check
pnpm build

# Lint check
pnpm lint
```

Then manually verify the smoke tests in [DEPLOYMENT_CHECKLIST.md → Smoke Tests](../deployment/DEPLOYMENT_CHECKLIST.md#smoke-tests).
