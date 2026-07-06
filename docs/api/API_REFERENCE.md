# API Reference

**Purpose:** Complete reference for all API Route Handlers and Next.js Server Actions in the application.
**Source:** `app/api/`, `app/actions/`
**Related:** [ARCHITECTURE.md](../architecture/ARCHITECTURE.md) · [DATA_FLOW.md](../architecture/DATA_FLOW.md) · [SECURITY_MODEL.md](../architecture/SECURITY_MODEL.md)

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Route Handlers](#api-route-handlers)
  - [GET /api/health](#get-apihealth)
  - [POST /api/send-order-confirmation](#post-apisend-order-confirmation)
- [Server Actions](#server-actions)
  - [createUserProfile](#createuserprofile)
  - [saveOutfit](#saveoutfit)
  - [getUserOutfits](#getuseroutfits)
  - [deleteOutfit](#deleteoutfit)
- [Error Handling](#error-handling)
- [Client-Side Data Functions](#client-side-data-functions)

---

## Overview

The application uses two types of server-side data endpoints:

| Type | Location | When to use |
|------|---------|------------|
| **Route Handlers** | `app/api/*/route.ts` | HTTP API endpoints called from client fetch, or external callers |
| **Server Actions** | `app/actions/*.ts` | Form submissions and mutations called directly from React components via the Next.js Server Actions protocol |

Both types run in the Node.js runtime on the server. Neither is exposed to the client bundle.

---

## Authentication

Route Handlers do not currently enforce authentication headers (e.g., Bearer tokens). They rely on:

1. The **Supabase service role client** (for Route Handlers that access the database).
2. **Next.js Server Actions** are called from authenticated client components that pass the user ID explicitly.

> **Note:** The `/api/send-order-confirmation` endpoint does not verify the caller's identity. It should be called only from trusted client-side code after a successful order creation. TODO — Requires Human Input: add server-side request authentication if this endpoint needs to be secured against abuse.

---

## API Route Handlers

### `GET /api/health`

**File:** `app/api/health/route.ts`
**Runtime:** Default (Edge-compatible)
**Auth required:** No

Liveness check endpoint. Returns the server status and environment.

#### Request

```http
GET /api/health HTTP/1.1
```

No request body or query parameters.

#### Response — 200 OK

```json
{
  "status": "ok",
  "timestamp": "2026-07-06T07:30:00.000Z",
  "environment": "production"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"ok"` | Always `"ok"` on success |
| `timestamp` | ISO 8601 string | Server timestamp at response time |
| `environment` | string | Value of `process.env.NODE_ENV` |

#### Response — 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Health check failed"
}
```

#### Usage

```bash
curl https://your-app.vercel.app/api/health
```

Use this endpoint to verify:
- The Vercel deployment is running
- Environment variables are loaded (environment field shows correct value)

---

### `POST /api/send-order-confirmation`

**File:** `app/api/send-order-confirmation/route.ts`
**Runtime:** `nodejs` (explicit — required by Resend SDK)
**Auth required:** No (caller must supply valid data)

Sends an order confirmation email via Resend to the customer's email address.

#### Request

```http
POST /api/send-order-confirmation HTTP/1.1
Content-Type: application/json
```

**Request Body:**

```json
{
  "orderId": "uuid-string",
  "orderNumber": "ORD-12345",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "items": [
    {
      "id": 1,
      "name": "Casual Linen Shirt",
      "price": 49.99,
      "quantity": 2,
      "image": "https://...",
      "color": "Navy Blue"
    }
  ],
  "subtotal": 99.98,
  "shipping": 5.99,
  "tax": 8.50,
  "total": 114.47,
  "shippingAddress": {
    "name": "Jane Doe",
    "address": "123 Main St",
    "city": "San Francisco",
    "zipCode": "94102"
  },
  "trackingNumber": "TRK123456"
}
```

**Required fields:** `orderId`, `orderNumber`, `customerEmail`

**Optional fields:** `customerName` (defaults to `"Valued Customer"`), `items`, `subtotal`, `shipping`, `tax`, `total`, `shippingAddress`, `trackingNumber`

#### Request Body Schema

| Field | Type | Required | Description |
|-------|------|---------|-------------|
| `orderId` | string (UUID) | ✅ | Database order ID |
| `orderNumber` | string | ✅ | Display order number (shown in email) |
| `customerName` | string | ❌ | Customer's display name |
| `customerEmail` | string | ✅ | Recipient email address |
| `items` | array | ❌ | Line items for the email |
| `items[].id` | number | — | Item ID |
| `items[].name` | string | — | Product name |
| `items[].price` | number | — | Unit price |
| `items[].quantity` | number | — | Quantity |
| `items[].image` | string | — | Product image URL |
| `items[].color` | string | — | Selected color |
| `subtotal` | number | ❌ | Order subtotal |
| `shipping` | number | ❌ | Shipping cost |
| `tax` | number | ❌ | Tax amount |
| `total` | number | ❌ | Order total |
| `shippingAddress` | object | ❌ | Shipping address details |
| `shippingAddress.name` | string | — | Recipient name |
| `shippingAddress.address` | string | — | Street address |
| `shippingAddress.city` | string | — | City |
| `shippingAddress.zipCode` | string | — | ZIP/postal code |
| `trackingNumber` | string | ❌ | Shipping tracking number |

#### Response — 200 OK

```json
{
  "success": true,
  "message": "Order confirmation email sent successfully",
  "messageId": "resend-message-id"
}
```

#### Response — 400 Bad Request

Returned when required fields are missing or JSON is malformed:

```json
{
  "success": false,
  "error": "Missing required fields: orderId, orderNumber, customerEmail"
}
```

or

```json
{
  "success": false,
  "error": "Invalid JSON in request body",
  "details": "..."
}
```

#### Response — 500 Internal Server Error

Returned when email sending fails:

```json
{
  "success": false,
  "error": "Resend API error message",
  "details": "..."
}
```

#### Usage

```javascript
// Called from checkout-form.tsx after order creation
const response = await fetch('/api/send-order-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: order.id,
    orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
    customerEmail: user.email,
    items: cartItems,
    total: orderTotal,
  }),
});
```

---

## Server Actions

Server Actions are invoked from React components using the Next.js Server Actions protocol (`"use server"`). They communicate over a special Next.js internal RPC mechanism — they are not regular HTTP endpoints and should not be called with `fetch`.

### `createUserProfile`

**File:** `app/actions/auth-actions.ts`
**Uses:** Service role Supabase client

Creates a new user profile row in `public.profiles` immediately after sign-up.

**Why this exists:** When a user signs up, their Supabase Auth record is created but there is no corresponding `profiles` row yet. Since the user's session is not yet active, the anon-key client cannot insert a profile row (RLS would block it). This Server Action uses the service role key to bypass RLS and insert the profile.

#### Signature

```typescript
export async function createUserProfile(
  userId: string,
  userData: {
    username: string;
    full_name: string;
  }
): Promise<{ success: boolean; error?: unknown }>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string (UUID) | The newly created user's `auth.users.id` |
| `userData.username` | string | Unique username for the profile |
| `userData.full_name` | string | User's full name |

#### Returns

```typescript
// Success
{ success: true }

// Failure
{ success: false, error: unknown }
```

#### Side Effects

- Inserts one row into `public.profiles` with `id = userId`, `username`, `full_name`.

---

### `saveOutfit`

**File:** `app/actions/outfit-actions.ts`
**Uses:** Service role Supabase client

Saves a new outfit (with its items) for a user.

#### Signature

```typescript
export async function saveOutfit(
  userId: string,
  outfitData: {
    name: string;
    description?: string;
    avatar_id?: string;
    is_favorite?: boolean;
    items: Array<{
      product_id: string;
      position_data?: string;
      customization_data?: any;
    }>;
  }
): Promise<{ success: boolean; outfit?: SavedOutfit; error?: unknown }>
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|---------|-------------|
| `userId` | string | ✅ | Authenticated user's ID |
| `outfitData.name` | string | ✅ | Display name for the outfit |
| `outfitData.description` | string | ❌ | Optional description |
| `outfitData.avatar_id` | string | ❌ | UUID of the associated avatar |
| `outfitData.is_favorite` | boolean | ❌ | Star / favorite flag |
| `outfitData.items` | array | ✅ | Products in the outfit |
| `outfitData.items[].product_id` | string | ✅ | Product UUID |
| `outfitData.items[].position_data` | string | ❌ | Serialized 3D position data |
| `outfitData.items[].customization_data` | any | ❌ | JSONB customization (color, material) |

#### Returns

```typescript
// Success
{ success: true, outfit: { id: "...", name: "...", ... } }

// Failure
{ success: false, error: unknown }
```

#### Side Effects

1. Inserts one row into `public.saved_outfits`.
2. Inserts N rows into `public.outfit_items` (one per item in the array).

---

### `getUserOutfits`

**File:** `app/actions/outfit-actions.ts`
**Uses:** Service role Supabase client

Fetches all saved outfits for a user, including related avatars and outfit items with their products.

#### Signature

```typescript
export async function getUserOutfits(
  userId: string
): Promise<{ success: boolean; outfits?: OutfitWithDetails[]; error?: unknown }>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string (UUID) | Authenticated user's ID |

#### Returns

Outfits ordered by `created_at` descending. Each outfit includes:
- `avatars(*)` — related avatar
- `outfit_items(*, products(*))` — items with product details

```typescript
// Success
{ success: true, outfits: [...] }

// Failure
{ success: false, error: unknown }
```

---

### `deleteOutfit`

**File:** `app/actions/outfit-actions.ts`
**Uses:** Service role Supabase client

Deletes a saved outfit after verifying ownership.

#### Signature

```typescript
export async function deleteOutfit(
  outfitId: string,
  userId: string
): Promise<{ success: boolean; error?: string | unknown }>
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `outfitId` | string (UUID) | ID of the outfit to delete |
| `userId` | string (UUID) | Authenticated user's ID (for ownership check) |

#### Returns

```typescript
// Success
{ success: true }

// Unauthorized
{ success: false, error: "Unauthorized" }

// DB error
{ success: false, error: unknown }
```

#### Authorization

Even though RLS enforces ownership at the database level, `deleteOutfit` also performs an application-level ownership check:

1. Fetches `saved_outfits WHERE id = outfitId` and reads `user_id`.
2. If `outfit.user_id !== userId` → returns `{ success: false, error: "Unauthorized" }` without executing the delete.

#### Side Effects

Deletes the `saved_outfits` row. Associated `outfit_items` rows are deleted by CASCADE.

---

## Error Handling

All Route Handlers and Server Actions follow a consistent error pattern:

```typescript
// Success
return { success: true, data: ... }

// Failure
return { success: false, error: errorObject }
```

Route Handlers additionally use HTTP status codes:
- `200` — success
- `400` — validation error (missing required fields, malformed JSON)
- `500` — server error (database error, email send failure)

Server Actions do not have HTTP status codes; callers check the `success` boolean.

---

## Client-Side Data Functions

In addition to Server Actions, `lib/customization-utils.ts` provides client-side data functions that use the anon-key Supabase client directly. These run in the browser and respect RLS.

| Function | Table | Operation |
|----------|-------|-----------|
| `getUserAvatars(userId)` | `avatars` | SELECT own avatars |
| `getAvatarById(avatarId)` | `avatars` + `avatar_measurements` | SELECT with join |
| `createAvatar(data)` | `avatars` | INSERT |
| `updateAvatar(id, data)` | `avatars` | UPDATE |
| `deleteAvatar(id)` | `avatars` | DELETE |
| `addAvatarMeasurement(data)` | `avatar_measurements` | INSERT |
| `getAvatarMeasurements(avatarId)` | `avatar_measurements` | SELECT |
| `getUserOutfits(userId)` | `saved_outfits` + `outfit_items` + `products` | SELECT with joins |
| `getOutfitById(id)` | `saved_outfits` + joins | SELECT single |
| `createOutfit(data, items)` | `saved_outfits` + `outfit_items` | INSERT both |
| `updateOutfit(id, data)` | `saved_outfits` | UPDATE |
| `deleteOutfit(id)` | `saved_outfits` | DELETE |
| `addOutfitItem(data)` | `outfit_items` | INSERT |
| `removeOutfitItem(id)` | `outfit_items` | DELETE |
| `updateOutfitItems(outfitId, items)` | `outfit_items` | DELETE + INSERT |

These functions throw on error (they do not return `{ success, error }` — they let the caller handle the thrown error).
