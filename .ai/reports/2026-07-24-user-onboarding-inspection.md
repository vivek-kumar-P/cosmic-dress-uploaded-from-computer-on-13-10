# User Onboarding Implementation Readiness Report

## 1. Executive Summary
This report provides a comprehensive architectural audit of the User Onboarding and Profile Management system for the **3D Outfit Builder** (Cosmic Dressing) application. The codebase utilizes Next.js 15, Supabase (Auth, DB, and Storage), and Three.js. 

Our core findings indicate that while a robust foundation for profiles, avatars, and security triggers exists in the database and server-side components, there are several key gaps and architectural inconsistencies:
1. **TypeScript Type Mismatch:** The generated TypeScript definitions in [supabase.ts](file:///E:/cosmic-dressing-using-antigravity/types/supabase.ts) are severely outdated and only reflect 8 columns of the `profiles` table, whereas the actual PostgreSQL schema contains 17 columns (including address and onboarding fields).
2. **Field Redundancy:** There is duplicate/overlapping storage for addresses: both `street_address` and `address` exist in the profiles table, with onboarding using `address` and dashboard settings using `street_address`.
3. **Client-Server Redundant Profile Fallbacks:** Both the server-side callback handler [route.ts](file:///E:/cosmic-dressing-using-antigravity/app/auth/callback/route.ts) and client-side [auth-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/auth-context.tsx) implement manual profile creation fallbacks in case the primary database trigger (`handle_new_user`) fails or runs out of sync.
4. **Behavioral Tracking Gaps:** While the database has schema definitions for `favorites` and orders, the frontend utilizes local storage contexts (`likes-context.tsx`, `cart-context.tsx`, `orders-context.tsx`) that do not write back to the Supabase database.
5. **No Route Guards for Onboarding:** There is no Next.js middleware or route guard checking `onboarding_completed` to force new users through the onboarding flow before accessing the dashboard or customizer.

The system is evaluated as **READY WITH REQUIRED DECISIONS** before the physical implementation phase can proceed.

---

## 2. Current Authentication Architecture
The authentication system is powered by **Supabase Auth** using email/password. 
- **Sign-Up Flow:** Handles registration via [register-form.tsx](file:///E:/cosmic-dressing-using-antigravity/components/auth/register-form.tsx) utilizing `supabase.auth.signUp()`.
- **Email Verification & Confirm Flow:** A confirmation token is sent to the user's email, which routes to [confirm/page.tsx](file:///E:/cosmic-dressing-using-antigravity/app/auth/confirm/page.tsx), invoking `supabase.auth.verifyOtp()` with the `signup` type. If verified, the user is redirected to the login screen.
- **Login Flow:** Handled via [login-form.tsx](file:///E:/cosmic-dressing-using-antigravity/components/auth/login-form.tsx) using `supabase.auth.signInWithPassword()`.
- **Logout Flow:** Initiated in [auth-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/auth-context.tsx#L156-L175) via `supabase.auth.signOut()`, cleaning up local states (`user`, `session`, `profile`) and redirecting to the homepage.
- **Auth Callback Handler:** [route.ts](file:///E:/cosmic-dressing-using-antigravity/app/auth/callback/route.ts) exchanges the auth code for a session via `supabase.auth.exchangeCodeForSession(code)`. It acts as a safety barrier by checking if the user profile exists, and if missing (PostgREST code `'PGRST116'`), inserts it using standard fields.
- **Session Management:** Standard client-side state is handled in [auth-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/auth-context.tsx) using `supabase.auth.onAuthStateChange` to fetch user profiles and persist the session.
- **Protected Routes:** Enforced via [protected-route.tsx](file:///E:/cosmic-dressing-using-antigravity/components/auth/protected-route.tsx), redirecting unauthenticated users to `/auth/login`.

---

## 3. Current User/Profile Architecture
A newly registered user exists as a record in Supabase's internal `auth.users` table. 
- **Automatic Profile Creation:** A database trigger, `handle_new_user()`, automatically runs after a user is added to `auth.users`, creating a matching record in `public.profiles`.
- **Redundant Safe Creation:** If the database trigger fails to create a profile (e.g., due to temporary database locks or transient connection errors), the Next.js auth callback server route and client-side context act as safety nets, executing a fallback `.insert()` query.
- **Onboarding Placement:** The onboarding step exists visually at `/onboarding` ([onboarding-flow.tsx](file:///E:/cosmic-dressing-using-antigravity/components/onboarding/onboarding-flow.tsx)). Currently, a user who completes sign-up is redirected to `/onboarding`. However, there is no technical enforcement to prevent them from manually navigating away (e.g. to `/dashboard` or `/customize`) since route guards do not check the `onboarding_completed` flag.

---

## 4. Existing Database Schema

### profiles
The profiles table holds core user information and e-commerce shipping address data.
- **Columns & Data Types:**
  - `id`: `uuid` (Primary Key, Foreign Key referencing `auth.users(id)`)
  - `email`: `text` (Nullable)
  - `username`: `text` (Unique, Nullable)
  - `full_name`: `text` (Nullable)
  - `avatar_url`: `text` (Nullable)
  - `bio`: `text` (Nullable)
  - `phone`: `text` (Nullable)
  - `website`: `text` (Nullable)
  - `street_address`: `text` (Nullable)
  - `city`: `text` (Nullable)
  - `state`: `text` (Nullable)
  - `postal_code`: `text` (Nullable)
  - `country`: `text` (Nullable)
  - `address`: `text` (Nullable) — *Duplicate column added in migration 14*
  - `onboarding_completed`: `boolean` (Default: `false`)
  - `created_at`: `timestamp with time zone` (Default: `now()`)
  - `updated_at`: `timestamp with time zone` (Default: `now()`)
- **Indexes:**
  - `idx_profiles_user_id` ON `profiles(id)`
  - `idx_profiles_username_unique` ON `profiles(username) WHERE username IS NOT NULL`
  - `idx_profiles_onboarding_completed` ON `profiles(onboarding_completed)`
  - `idx_profiles_full_name_search` (GIN index using English text search on `full_name`)
  - `idx_profiles_location` (Composite index on `city, country`)
  - `idx_profiles_active_users` (Composite index on `onboarding_completed, created_at DESC`)

### avatars
Connects user profiles to 3D model setups and personalization measurements.
- **Columns & Data Types:**
  - `id`: `uuid` (Primary Key, Default: `uuid_generate_v4()`)
  - `user_id`: `uuid` (Foreign Key referencing `auth.users(id)`)
  - `name`: `text` (NOT NULL)
  - `gender`: `text` (CHECK constraint: `'male', 'female', 'other'`)
  - `height`: `numeric` (Nullable)
  - `build`: `text` (CHECK constraint: `'slim', 'average', 'athletic'`)
  - `skin_tone`: `text` (Nullable)
  - `model_data`: `jsonb` (Nullable)
  - `body_measurements`: `jsonb` (Nullable)
  - `created_at` / `updated_at`: `timestamp with time zone` (Default: `now()`)
- **Triggers:**
  - `ensure_single_default_avatar_trigger`: Ensures only one avatar is marked as the default for a user.

### avatar_measurements
Stores detailed user sizing details for precision virtual try-on.
- **Columns & Data Types:**
  - `id`: `uuid` (Primary Key)
  - `avatar_id`: `uuid` (Foreign Key referencing `public.avatars(id)`)
  - `measurement_type`: `text` (NOT NULL)
  - `value`: `numeric` (NOT NULL)
  - `unit`: `text` (NOT NULL)
  - `created_at` / `updated_at`: `timestamp with time zone`

### Related tables
- `favorites`: Maps `user_id` (`auth.users`) to `product_id` (`products`).
- `saved_outfits`: Stores user-curated outfits linked to `user_id` and `avatar_id`.
- `outfit_items`: References individual catalog products in a saved outfit.
- `orders`: E-commerce order records referencing `user_id`. (Currently unused by the frontend cart).
- `order_items`: Line-items for completed orders. (Currently unused by the frontend cart).

---

## 5. Existing RLS Policies
Row Level Security is configured with performance optimizations utilizing `(SELECT auth.uid())` subqueries to bypass plan re-evaluation bottlenecks.

| Table | Policy Name | Operation | USING / WITH CHECK Condition | Security Implication |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | `profiles_select_policy` | `SELECT` | `id = (SELECT auth.uid()) OR (is_public = true AND onboarding_completed = true)` | Allows users to read their own profile, or public profiles once onboarding is finished. |
| `profiles` | `profiles_insert_policy` | `INSERT` | `id = (SELECT auth.uid())` | Restricts insertions to the logged-in user. |
| `profiles` | `profiles_update_policy` | `UPDATE` | `id = (SELECT auth.uid())` | Restricts updates to the profile owner. |
| `avatars` | `avatars_*_policy` | `ALL` | `user_id = (SELECT auth.uid())` | Full CRUD isolation: users only manage their own avatar models. |
| `avatar_measurements` | `avatar_measurements_*_policy` | `ALL` | `user_id = (SELECT auth.uid())` | Sizing measurements are restricted to the avatar owner. |

---

## 6. Existing Database Triggers and Functions
Defined in [25-secure-trigger-functions-final.sql](file:///E:/cosmic-dressing-using-antigravity/scripts/25-secure-trigger-functions-final.sql):

1. **`handle_new_user()`:**
   - **Operation:** Triggers `AFTER INSERT ON auth.users`.
   - **Fields Copied:** Extracts `id`, `email`, `username` (from metadata or email split), and `full_name` (from metadata or email split).
   - **Security:** Declared with `SECURITY DEFINER SET search_path = public`.
   - **Fail Safe:** Uses `ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()` to avoid crashing on duplicate sign-ups. Unhandled constraint errors roll back the signup transaction.
2. **`handle_user_update()`:**
   - **Operation:** Triggers `AFTER UPDATE OF email ON auth.users`.
   - **Logic:** Syncs the new email address to `public.profiles`.
3. **`handle_user_delete()`:**
   - **Operation:** Triggers `AFTER DELETE ON auth.users`.
   - **Logic:** Performs a transaction-safe cascading delete of all user-scoped records (`outfits`, `favorites`, `cart`, `orders`, `avatars`, and `profiles`) in correct foreign key order.
4. **`update_updated_at_column()`:**
   - **Operation:** Triggers `BEFORE UPDATE` on most tables, setting `updated_at = NOW()`.

---

## 7. Existing Storage Configuration
Configured in [20-fix-storage-rls.sql](file:///E:/cosmic-dressing-using-antigravity/scripts/20-fix-storage-rls.sql):
- **Buckets:** The bucket `avatars` is **Public** (`public = true`). It stores user profile photos and avatar images.
- **Path structure:** Uploads follow the convention `avatars/<user_id>/<filename>`.
- **Storage Policies:**
  - **`SELECT`:** `"Anyone can view avatars"`: `bucket_id = 'avatars'` (allows public profile picture retrieval).
  - **`INSERT`:** `"Authenticated users can upload avatars"`: `bucket_id = 'avatars' AND (SELECT auth.uid()) IS NOT NULL AND (storage.foldername(name))[1] = 'avatars'`.
  - **`UPDATE` / `DELETE`:** `"Users can update/delete their own avatars"`: `bucket_id = 'avatars' AND (SELECT auth.uid()::text) = (storage.foldername(name))[2]`.

---

## 8. Existing Profile and Settings UI
- **Settings Path:** `/dashboard/settings` maps to [settings-client-page.tsx](file:///E:/cosmic-dressing-using-antigravity/app/dashboard/settings/settings-client-page.tsx), hosting the [settings-tabs.tsx](file:///E:/cosmic-dressing-using-antigravity/components/profile/settings-tabs.tsx) component.
- **Displayed Information:**
  - **Profile Tab:** `full_name`, `username`, `bio`, `phone`, `website`, avatar picture. Reads/writes using the `updateProfile` method from `AuthContext`. Includes client-side validations.
  - **Address Tab:** `street_address`, `city`, `state`, `postal_code`, `country`. Writes directly to the `profiles` table.
  - **Security Tab:** Password fields (UI form only, currently **unimplemented**).
  - **Notifications Tab:** Email/push preference switches (Local state only, **not persisted**).
- **Onboarding Flow Path:** `/onboarding` maps to [onboarding-flow.tsx](file:///E:/cosmic-dressing-using-antigravity/components/onboarding/onboarding-flow.tsx).
  - Step 1: `full_name`, `username`, `bio`, `phone`.
  - Step 2: `address`, `city`, `state`, `postal_code`, `country`.
  - Step 3: Avatar image upload (writes to `avatars` bucket).
  - On submit: Runs `updateProfile()` in the DB, sets `onboarding_completed: true`, and redirects to `/dashboard`.

---

## 9. Existing TypeScript Types and Validation
- **Stale Type Definitions:** The generated definitions in [supabase.ts](file:///E:/cosmic-dressing-using-antigravity/types/supabase.ts) do not match the database. They lack the columns `phone`, `website`, `street_address`, `city`, `state`, `postal_code`, `country`, `address`, and `onboarding_completed`.
- **Validation Schemas:** Located in [validation.ts](file:///E:/cosmic-dressing-using-antigravity/lib/utils/validation.ts) using **Zod**:
  - `loginSchema`: Validates email and password format.
  - `registerSchema`: Validates email, password strength, matching passwords, username, and full name.
  - `profileUpdateSchema`: Validates `username`, `full_name`, `bio`, `website` URL format, and `location`.

---

## 10. Existing Documentation Findings
The documentation in `docs/` is detailed but presents a few critical conflicts:
- **`SCHEMA_REFERENCE.md` vs. Code types:** The reference document properly details all 17 columns of the profiles table. However, [supabase.ts](file:///E:/cosmic-dressing-using-antigravity/types/supabase.ts) is missing these fields.
- **`DATA_FLOW.md` vs. Database schema:** The data flow states `saved_outfits` uses `is_public` to manage outfit privacy. However, the database tables list `is_favorite` inside `saved_outfits`, while a separate unused table `outfits` (present in typescript type defs but not database schema) contains the `is_public` field.
- **Missing Middleware:** Documentation hints at auth protection middleware, but no `middleware.ts` is present in the codebase. Auth protection is handled client-side via Protected Route blocks.

---

## 11. Proposed Onboarding Data Model
We categorize the fields required for the onboarding and personalization systems:

### Core Fields (Stored in `profiles`)
- `full_name` (Existing)
- `email` (Existing)
- `phone` (Existing)
- `avatar_url` (Existing)

### Address Fields (Stored in `profiles` - Consolidated)
- `street_address` (Existing - *consolidate and drop duplicate `address` column*)
- `street_address_line_2` (Missing - *recommend adding*)
- `city` (Existing)
- `state` (Existing)
- `country` (Existing)
- `postal_code` (Existing)

### Personalization Fields (To be handled later in `user_preferences` table)
- `gender` (Stored on `avatars` table - *keep avatar-specific*)
- `date_of_birth` (Missing - *recommend adding to profiles later*)
- `preferred_clothing_style` (Missing)
- `preferred_colors` (Missing)
- `preferred_sizes` (Missing)
- `preferred_occasions` (Missing)
- `body_measurements` (Stored in `avatars.body_measurements` and `avatar_measurements` tables)
- `3D avatar configuration` (Stored in `avatars.model_data`)

---

## 12. Proposed Onboarding Flow
Conceptually, the signup and onboarding state machine will proceed as follows:

```
           New User Signup
                  │
                  ▼
         Supabase Auth Entry
                  │
                  ▼
      Auto-Trigger Profiles Row
                  │
                  ▼
       Client-Side Auth State
                  │
                  ▼
       Route Guard check:
       Does profiles.onboarding_completed == false?
         ├── YES ──► Redirect to /onboarding
         └── NO  ──► Redirect to /dashboard
                  │
                  ▼
      Step 1: Account Info (Zod validation)
                  │
                  ▼
      Step 2: Shipping Address (Zod validation)
                  │
                  ▼
      Step 3: Avatar Setup (3D Config & Measurements)
                  │
                  ▼
      Step 4: Fashion Preferences (Style Quiz)
                  │
                  ▼
      Upload Avatar Photo to Supabase Storage
                  │
                  ▼
      Save all details to profiles & user_preferences
      Set profiles.onboarding_completed = true
                  │
                  ▼
        Dashboard / Home Access
```

---

## 13. Settings/Profile Editing Strategy
To avoid UI duplication, the components built for onboarding should be exported as reusable sub-forms:
- **Sub-components:** `ProfileInfoForm`, `ShippingAddressForm`, `StyleQuizForm`, `BodyMeasurementsForm`.
- **Onboarding Page:** Imports these components and wraps them inside step transitions (e.g., using `framer-motion` and progress steps).
- **Settings Page:** Imports the same components and mounts them inside their respective Tabs (`Profile`, `Address`, `Style Preferences`). Any update updates the database reactively.

---

## 14. Security Considerations
- **Row Level Security (RLS):** Ensure that new preference tables require `auth.uid() = user_id`.
- **Storage security:** The `avatars` bucket must remain public for profile viewing, but files must follow the strict `avatars/<user_id>/...` structure to prevent write hijackings.
- **Input Validation:** Enforce strict Zod verification on the server side to filter out SQL injection payloads or invalid coordinates.
- **PII Protection:** Address details and phone numbers must only be returned in SELECT queries where `id = auth.uid()` (never visible under public profiles).
- **Profile Visibility:** Keep `is_public` controls to isolate profile bio and public saved outfits while masking private address/email fields.

---

## 15. Future RAG / Recommendation Readiness
- **Metadata Coverage:** Products already contain `category` and `style` enums.
- **Behavior tracking:** Gaps must be closed: the frontend must sync Cart, Likes, and Orders contexts back to database tables.
- **Event collection:** A new `user_activity_events` table is needed to record product clicks, time-on-page, searches, and zoom-in events.
- **RAG readiness:** Once the database tables are consolidated, enabling the `pgvector` extension and adding an `embedding` column on the `products` table will fit natively into the existing product catalog schema.

---

## 16. Identified Risks
- **Address Field Splitting:** Existing settings write to `street_address`, but onboarding writes to `address`. This will lead to data loss or desync.
- **TypeScript desync compilation errors:** Adding address properties to `Profile` types will fail compile-time checks because `supabase.ts` is missing these schema attributes.
- **Loss of Local Storage Events:** Moving to DB-based carts/likes could disrupt offline users. We must build a sync mechanism that transfers local cart items to the database upon authentication.

---

## 17. Recommended Implementation Plan

- **Phase 1 — Schema Cleansing:** Consolidate profile addresses, update `supabase.ts` type definitions, and create `user_preferences` table.
- **Phase 2 — Onboarding UI & Validation:** Rewrite the onboarding step UI utilizing modular sub-forms with Zod validation.
- **Phase 3 — Persistence & Sync:** Connect the onboarding forms to Supabase tables, and write local storage carts/likes sync hooks.
- **Phase 4 — Route Protection:** Add Next.js auth middleware or client route guards to enforce onboarding completion.
- **Phase 5 — Profile Editing Integration:** Update `/dashboard/settings` tabs to load and save using the modular onboarding sub-forms.
- **Phase 6 — Vector Setup & RAG Search:** Enable `pgvector` and build embedding generation hooks for semantic search.
- **Phase 7 — Recommendation Pipeline:** Build recommendation API routes utilizing user preferences and activity events.

---

## 18. Files That Will Need Modification
- [supabase.ts](file:///E:/cosmic-dressing-using-antigravity/types/supabase.ts) — *Add missing profile columns and the preferences schema.*
- [auth-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/auth-context.tsx) — *Extend Profile types and update onboarding hook logic.*
- [onboarding-flow.tsx](file:///E:/cosmic-dressing-using-antigravity/components/onboarding/onboarding-flow.tsx) — *Refactor into modular multi-step sections.*
- [settings-tabs.tsx](file:///E:/cosmic-dressing-using-antigravity/components/profile/settings-tabs.tsx) — *Reference consolidated address fields and mount new preference forms.*
- [likes-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/likes-context.tsx) — *Redirect writes to Supabase database.*
- [cart-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/cart-context.tsx) — *Redirect writes to Supabase database.*
- [orders-context.tsx](file:///E:/cosmic-dressing-using-antigravity/contexts/orders-context.tsx) — *Redirect writes to Supabase database.*

---

## 19. Files That Should Be Created
- `components/onboarding/profile-info-form.tsx` — *Modular name and basic info inputs.*
- `components/onboarding/shipping-address-form.tsx` — *Modular address details form.*
- `components/onboarding/style-preferences-form.tsx` — *Onboarding preference quiz form.*
- `lib/actions/personalization-actions.ts` — *Server actions to save preferences and activities.*
- `middleware.ts` (at Root) — *Middleware handling auth route protection and onboarding completion checks.*

---

## 20. Database Changes Required
- **Address Consolidation:** Copy data from `address` to `street_address`, then drop `address`.
- **New Tables:** Create `user_preferences` table with RLS enabled.
- **Embeddings:** Enable `pgvector` and alter `products` table to append `embedding` vector.

---

## 21. Open Questions / Human Decisions Required
1. **Should we force onboarding?** Should users be blocked from browsing the catalog or customizer until onboarding is complete?
2. **Address Simplification:** Do we want to support multiple shipping addresses or a single primary address?
3. **Local Storage Sync:** Should we discard anonymous guest carts/likes on login, or auto-sync them to the authenticated user's DB profile?

---

## 22. Final Recommendation
The safest next step is to **execute Phase 1 (Schema Cleansing & Type Pruning)**. Correcting the TypeScript types and resolving the duplicate address columns is essential before adding any new onboarding steps or forms to prevent build breaks.

---

### FINAL STATUS
- Authentication inspected: YES
- Profiles inspected: YES
- Avatars inspected: YES
- RLS inspected: YES
- Storage inspected: YES
- Triggers inspected: YES
- UI inspected: YES
- Types inspected: YES
- Documentation inspected: YES
- RAG readiness inspected: YES

### IMPLEMENTATION READINESS
- **READY WITH REQUIRED DECISIONS**
