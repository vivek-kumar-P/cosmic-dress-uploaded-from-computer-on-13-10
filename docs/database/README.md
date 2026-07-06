# docs/database/

**Purpose:** Database documentation — schema reference, migration history, and security decisions.
**Audience:** Engineers working on the database layer, AI agents running migrations.

## Contents

| File | Description |
|------|-------------|
| [`SCHEMA_REFERENCE.md`](./SCHEMA_REFERENCE.md) | All 20+ tables with columns, types, constraints, and RLS status |
| [`MIGRATION_INDEX.md`](./MIGRATION_INDEX.md) | Table of all SQL scripts — name, purpose, status (applied / pending) |
| [`schema-snapshot.sql`](./schema-snapshot.sql) | Read-only reference snapshot of live database schema |

## Rules

- `schema-snapshot.sql` is never executed. It is a reference-only document.
- Update `MIGRATION_INDEX.md` every time a new `scripts/NN-*.sql` file is created.
- `SCHEMA_REFERENCE.md` is updated after every migration that adds or alters tables.
