# docs/api/

**Purpose:** API route documentation — inputs, outputs, error responses, and authentication requirements.
**Audience:** Frontend developers, integration partners, AI agents working on server-side code.

## Contents

| File | Description |
|------|-------------|
| [`API_REFERENCE.md`](./API_REFERENCE.md) | All API routes under `app/api/` — method, path, request body, response schema |

## Current API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check — returns status, timestamp, and environment |
| `/api/send-order-confirmation` | POST | Sends order confirmation email via Resend |

## Rules

- Update `API_REFERENCE.md` every time a new `app/api/*/route.ts` file is added or modified.
- Document all request fields, response shapes, and possible error codes.
- Server actions in `app/actions/` are documented in `docs/architecture/DATA_FLOW.md`, not here.
