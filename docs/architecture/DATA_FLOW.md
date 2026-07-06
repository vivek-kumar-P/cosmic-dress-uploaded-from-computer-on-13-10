# Data Flow

**Purpose:** Documents how data enters, moves through, and exits the system for all key user interactions.
**Related:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [SECURITY_MODEL.md](./SECURITY_MODEL.md) · [API_REFERENCE.md](../api/API_REFERENCE.md)

---

## Table of Contents

- [Authentication Flow](#authentication-flow)
- [Product Catalog Flow](#product-catalog-flow)
- [3D Outfit Builder Flow](#3d-outfit-builder-flow)
- [Cart and Checkout Flow](#cart-and-checkout-flow)
- [Order Confirmation Email Flow](#order-confirmation-email-flow)
- [Saved Outfit Flow](#saved-outfit-flow)
- [Model Upload Flow](#model-upload-flow)

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant AuthContext
    participant Supabase Auth

    Browser->>AuthContext: signUp(email, password)
    AuthContext->>Supabase Auth: supabase.auth.signUp()
    Supabase Auth-->>AuthContext: { user, session }
    AuthContext->>Server Action: createUserProfile(userId, { username, full_name })
    Server Action->>Supabase DB: INSERT INTO profiles (id, username, full_name)
    Server Action-->>AuthContext: { success: true }
    AuthContext-->>Browser: session set, redirect to /onboarding

    Browser->>AuthContext: signIn(email, password)
    AuthContext->>Supabase Auth: supabase.auth.signInWithPassword()
    Supabase Auth-->>AuthContext: { user, session }
    AuthContext-->>Browser: session stored in localStorage, redirect to /dashboard
```

**Why:** `createUserProfile` runs in a Server Action using the service role key, because the user's session is not yet established when the profile row must first be created. The anon-key client cannot insert a profile row without an active session.

---

## Product Catalog Flow

```mermaid
sequenceDiagram
    participant Browser
    participant useFilters Hook
    participant Supabase DB

    Browser->>useFilters Hook: mount with filter params
    useFilters Hook->>Supabase DB: SELECT from products WHERE category=... AND style=...
    Supabase DB-->>useFilters Hook: products[]
    useFilters Hook-->>Browser: render ProductCard list

    Browser->>useFilters Hook: user changes filter (e.g., category = "tops")
    useFilters Hook->>Supabase DB: SELECT from products WHERE category='tops'
    Supabase DB-->>useFilters Hook: filtered products[]
    useFilters Hook-->>Browser: re-render filtered list
```

Products are publicly readable (RLS policy: `Anyone can view products`). No authentication is required to browse the catalog.

---

## 3D Outfit Builder Flow

```mermaid
flowchart TD
    A[User opens /customize or /3d-playground] --> B[Three.js Canvas renders in browser]
    B --> C[User selects product from picker]
    C --> D[useFilters loads products from Supabase]
    D --> E[Product has model_url field]
    E --> F{model_url set?}
    F -- Yes --> G[Load GLTF/GLB via drei useGLTF]
    F -- No --> H[Show 2D product image placeholder]
    G --> I[calculateModelTransform normalizes to 1.8m height]
    I --> J[Position model at origin, feet at y=0]
    J --> K[User may apply color via applyMaterialColor]
    K --> L[Scene renders in real time with OrbitControls]
    L --> M[User saves outfit]
    M --> N[Server Action: saveOutfit]
    N --> O[INSERT saved_outfits + outfit_items in Supabase]
```

**Model normalization** ensures that GLTF/GLB files from different sources all appear at the same scale. The `calculateModelTransform` function in `lib/model-utils.ts` computes a scale factor so the model bounding box height equals 1.8 m, then positions it with feet at y=0.

---

## Cart and Checkout Flow

```mermaid
sequenceDiagram
    participant Browser
    participant CartContext
    participant CheckoutForm
    participant Supabase DB
    participant EmailAPI

    Browser->>CartContext: addItem(product, quantity)
    CartContext-->>Browser: cart state updated (in memory)

    Browser->>CheckoutForm: navigate to /checkout
    CheckoutForm->>Browser: render address + summary form
    Browser->>CheckoutForm: submit address + confirm order

    CheckoutForm->>Supabase DB: INSERT INTO orders (user_id, total_amount, status='pending')
    Supabase DB-->>CheckoutForm: order.id

    CheckoutForm->>Supabase DB: INSERT INTO order_items (order_id, product_id, quantity, price) × N
    Supabase DB-->>CheckoutForm: order_items created

    CheckoutForm->>EmailAPI: POST /api/send-order-confirmation { orderId, customerEmail, items, ... }
    EmailAPI->>Resend: sendOrderConfirmationEmail()
    Resend-->>EmailAPI: { messageId }
    EmailAPI-->>CheckoutForm: { success: true, messageId }

    CheckoutForm->>CartContext: clearCart()
    CheckoutForm->>Browser: redirect to /order-confirmation?orderId=...
```

---

## Order Confirmation Email Flow

The email route is a separate Node.js runtime Route Handler to guarantee full Node.js API compatibility for the Resend SDK.

```mermaid
flowchart LR
    CheckoutForm -->|POST JSON| API[/api/send-order-confirmation]
    API -->|validate required fields| Validate{orderId + orderNumber + customerEmail present?}
    Validate -- No --> E400[400 Bad Request]
    Validate -- Yes --> Email[sendOrderConfirmationEmail via Resend]
    Email -- success --> R200[200 OK + messageId]
    Email -- fail --> R500[500 + error details]
```

**Required request body fields:** `orderId`, `orderNumber`, `customerEmail`.

Optional: `customerName`, `items[]`, `subtotal`, `shipping`, `tax`, `total`, `shippingAddress`, `trackingNumber`.

---

## Saved Outfit Flow

```mermaid
sequenceDiagram
    participant User
    participant OutfitBuilder
    participant Server Action: saveOutfit
    participant Supabase DB

    User->>OutfitBuilder: builds outfit (selects products, colors)
    User->>OutfitBuilder: clicks "Save Outfit"
    OutfitBuilder->>Server Action: saveOutfit(userId, { name, description, avatar_id, items[] })
    Server Action->>Supabase DB: INSERT INTO saved_outfits
    Supabase DB-->>Server Action: saved_outfits.id
    Server Action->>Supabase DB: INSERT INTO outfit_items (outfit_id, product_id, position_data, customization_data)
    Supabase DB-->>Server Action: outfit_items created
    Server Action-->>OutfitBuilder: { success: true, outfit }
    OutfitBuilder-->>User: toast "Outfit saved!"
```

`deleteOutfit` in the Server Action first verifies `outfit.user_id === userId` before deleting, providing server-side ownership validation even though RLS also enforces this at the database level.

---

## Model Upload Flow

```mermaid
flowchart TD
    A[User selects GLTF/GLB file] --> B[use-model-upload hook]
    B --> C[Validate file type and size]
    C --> D[supabase.storage.from bucket .upload path file]
    D --> E[Supabase Storage RLS check: is user authenticated?]
    E -- Pass --> F[File stored, public URL returned]
    E -- Fail --> G[Upload rejected, error shown]
    F --> H[product_models INSERT with model_url = public URL]
    H --> I[3D viewer loads model via useGLTF publicURL]
```

---

## Related Documents

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Module responsibilities
- [3D_SYSTEM.md](./3D_SYSTEM.md) — 3D rendering pipeline
- [SECURITY_MODEL.md](./SECURITY_MODEL.md) — RLS enforcement details
- [API_REFERENCE.md](../api/API_REFERENCE.md) — Route Handler specs
