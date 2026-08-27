# Beginner Database Guide

| Field | Value |
|---|---|
| Document | Database guide |
| Stage | Planning |
| Owner | Backend Lead |
| Status | ✅ PASS |
| Version | 0.1 |
| Last updated | 2026-08-26 |
| Depends on | [Data model](data-model.md), [ADR-003](architecture.md#adr-003-prisma-and-sqlite-persistence) |
| Next review | Explicit user approval of Planning |

> **Executive summary**
>
> Learning data will live in one local SQLite database file owned by the backend. Prisma provides typed access, while committed migrations describe every approved schema change. The database is not created during Planning; this guide explains the future workflow and safe inspection.

## Plain-language model

Think of SQLite as a filing cabinet stored in one file. Tables are drawers: one for folders, one for vocabulary, one for completed tests, and one for answers. Prisma is the labeled form the backend uses to read and write those drawers safely. A migration is a dated instruction sheet explaining how the drawer layout changes.

## Planned storage location

- Prisma schema: `apps/api/prisma/schema.prisma` — committed later.
- Migration history: `apps/api/prisma/migrations/` — committed later.
- Local database: `apps/api/prisma/dev.db` — generated locally and ignored by Git.
- Test databases: unique temporary paths under the test runner’s temporary directory — never committed.

No database file or migration exists yet.

## Prisma

Prisma ORM translates TypeScript repository calls into parameterized SQLite operations. Application services use repository ports rather than importing the Prisma client directly. This keeps business tests fast and prevents database details from leaking into HTTP handlers.

## Migration workflow

After an approved implementation task changes the schema:

1. Edit `schema.prisma` to match the approved data model.
2. Run the approved Prisma migration command with a descriptive name.
3. Review generated SQL before accepting it.
4. Apply the migration to an isolated development database.
5. Run repository/integration tests against a fresh migrated test database.
6. Commit the schema and migration directory, but not `dev.db`.
7. Record the command, exit code, generated paths, and verification evidence.

Never edit table structure manually with a SQLite GUI. Manual edits cannot be replayed reliably and would violate the migration policy.

## Planned first migration

The first real migration will create `Folder`, `Vocabulary`, `TestSession`, and `TestAnswer` tables, foreign keys, unique indexes, and aggregate-query indexes exactly as approved in [data-model.md](data-model.md). Planning does not create a fake migration or predict its generated SQL.

## Committed versus ignored

| Item | Git policy | Reason |
|---|---|---|
| `schema.prisma` | Commit | Reviewable source of schema intent |
| Migration directories/SQL | Commit | Reproducible history |
| Seed scripts/fixtures | Commit when approved | Reproducible test/development inputs |
| `.env.example` | Commit without secrets | Documents variable names |
| `.env`, `dev.db`, test DBs | Ignore | Local data/secrets/generated state |
| Generated Prisma client | Do not hand-edit; installation policy decides tracking | Recreated from schema |

## Safe inspection

After implementation, a beginner can use Prisma Studio through an approved npm script to view rows without writing SQL. Open the local development database only, verify the path shown by `DATABASE_URL`, avoid editing production-like evidence, and close Studio before migrations. Repository integration tests provide the authoritative automated verification.

## Backup and recovery

For the local MVP, stop the API before copying `dev.db`; copying during a write can be inconsistent. Restore only a database whose migration history matches the code. A future hosted/multi-user deployment requires a new persistence ADR and backup plan.

## Database verification expectations

- Fresh database reaches the latest schema using migrations only.
- Duplicate folder and same-folder vocabulary constraints reject conflicts.
- Deleting or changing related records cannot orphan answers.
- Completed session plus answers commits atomically; failure leaves neither partial session nor partial answers.
- Dashboard aggregate queries match fixture data.
