# .ai/migrations/

**Purpose:** Specification documents for every production database migration. One file per SQL script.
**Lifecycle:** Permanent.
**Editable:** NO. Files here are frozen once the migration is applied to production.

## Rule

Every file in `scripts/NN-*.sql` must have a corresponding specification document here.

## Index

| Spec File | SQL Script | Status | Applied |
|-----------|-----------|--------|---------|
| `migration-22-catalog-rls.md` | `scripts/22-enable-catalog-rls.sql` | ✅ Complete | Pending live apply |
| `migration-23-fk-indexes.md` | `scripts/23-add-missing-foreign-key-indexes.sql` | ✅ Complete | Pending live apply |
| `migration-24-trigger-search-path.md` | `scripts/24-fix-trigger-search-path.sql` | ✅ Complete | Pending live apply |
| `migration-25-secure-trigger-functions.md` | `scripts/25-secure-trigger-functions-final.sql` | ✅ Complete | Pending live apply |

> **Note:** Scripts 00–20 predate this documentation system. They are covered by the migration index in `docs/database/MIGRATION_INDEX.md`.

## Naming Convention

```
migration-NN-short-description.md
```
Where `NN` matches the script number in `scripts/`.

## Contents of Each Spec File

Each migration spec must include:
- Purpose and audit finding that drove the change
- Pre-execution diff (what changes, what is preserved)
- Rollback SQL
- Verification SQL
- Manual testing checklist
