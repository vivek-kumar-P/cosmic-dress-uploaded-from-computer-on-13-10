# .ai/planning/

**Purpose:** High-level roadmap, multi-session epics, and individual feature/fix stories.
**Lifecycle:** Semi-permanent. Retained until an epic or story is closed.
**Editable:** Yes — updated as plans evolve.

## Contents

| File / Folder | Description |
|---------------|-------------|
| [`ROADMAP.md`](./ROADMAP.md) | 3–6 month horizon of planned improvements, organized by priority |
| `epics/` | Multi-sprint planning documents. One file per major work stream. |
| `stories/` | Individual feature or fix specifications. One file per story. |

## Naming Conventions

- Epics: `epic-YYYY-MM-short-name.md` (e.g., `epic-2026-07-database-security.md`)
- Stories: `story-YYYY-MM-DD-short-name.md`

## Lifecycle

When an epic is complete:
1. Move its file to `.ai/audits/` with a date suffix.
2. Remove it from the epics/ folder.
3. Update `ROADMAP.md` to reflect completion.
