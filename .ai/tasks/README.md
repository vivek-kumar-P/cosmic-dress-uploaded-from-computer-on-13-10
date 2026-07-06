# .ai/tasks/

**Purpose:** Active per-task working files. One file per in-progress AI work item.
**Lifecycle:** Short-term. Deleted (or moved) when the task is merged or resolved.
**Editable:** Yes — actively modified during task execution.

## Naming Convention

```
YYYY-MM-DD-short-description.md
```

Example: `2026-07-06-implement-docs-phase-1.md`

## Lifecycle

1. Create task file when starting work.
2. Update it as the task progresses.
3. On completion: move to `.ai/audits/`, `.ai/migrations/`, or `.ai/reports/` (whichever is appropriate).
4. Delete from `tasks/` once moved.

## Rule

This directory should be empty when no AI task is active. If files accumulate here, they represent incomplete or abandoned work that needs to be resolved.
