# docs/archive/

**Purpose:** Historical documents that have been superseded, replaced, or converted to a better format.
**Audience:** Engineers investigating the project's history.

## Archive Rules

1. **Files here are frozen.** Never edit an archived file in place.
2. **Files here are not deleted** until their content has been fully migrated and one production deploy has verified the new location.
3. **All filenames include a date suffix** so multiple versions can coexist.
4. Deletion of an archived file requires explicit human approval.

## Contents

| File / Folder | Original Location | Reason Archived |
|---------------|-------------------|-----------------|
| `supabase-linter-raw-2026-07-05.md` | `docs/supabase-linter-report.md` | Raw machine output; replaced by human-readable audit in `.ai/audits/` |
| `pdfs/` | `docs_pdfs/` | PDFs superseded by Markdown source files in `docs/` |

## `pdfs/` Subfolder

Contains the original PDF documentation files. Three of these (DEPLOYMENT_CHECKLIST, ENVIRONMENT_SETUP, SUPABASE_DEPLOYMENT_GUIDE) contain unique content that has been extracted to Markdown. The other four are exact duplicates of existing Markdown files.
