# docs/architecture/

**Purpose:** System design documents explaining how the application is built and why key decisions were made.
**Audience:** Engineers, technical reviewers, AI agents resuming architecture work.

## Contents

| File | Description |
|------|-------------|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Full system design — tech stack, module roles, runtime flow |
| [`DATA_FLOW.md`](./DATA_FLOW.md) | Auth, cart, order, and state management data flows |
| [`3D_SYSTEM.md`](./3D_SYSTEM.md) | Three.js pipeline, GLB model loading, texture and customizer system |
| [`SECURITY_MODEL.md`](./SECURITY_MODEL.md) | RLS design, SECURITY DEFINER functions, auth trigger security |
| [`diagrams/`](./diagrams/) | ERD and architectural diagrams |

## Rules

- One topic per file. Do not merge unrelated architecture concerns.
- Update when the architecture changes — not for small refactors.
- Link every file from `README.md` at the project root.
