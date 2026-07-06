# .ai/context/

**Purpose:** Permanent project brief. The first file an AI agent reads at the start of every session.
**Lifecycle:** Permanent. Updated when the project's technology, architecture, or key constraints change.
**Editable:** Yes — updated as the project evolves.

## Contents

| File | Description |
|------|-------------|
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) | Tech stack, folder structure, database overview, security decisions, architectural decisions, coding standards, and AI working rules |

## Update Triggers

Update `PROJECT_CONTEXT.md` when:
- A new technology is added to the stack
- An architectural constraint is established
- A security model decision is finalized
- A migration permanently changes the schema in a significant way
- A major milestone is completed

Do NOT update it for:
- Small refactors
- Bug fixes
- Documentation reorganization that does not change functionality
