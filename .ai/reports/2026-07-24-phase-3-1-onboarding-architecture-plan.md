# Phase 3.1 — User Onboarding Architecture Plan

**Date:** 2026-07-24
**Phase:** 3.1 — Architecture, UX, and Route Protection Planning
**Status:** PLANNING ONLY — No implementation

---

## 1. Executive Summary

The project is a 3D Outfit Builder / Fashion E-commerce platform. A first-time user onboarding
experience already exists at `components/onboarding/onboarding-flow.tsx` but it is minimal
(3 steps, light UI, no style preferences, no gender, no address normalization to `user_addresses`).

The database foundation for full onboarding was laid in Phase 2:
- `profiles` — extended with `street_address`, `phone`, `city`, `state`, `postal_code`, `country`, `onboarding_completed`, `gender`
- `user_addresses` — normalized multi-address table
- `user_preferences` — structured preference arrays for personalization

This plan describes how to replace the existing minimal onboarding flow with a polished,
complete, production-quality experience that collects sufficient data to power future
personalization, RAG-based search, and recommendation systems.

---

## 2. Existing Authentication Flow (As-Built)

### Sign-Up Path
1. User visits `/auth/register` → `RegisterForm` component
2. `RegisterForm` calls `signUp(email, password, { full_name })` from `AuthContext`
3. `AuthContext.signUp()` calls `supabase.auth.signUp()` with `user_metadata.full_name`
4. Supabase sends confirmation email
5. RegisterForm shows "Check Your Email" success state — **user is NOT redirected to onboarding**
6. User clicks email link → arrives at `/auth/callback?code=xxx`
7. `app/auth/callback/route.ts` exchanges code for session
8. Callback checks if profile exists; if not, creates minimal profile (`username`, `full_name`, `avatar_url: null`, `bio: null`)
9. **Callback always redirects to `/dashboard`** — not to `/onboarding`
10. `handle_new_user` trigger in DB (migration 25) may also create the profile row — creating a race condition risk

### Sign-In Path
1. User visits `/auth/login` → `LoginForm` component
2. `LoginForm` calls `signIn(email, password)` from `AuthContext`
3. `AuthContext.signIn()` calls `supabase.auth.signInWithPassword()`
4. On success, `LoginForm` **immediately redirects to `/dashboard`** (before profile is even fetched)
5. Profile is fetched asynchronously in the background via `fetchProfile(data.user.id).then(setProfile)`
6. **`onboarding_completed` is never checked anywhere during sign-in**

### Session Restoration Path
1. On any page load, `AuthProvider` calls `supabase.auth.getSession()`
2. If session exists, `fetchProfile(user.id)` is called
3. `AuthProvider` tracks `user`, `session`, `profile`, `loading` in React state
4. `onAuthStateChange` re-fetches profile on `SIGNED_IN` and `USER_UPDATED` events

### Key Findings
- **`onboarding_completed` is set to `false` on new user creation** (auth-context.tsx:70)
- **`onboarding_completed` is set to `true` only inside `onboarding-flow.tsx:219`** (via `updateProfile`)
- **`onboarding_completed` is NEVER READ anywhere in the routing/redirect logic**
- **No route guard exists for onboarding** — authenticated users can freely access `/dashboard`, `/customize`, `/products`, `/gallery`, etc. regardless of onboarding status
- **The `/onboarding` route is public** — any user (authenticated or not) can visit it; `onboarding-flow.tsx` itself redirects unauthenticated users to login, but completed-onboarding users are not redirected away
- **The auth callback always sends users to `/dashboard`** even on first signup

---

## 3. Existing Onboarding Flow (As-Built)

**Route:** `/onboarding` → `app/onboarding/page.tsx` → `components/onboarding/onboarding-flow.tsx`

### Current Steps (3 steps)

| Step | Title | Fields Collected |
|------|-------|-----------------|
| 1 | Personal Info | `full_name` (required), `username` (required), `bio`, `phone` |
| 2 | Address | `address` (street, required), `city` (required), `state`, `postal_code`, `country` (required) |
| 3 | Profile Picture | Avatar file upload to Supabase Storage `avatars` bucket |

### Current Data Persistence
- Step completion submits all data at once in `handleComplete()`
- Calls `updateProfile(profileUpdates as any)` from `AuthContext`
- Maps `data.address` → `street_address` in DB (Phase 2 fix)
- Sets `onboarding_completed: true`
- Redirects to `/dashboard` on success

### Current Gaps
1. **Not triggered on first login** — user must manually navigate to `/onboarding`
2. **No style preferences** — `user_preferences` table not written to
3. **Address not written to `user_addresses`** — only written to `profiles.street_address`
4. **No gender field** — missing from form and from `profiles.gender` column
5. **No address line 2** — form has single `address` field, no structured address
6. **UI is minimal** — light blue gradient, not consistent with the dark cosmic brand
7. **Resumable onboarding** — not supported; starting over is the only option
8. **No welcome/intro step** — user is thrown directly into a form
9. **No completion/celebration step** — after submit, silent redirect

---

## 4. Current Profile Architecture (As-Built)

### AuthContext `Profile` Interface (source of truth)
```typescript
interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  website?: string
  street_address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  onboarding_completed?: boolean
  created_at?: string
  updated_at?: string
}
```

**Missing from Profile interface:**
- `gender` — present in the DB (added in earlier migrations based on earlier audit) but not in the interface
- No `user_addresses` or `user_preferences` — these are separate tables

### AuthContext Methods
| Method | Purpose | Notes |
|--------|---------|-------|
| `updateProfile(updates)` | Update `profiles` table | Used by settings and onboarding |
| `completeOnboarding(profileData)` | Update `profiles` + set `onboarding_completed: true` | Exists but not used in current flow (onboarding-flow.tsx uses `updateProfile` instead) |
| `refreshProfile()` | Re-fetch profile from DB | Used after save operations |

**Note:** `completeOnboarding()` exists in `auth-context.tsx` but is not called by `onboarding-flow.tsx`. The flow uses `updateProfile()` directly with `onboarding_completed: true` in the payload. This is functionally equivalent but creates duplication.

---

## 5. Current Database Architecture (As-Built)

### `profiles` table (current known columns)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, FK → auth.users |
| `email` | text | |
| `username` | text | |
| `full_name` | text | |
| `avatar_url` | text | |
| `bio` | text | |
| `phone` | text | Added in earlier migration |
| `website` | text | Added in earlier migration |
| `street_address` | text | Phase 2: replaces `address` |
| `city` | text | |
| `state` | text | |
| `postal_code` | text | |
| `country` | text | |
| `gender` | text | Added in earlier migration — NOT in Profile interface yet |
| `onboarding_completed` | boolean | Default: false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `user_addresses` table (created in Phase 2)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `full_name` | text | |
| `phone` | text | |
| `address_line_1` | text | NOT NULL |
| `address_line_2` | text | |
| `city` | text | NOT NULL |
| `state` | text | |
| `country` | text | NOT NULL |
| `postal_code` | text | |
| `is_default` | boolean | Default: false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `user_preferences` table (created in Phase 2)
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users UNIQUE |
| `preferred_styles` | text[] | |
| `preferred_colors` | text[] | |
| `preferred_sizes` | text[] | |
| `preferred_categories` | text[] | |
| `preferred_occasions` | text[] | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

## 6. Proposed Onboarding UX

### Design Philosophy
- Matches the dark cosmic/space aesthetic of the platform (`#0A0A1A`, `#00C4B4`, deep purples)
- Progressive disclosure — each step is focused
- No required fields that block completion beyond the absolute minimum
- Skip options on optional steps (style preferences, avatar)
- Smooth step transitions (slide or fade)
- Progress bar with step indicators
- Final celebration screen before redirect

### Proposed Steps (5 Steps)

---

#### STEP 0 — Welcome Screen
**Purpose:** Set expectations, build trust, explain why data is collected.

**Content:**
- Platform logo / hero image
- Welcome headline: "Welcome to Cosmic Outfits — Let's personalize your experience"
- Short explanation: "We'll ask you a few questions to help create a personalized fashion experience for you."
- "Takes about 2 minutes" indicator
- "Let's Get Started" button
- "Skip for now" link (marks `onboarding_completed: true` immediately with minimal profile)

**Database writes:** None (pure UX step)

---

#### STEP 1 — Basic Profile
**Purpose:** Collect identity and contact info.

| Field | Label | Required | DB Target |
|-------|-------|----------|-----------|
| Full Name | Full Name | YES | `profiles.full_name` |
| Username | Username | YES | `profiles.username` |
| Phone | Phone Number | No | `profiles.phone` |
| Gender | Gender (select) | No | `profiles.gender` |
| Bio | Short Bio | No | `profiles.bio` |

**Notes:**
- `full_name` pre-populated from `user_metadata.full_name` set during signup
- `username` pre-populated from email prefix
- Gender: dropdown with `Male`, `Female`, `Non-binary`, `Prefer not to say`
- Phone: for shipping/order purposes; enables SMS notifications later
- Bio: optional, free text

**Database writes:** `profiles` (on final submission, not per-step)

---

#### STEP 2 — Shipping Address
**Purpose:** Capture primary shipping address for checkout pre-fill.

| Field | Label | Required | DB Target |
|-------|-------|----------|-----------|
| Full Name | Name on delivery | YES | `user_addresses.full_name` |
| Phone | Delivery phone | No | `user_addresses.phone` |
| Address Line 1 | Street address | YES | `user_addresses.address_line_1` |
| Address Line 2 | Apt, Suite, Floor | No | `user_addresses.address_line_2` |
| City | City | YES | `user_addresses.city` |
| State | State / Province | No | `user_addresses.state` |
| Country | Country | YES | `user_addresses.country` |
| Postal Code | Postal / ZIP code | No | `user_addresses.postal_code` |

**Notes:**
- Always inserted as `is_default: true` (user's first address = default)
- `user_addresses.full_name` defaults to `profiles.full_name` from Step 1
- `user_addresses.phone` defaults to `profiles.phone` from Step 1
- Also writes `profiles.city`, `profiles.state`, `profiles.country` for profile display convenience
- This step can be skipped — user can add addresses later in Settings
- "Skip" records no address row but step is not required

**Database writes:** `user_addresses` (INSERT with `is_default: true`), `profiles.city/state/country`

---

#### STEP 3 — Style Preferences
**Purpose:** Seed the personalization engine with explicit preferences.

| Field | Label | Required | DB Target | Input Type |
|-------|-------|----------|-----------|------------|
| Preferred Styles | My style vibe | No | `user_preferences.preferred_styles` | Multi-select chips |
| Preferred Colors | Favorite colors | No | `user_preferences.preferred_colors` | Color swatches |
| Preferred Categories | What I wear most | No | `user_preferences.preferred_categories` | Multi-select chips |
| Preferred Occasions | When I dress up | No | `user_preferences.preferred_occasions` | Multi-select chips |
| Preferred Sizes | My sizes | No | `user_preferences.preferred_sizes` | Multi-select per category |

**Suggested values for each:**

*Styles:* Casual, Formal, Streetwear, Activewear, Bohemian, Minimalist, Vintage, Preppy, Gothic, Business Casual

*Colors:* Black, White, Navy, Beige, Grey, Brown, Red, Pink, Green, Yellow, Purple, Orange, Pastels, Neons, Earth Tones

*Categories:* Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories, Bags, Athleisure

*Occasions:* Everyday, Work/Office, Going Out, Formal Events, Sports/Gym, Beach, Travel, Date Night

*Sizes:* XS, S, M, L, XL, XXL (clothing); 5–13 US (shoes)

**Notes:**
- All fields optional; user can choose 0 or more
- If skipped entirely, `user_preferences` row is still inserted with all NULLs to mark the step was reached
- Chip/badge UI — tap to select, tap again to deselect
- This step can be fully skipped with a "Skip for now" button

**Database writes:** `user_preferences` (UPSERT — insert or update)

---

#### STEP 4 — Profile Picture (Optional)
**Purpose:** Upload avatar for profile personalization.

| Field | Label | Required | DB Target |
|-------|-------|----------|-----------|
| Avatar | Profile photo | No | `profiles.avatar_url` (Supabase Storage) |

**Notes:**
- Pre-shows initials avatar as fallback
- Upload to `avatars` storage bucket (already configured)
- Max 5MB, image/* only
- Can be skipped with "Continue without photo"
- Label: "Add a face to your profile" — optional, explicitly

**Database writes:** `profiles.avatar_url` (Supabase Storage upload)

---

#### STEP 5 — Completion Screen
**Purpose:** Confirm setup and launch the app.

**Content:**
- Celebration animation (e.g., confetti or cosmic burst)
- "You're all set, [first_name]!" headline
- Summary of what was configured
- "Explore the Platform" CTA → `/products` or `/customize`
- "Go to Dashboard" secondary link → `/dashboard`

**Database writes:** `profiles.onboarding_completed: true` (final write)

---

## 7. Field-to-Database Mapping

| Step | UI Field | DB Table | DB Column | Required | Future Use |
|------|----------|----------|-----------|----------|-----------|
| 1 | Full Name | `profiles` | `full_name` | YES | Display, personalization |
| 1 | Username | `profiles` | `username` | YES | Display, URL slug |
| 1 | Phone | `profiles` | `phone` | No | Orders, SMS notifications |
| 1 | Gender | `profiles` | `gender` | No | Style recommendations |
| 1 | Bio | `profiles` | `bio` | No | Social, profile display |
| 2 | Full Name (delivery) | `user_addresses` | `full_name` | YES (if step taken) | Checkout pre-fill |
| 2 | Phone (delivery) | `user_addresses` | `phone` | No | Checkout |
| 2 | Street Address | `user_addresses` | `address_line_1` | YES (if step taken) | Checkout pre-fill |
| 2 | Apt/Suite | `user_addresses` | `address_line_2` | No | Checkout |
| 2 | City | `user_addresses` | `city` | YES (if step taken) | Checkout, location display |
| 2 | City (profile) | `profiles` | `city` | No | Profile display |
| 2 | State | `user_addresses` | `state` | No | Checkout |
| 2 | State (profile) | `profiles` | `state` | No | Profile display |
| 2 | Country | `user_addresses` | `country` | YES (if step taken) | Checkout |
| 2 | Country (profile) | `profiles` | `country` | No | Profile display |
| 2 | Postal Code | `user_addresses` | `postal_code` | No | Checkout |
| 2 | `is_default` | `user_addresses` | `is_default` | YES (automatic: true) | Default checkout address |
| 3 | Preferred Styles | `user_preferences` | `preferred_styles` | No | Recommendations, RAG |
| 3 | Preferred Colors | `user_preferences` | `preferred_colors` | No | Recommendations, RAG |
| 3 | Preferred Categories | `user_preferences` | `preferred_categories` | No | Recommendations, RAG |
| 3 | Preferred Occasions | `user_preferences` | `preferred_occasions` | No | Recommendations, RAG |
| 3 | Preferred Sizes | `user_preferences` | `preferred_sizes` | No | Filtering, recommendations |
| 4 | Avatar photo | `profiles` | `avatar_url` | No | Display everywhere |
| 5 | (completion) | `profiles` | `onboarding_completed` | YES (automatic: true) | Route protection |

### Critical Design Decisions

**Q: Should address also write to `profiles.street_address`?**
A: **No.** `profiles.street_address` is a legacy convenience field. Going forward:
- `user_addresses` is the canonical shipping address store
- `profiles.street_address` can be deprecated gracefully
- Profile display (`profile-header.tsx`) should prefer `profiles.city`/`country` (already done)
- Checkout should read from `user_addresses WHERE is_default = true`

**Q: Where is gender stored?**
A: `profiles.gender` — a text column added in an earlier migration. It must also be added to the `Profile` interface in `auth-context.tsx`.

**Q: Should `user_preferences` be INSERTed or UPSERTed?**
A: **UPSERT** (`INSERT ... ON CONFLICT (user_id) DO UPDATE SET ...`). Since `user_id` is UNIQUE on the table, this allows re-running the preferences step without constraint errors.

---

## 8. Required vs Optional Fields

| Field | Required | Reason |
|-------|----------|--------|
| `full_name` | YES | Identity — needed everywhere |
| `username` | YES | Display, URL routing |
| `phone` | No | Contact — can add later |
| `gender` | No | Personalization — sensitive |
| `bio` | No | Social — purely optional |
| Shipping address | No (step skippable) | Needed for checkout only |
| Style preferences | No (step skippable) | Personalization seed |
| Avatar | No (step skippable) | Visual polish |

**Minimum viable onboarding for a new user:**
- `full_name` ✅
- `username` ✅
- `onboarding_completed: true` ✅

All other data can be filled later via Settings.

---

## 9. Onboarding State Management

### Approach: `onboarding_completed` boolean (no new columns needed)

The existing `profiles.onboarding_completed` boolean is sufficient for the route gate.

**State machine:**

```
NEW USER
  → onboarding_completed = false
  → Must see onboarding flow

ONBOARDING IN PROGRESS
  → User is inside /onboarding
  → onboarding_completed still = false

ONBOARDING COMPLETE
  → onboarding_completed = true (written at Step 5)
  → Never shown onboarding again
  → Can modify data via Settings

EXISTING USER (no onboarding_completed flag set / NULL)
  → Treat as onboarding_completed = false (should be onboarded)
```

### Step Progress Within a Single Session
- Managed in React local state (`currentStep` integer)
- No DB column needed for in-session step tracking
- If user refreshes mid-onboarding: they restart from step 0 (acceptable for a one-time flow)
- If user closes browser mid-onboarding: they restart on next login (acceptable)
- Onboarding is a one-time 2-minute flow — no resume logic needed

### Skip Behavior
- "Skip for now" on the Welcome screen: immediately sets `onboarding_completed: true` with minimal profile → redirects to `/dashboard`
- "Skip" on individual steps (address, preferences, avatar): steps are bypassed, no data written for that step, but flow continues to next step
- Each step's "Skip" button is clearly labeled "Skip for now, I'll add this later"

### Why not an `onboarding_step` integer column?
- Adds complexity (new migration, additional logic)
- Onboarding is 5 steps / ~2 minutes — resume logic adds disproportionate overhead
- Users who return mid-onboarding likely want to just re-do it quickly
- **Decision: Do NOT add `onboarding_step` — not needed**

---

## 10. Route Protection Design

### Current State
- **No `middleware.ts` exists**
- `ProtectedRoute` component checks auth (`user` presence) only — does NOT check `onboarding_completed`
- Auth callback always redirects to `/dashboard` — skips onboarding for new users
- `/onboarding` is accessible to all (auth check is inside the component itself)

### Proposed Route Classification

| Route Pattern | Classification | Auth Required | Onboarding Required |
|---------------|---------------|---------------|---------------------|
| `/` | PUBLIC | No | No |
| `/products` | PUBLIC | No | No |
| `/products/[id]` | PUBLIC | No | No |
| `/gallery` | PUBLIC | No | No |
| `/auth/login` | PUBLIC | No | No |
| `/auth/register` | PUBLIC | No | No |
| `/auth/callback` | PUBLIC (system) | No | No |
| `/auth/forgot-password` | PUBLIC | No | No |
| `/onboarding` | ONBOARDING | YES (redirects to login if not auth'd) | NO (this IS the onboarding page) |
| `/dashboard` | PROTECTED | YES | YES |
| `/dashboard/settings` | PROTECTED | YES | YES |
| `/dashboard/create-outfit` | PROTECTED | YES | YES |
| `/profile` | PROTECTED | YES | YES |
| `/profile/settings` | PROTECTED | YES | YES |
| `/customize` | PROTECTED | YES | NO (allow browsing without onboarding) |
| `/cart` | SEMI-PROTECTED | No (allow guests) | No |
| `/checkout` | PROTECTED | YES | YES (need address) |
| `/orders` | PROTECTED | YES | YES |
| `/outfit-picker` | PUBLIC | No | No |
| `/3d-playground` | SEMI-PROTECTED | No (allow guests) | No |

### Redirect Rules

```
Unauthenticated user → any PROTECTED route
  → redirect to /auth/login?next=[requested-path]

Authenticated user with onboarding_completed = false → any ONBOARDING-REQUIRED route
  → redirect to /onboarding

Authenticated user with onboarding_completed = true → /onboarding
  → redirect to /dashboard (already completed)

Authenticated user visiting /auth/login or /auth/register
  → redirect to /dashboard (or /onboarding if not complete)
```

### Implementation Approach

**Option A: Next.js Middleware (`middleware.ts`)**
- Runs on the edge before page render
- Can read Supabase session cookie using `@supabase/auth-helpers-nextjs`
- Can check `onboarding_completed` by fetching the profile in the middleware
- Pro: Catches navigation before client-side hydration
- Con: Adds latency to all matching routes; `onboarding_completed` requires a DB read
- Mitigation: Only apply middleware to specific route groups; cache the profile read

**Option B: `ProtectedRoute` component enhancement**
- Extend existing `ProtectedRoute` to also check `profile.onboarding_completed`
- Pro: No middleware, no edge function, pure client-side
- Con: Not truly protected — page content could flash before redirect; relies on profile being loaded

**Option C: Hybrid (Recommended for this project)** ← RECOMMENDED
- Auth check (`user` presence) → via `middleware.ts` (edge, fast, cookie-based)
- Onboarding check (`onboarding_completed`) → via enhanced `ProtectedRoute` (client-side, profile-aware)
- This keeps middleware lightweight (auth only) and avoids the DB read at edge

**Recommended approach: Option C — Hybrid**
1. `middleware.ts` handles: unauthenticated → `/auth/login` redirect
2. Enhanced `ProtectedRoute` with `requireOnboarding?: boolean` prop handles: authenticated but not onboarded → `/onboarding` redirect
3. Auth callback (`/auth/callback/route.ts`) modified: check `onboarding_completed` after session exchange → redirect to `/onboarding` for new users, `/dashboard` for returning users

### Auth Callback Fix (Critical)
Currently the callback always redirects to `/dashboard`. Fix needed:
```typescript
// After profile fetch:
if (!profile?.onboarding_completed) {
  return NextResponse.redirect(new URL('/onboarding', request.url))
}
return NextResponse.redirect(new URL('/dashboard', request.url))
```
This is the minimum required change to activate the onboarding flow for new users.

---

## 11. Settings Integration Design

### Principle: Single Source of Truth, Shared Logic

Both onboarding and settings should read from and write to the same DB tables.
No separate models, no sync logic, no duplication.

### Settings Structure (Proposed)

The existing `settings-tabs.tsx` already has a tab structure. The proposed section mapping:

| Section | Current | Proposed | DB Source |
|---------|---------|---------|-----------|
| Profile | ✅ Exists (basic fields) | Enhance: add gender, improve layout | `profiles` |
| Addresses | ❌ Missing | NEW: address list, add/edit/delete/default | `user_addresses` |
| Preferences | ❌ Missing | NEW: style preference chips (same UI as onboarding) | `user_preferences` |
| Account | ❌ Partial | Password change, email, danger zone | `auth.users` |
| Notifications | ❌ Placeholder | Toggle settings | `profiles` or new table |

### Reusable Server Actions (Recommended)

Create these shared actions in `app/actions/profile-actions.ts`:

| Action | Purpose | Input | DB Operation |
|--------|---------|-------|-------------|
| `updateProfile(updates)` | Update profile fields | `Partial<Profile>` | UPDATE `profiles` |
| `createAddress(data)` | Add shipping address | Address fields | INSERT `user_addresses` |
| `updateAddress(id, data)` | Edit existing address | Address fields | UPDATE `user_addresses` WHERE id |
| `deleteAddress(id)` | Remove address | address ID | DELETE `user_addresses` WHERE id |
| `setDefaultAddress(id)` | Set default | address ID | UPDATE `user_addresses` (trigger handles deduplication) |
| `upsertPreferences(data)` | Save style prefs | Preference arrays | UPSERT `user_preferences` |

**Note:** `updateProfile()` already exists in `AuthContext` and `settings-tabs.tsx` uses it directly via the context. The question is whether to also create a server action version for use in server components. For Phase 3, the client-side `updateProfile()` from context is sufficient.

### Avatar Upload
Currently `onboarding-flow.tsx` uploads to Supabase Storage `avatars` bucket correctly.
`settings-tabs.tsx` converts avatar to base64 (not storage) — this is a known gap to fix in Phase 3.

---

## 12. Security and RLS Considerations

### Current RLS State (From Migration 26)

| Table | RLS Enabled | Policies | Policy Condition |
|-------|------------|---------|------------------|
| `profiles` | ✅ YES | SELECT, UPDATE own | `id = auth.uid()` |
| `user_addresses` | ✅ YES | SELECT, INSERT, UPDATE, DELETE own | `user_id = (SELECT auth.uid())` |
| `user_preferences` | ✅ YES | SELECT, INSERT, UPDATE, DELETE own | `user_id = (SELECT auth.uid())` |

### Security Gaps Identified

**Gap 1: `app/auth/callback/route.ts` profile creation uses anon client**
The callback creates a profile using `createRouteHandlerClient` with the user's session cookie.
This is correct — it uses the authenticated user's permissions, gated by RLS.
However, the profile `INSERT` in the callback only sets `username` and `full_name`.
The trigger `handle_new_user` may also try to insert, causing a conflict.
**Resolution needed:** Investigate trigger behavior; add `ON CONFLICT DO NOTHING` to callback insert.

**Gap 2: `auth-actions.ts` uses service role key for profile creation**
`createUserProfile()` in `app/actions/auth-actions.ts` uses the service role key (bypasses RLS).
This function is a server action (`"use server"`) — service role key is server-only, not exposed to browser. This is architecturally correct.
However, it's not currently called anywhere (orphaned function).
**Resolution needed:** Either use it in the registration flow or remove it to reduce surface area.

**Gap 3: No server-side validation on profile/address updates**
`updateProfile()` in `AuthContext` calls Supabase from the browser client with user's anon key.
RLS ensures users can only update their own profile. 
However, there is no server-side field validation (e.g., no check that `username` is unique or safe).
**Resolution needed:** Add server-side validation via server actions for Phase 3.

**Gap 4: `settings-tabs.tsx` avatar upload stores base64 in DB**
Currently `settings-tabs.tsx` stores avatar as a base64 data URL in `profiles.avatar_url`.
This bloats the profiles table and is not consistent with the Supabase Storage approach used in onboarding.
**Resolution needed:** Fix avatar upload in settings to use Supabase Storage (Phase 3).

**Gap 5: No middleware session validation**
Without `middleware.ts`, route protection relies entirely on client-side JavaScript.
A user who manipulates the browser state could access protected pages.
**Resolution needed:** Add `middleware.ts` for auth verification (Phase 3).

### Security Requirements for Phase 3 Implementation
- Client-side validation: UX only (instant feedback)
- Server-side validation: actual security boundary (via server actions or RLS)
- RLS policies are the final enforcement layer — they are already correct
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code
- `onboarding_completed` should be set server-side (or via RLS-protected client call)

---

## 13. Validation Strategy

### Per-Field Validation Rules

| Field | Client Validation | Server Validation |
|-------|------------------|------------------|
| `full_name` | Non-empty, max 100 chars | Non-empty |
| `username` | Non-empty, 3-30 chars, alphanumeric + underscore | Uniqueness check |
| `phone` | Optional; E.164 format hint | Optional |
| `gender` | Optional; enum check | Optional |
| `bio` | Optional; max 500 chars | Optional |
| `address_line_1` | Non-empty (if step taken) | Non-empty |
| `city` | Non-empty (if step taken) | Non-empty |
| `country` | Non-empty (if step taken) | Non-empty |
| Preference arrays | Optional; valid enum values | Optional |
| Avatar | Image type, max 5MB | File type, size |

### Validation Library
The project already has `zod` (`^3.24.1`) and `react-hook-form` (`^7.54.1`) in dependencies.
**Recommendation:** Use `react-hook-form` + `zod` for each step's form validation.
This is cleaner than the current manual validation in `onboarding-flow.tsx`.

---

## 14. TypeScript Type Strategy

### Current State
- `types/supabase.ts` — stale; does not reflect current schema; missing extended profile columns, `user_addresses`, `user_preferences`
- `contexts/auth-context.tsx` `Profile` interface — manually maintained; currently correct for profiles but **missing `gender`**
- Application code primarily uses the `Profile` interface, not `types/supabase.ts`

### Strategy for Phase 3

**Step 1:** Before Phase 3.2 implementation, add `gender` to `Profile` interface in `auth-context.tsx`:
```typescript
interface Profile {
  // ... existing fields ...
  gender?: string  // ADD THIS
}
```

**Step 2:** Create typed interfaces for `user_addresses` and `user_preferences` in a new file:
```typescript
// types/app.ts  (new file — hand-maintained)
export interface UserAddress { ... }
export interface UserPreferences { ... }
```

**Step 3:** Use these types in all Phase 3 components.

**Step 4:** After Phase 3 is stable, retry `npx supabase gen types` and replace `types/supabase.ts`.
Remove `as any` casts at that point.

**Long-term goal:** `types/supabase.ts` = generated source of truth.
**Short-term approach:** Manually maintained `Profile`, `UserAddress`, `UserPreferences` interfaces.

**This does NOT block Phase 3 implementation.**

---

## 15. Future Personalization Data Readiness

The onboarding data collected in Phase 3 directly seeds the personalization pipeline:

| Data Collected | Future Use |
|----------------|-----------|
| `gender` | Style filtering, recommendation category weighting |
| `preferred_styles` | Initial recommendation seed; embedding profile |
| `preferred_colors` | Color-aware outfit suggestions |
| `preferred_categories` | Category-weighted ranking |
| `preferred_occasions` | Occasion-aware context injection for RAG |
| `preferred_sizes` | Size filtering in product results |
| `street_address` / `user_addresses` | Location-aware delivery, regional trends |
| `bio` | Optional: NLP extraction for style signals |

All of these fields are already in the database schema. Phase 3 simply populates them.
No schema changes are needed for the personalization foundation.

---

## 16. Implementation Phases

### Phase 3.2 — Core Onboarding Flow Implementation (NEXT)
Scope:
- Rebuild `components/onboarding/onboarding-flow.tsx` with 5 steps
- Redesign with dark cosmic brand (consistent with rest of app)
- Add `react-hook-form` + `zod` validation
- Write to `profiles`, `user_addresses`, `user_preferences`
- Fix auth callback to redirect new users to `/onboarding`
- Add `gender` to `Profile` interface
- Create `types/app.ts` with `UserAddress` and `UserPreferences` interfaces

### Phase 3.3 — Route Protection
Scope:
- Create `middleware.ts` for auth-level protection
- Enhance `ProtectedRoute` component with `requireOnboarding` prop
- Fix login redirect to check `onboarding_completed`
- Fix auth callback redirect logic

### Phase 3.4 — Settings Integration
Scope:
- Add Addresses tab to `settings-tabs.tsx`
- Add Preferences tab to `settings-tabs.tsx`
- Fix avatar upload in settings to use Supabase Storage
- Create `app/actions/profile-actions.ts` server actions

### Phase 3.5 — Polish and Production Readiness
Scope:
- Loading states and skeleton screens
- Error handling and retry logic
- Accessibility audit
- Mobile responsiveness review
- Final TypeScript type cleanup

---

## 17. Risks and Open Questions

### Open Questions Requiring User Input

**Q1: Should the `/customize` and `/3d-playground` routes require onboarding?**
- These are core product features (3D outfit builder)
- Allowing unauthenticated / non-onboarded users to use the 3D builder may increase engagement
- Recommended: Allow access without onboarding (treat as discovery features)
- **Decision needed:** YES require onboarding / NO allow without onboarding

**Q2: Should the existing `profiles.street_address` be retired or kept?**
- Phase 2 kept `street_address` as a convenience field
- Going forward, `user_addresses` is the proper store for shipping addresses
- `profiles.street_address` is still shown in `profile-header.tsx`
- Recommended: Keep `street_address` for display purposes; populate it from the first `user_addresses` entry
- **Decision needed:** Keep as display field / Deprecate entirely

**Q3: Should `username` be enforced as globally unique?**
- Currently the DB has no UNIQUE constraint on `profiles.username` (not confirmed)
- The onboarding form does not check for uniqueness before submit
- Recommended: Add a uniqueness check (via server action) before accepting
- **Decision needed:** Enforce uniqueness / Leave as-is for now

**Q4: Welcome screen "Skip for now" behavior**
- If user skips the entire onboarding, they get `onboarding_completed: true` immediately
- They will never be shown onboarding again
- They can fill in data later via Settings
- Is this acceptable? Or should "Skip" redirect to dashboard but NOT set `onboarding_completed: true` (allowing the gate to show again on next login)?
- Recommended: Skip sets `onboarding_completed: true` — avoid annoying repeat interruptions
- **Decision needed:** Hard skip (no repeat) / Soft skip (shows again next login)

**Q5: Should we prompt returning users who skipped onboarding?**
- A soft in-app banner on the dashboard ("Complete your profile to unlock personalization") is non-intrusive
- **Decision needed:** Yes add a dashboard banner / No, keep it clean

### Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `handle_new_user` trigger + callback both create profile → conflict | HIGH | Add `ON CONFLICT DO NOTHING` to callback insert; investigate trigger |
| `types/supabase.ts` still stale; `as any` casts required | MEDIUM | Use hand-maintained interfaces; regenerate types after Phase 3 complete |
| Auth callback redirect change may break existing returning users | MEDIUM | Only redirect to `/onboarding` if `onboarding_completed = false`; returning users unaffected |
| Gender field missing from `Profile` interface | LOW | Add before Phase 3.2 (one-line fix) |
| Middleware adds latency to all matched routes | LOW | Apply matcher only to protected routes; keep middleware lightweight |
| `user_preferences` UPSERT on re-onboarding may overwrite user's Settings changes | LOW | Only call UPSERT if user hasn't previously set preferences; or use merge strategy |

---

## 18. Recommended Next Step

**Phase 3.2 — Implement Core User Onboarding Flow**

Specific implementation order:
1. Add `gender` to `Profile` interface in `auth-context.tsx` (1-line change)
2. Create `types/app.ts` with `UserAddress` and `UserPreferences` interfaces
3. Rebuild `components/onboarding/onboarding-flow.tsx` (5 steps, dark theme, RHF + Zod)
4. Fix `app/auth/callback/route.ts` to redirect new users to `/onboarding`
5. Fix `app/auth/login/components/login-form.tsx` to check `onboarding_completed` before dashboard redirect
6. Test end-to-end new user flow

**Before implementation begins, decisions needed from user:**
- Q1: Customize/3D-playground onboarding requirement
- Q4: Skip behavior (hard vs soft)
- Q5: Dashboard re-prompt banner

---

## Appendix A — Existing Files That Will Be Modified in Phase 3.2

| File | Change |
|------|--------|
| `components/onboarding/onboarding-flow.tsx` | Full rebuild |
| `app/auth/callback/route.ts` | Add onboarding redirect logic |
| `components/auth/login-form.tsx` | Check `onboarding_completed` on login |
| `contexts/auth-context.tsx` | Add `gender` to Profile interface |

## Appendix B — New Files to Be Created in Phase 3.2

| File | Purpose |
|------|---------|
| `types/app.ts` | Hand-maintained `UserAddress`, `UserPreferences` interfaces |
| `app/actions/profile-actions.ts` | Server actions for address/preferences |

## Appendix C — New Files to Be Created in Phase 3.3

| File | Purpose |
|------|---------|
| `middleware.ts` | Edge auth protection |

## Appendix D — Files to be Enhanced in Phase 3.4

| File | Change |
|------|--------|
| `components/profile/settings-tabs.tsx` | Add Addresses and Preferences tabs |
| `app/dashboard/settings/settings-client-page.tsx` | Integrate new tabs |
