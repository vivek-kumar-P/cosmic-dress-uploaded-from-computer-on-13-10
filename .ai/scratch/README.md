# .ai/scratch/

**Purpose:** Temporary working files used during active AI tasks.
**Lifecycle:** Short-term. Deleted when the parent task closes.
**Editable:** Yes.

> ⚠️ **This directory is listed in `.gitignore`.**
> Files here are never committed to the repository.
> Use this directory for exploratory queries, draft SQL, throwaway analysis scripts, and intermediate notes.

## Naming Convention

```
tmp-YYYY-MM-DD-description.{md,sql,js,ts}
```

Example: `tmp-2026-07-06-test-index-query.sql`

## Rule

If a scratch file turns out to contain valuable, reusable content, it must be moved to the correct permanent location before the task closes:
- Analysis → `.ai/audits/` or `.ai/reports/`
- Migration spec → `.ai/migrations/`
- Planning → `.ai/planning/`
