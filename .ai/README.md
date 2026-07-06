# .ai/ — AI Working Memory

**Purpose:** Permanent workspace for AI-generated work products. Replaces the pattern of accumulating files in external brain directories.
**Audience:** AI agents and engineers reviewing AI work.

---

## Directory Structure

```
.ai/
├── context/        — Permanent project brief (read first on every session)
├── status/         — Living project dashboard (updated start/end of sessions)
├── planning/       — Roadmap, epics, and stories
├── tasks/          — Active per-task working files
├── audits/         — Completed audits (immutable after completion)
├── migrations/     — Migration specifications (immutable after completion)
├── reports/        — Generated analysis reports (immutable after completion)
├── memory/         — Architectural decisions log (human-curated)
└── scratch/        — Temporary files (deleted after task closes; gitignored)
```

---

## Lifecycle Rules

| Directory | Lifecycle | Editable After Creation? |
|-----------|-----------|--------------------------|
| `context/` | Permanent | Yes — updated as project evolves |
| `status/` | Living | Yes — updated frequently |
| `planning/` | Semi-permanent | Yes — until epic/story is closed |
| `tasks/` | Short-term | Yes — deleted when task closes |
| `audits/` | Permanent | **No — read-only after completion** |
| `migrations/` | Permanent | **No — read-only after completion** |
| `reports/` | Permanent | **No — read-only after completion** |
| `memory/` | Permanent | Yes — append only |
| `scratch/` | Temporary | Yes — deleted when task closes |

---

## AI Session Protocol

When starting a session on this project:
1. Read `.ai/context/PROJECT_CONTEXT.md` — understand the project.
2. Read `.ai/status/PROJECT_STATUS.md` — understand current state.
3. Place new work in the appropriate subdirectory.
4. Update `PROJECT_STATUS.md` before ending the session.
5. Move completed task files to `audits/`, `migrations/`, or `reports/`.
6. Delete scratch files when no longer needed.

---

## Naming Conventions

- Completed dated files: `YYYY-MM-DD-descriptive-name.md`
- Active task files: `YYYY-MM-DD-short-name.md`
- Temporary scratch files: `tmp-YYYY-MM-DD-description.{md,sql,js,ts}`
