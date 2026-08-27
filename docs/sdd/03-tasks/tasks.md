# Implementation Task Decomposition

| Field | Value |
|---|---|
| Document | Implementation task decomposition |
| Stage | Task Decomposition |
| Owner | Technical Leads |
| Status | ✅ PASS |
| Version | 0.1 |
| Last updated | 2026-08-26 |
| Depends on | [Specification](../01-spec/spec.md), [Plan](../02-plan/plan.md), [Architecture](../02-plan/architecture.md), [API contract](../02-plan/api-contract.md), [Data model](../02-plan/data-model.md) |
| Next review | Explicit user approval of Task Decomposition |

> **Executive summary**
>
> Twenty-two implementation tasks convert the approved requirements and twelve planned components into small, ordered work units. Feature tasks include their own tests; final frontend/backend quality tasks close coverage gaps and enforce four independent 95% thresholds. No task is authorized for execution until Task Verification passes and the user explicitly approves it.

## Execution rules

- Work on one approved task at a time unless the task plan explicitly permits independent parallel work.
- Every code change and test must cite its `TASK-`, requirement/rule, and planned `TEST-` IDs.
- Feature tests are implemented with the feature, not postponed to the coverage tasks.
- Database work must explain storage location, schema changes, migration behavior, committed/ignored files, and safe inspection.
- After each task, run its exact verification commands and record actual exit codes/evidence in the implementation report.
- A task cannot silently change approved requirements, business rules, ADRs, data model, or API contract.
- Code Generation remains locked until this document and Task Verification are explicitly approved.

## Task overview

| Task | Owner | Outcome | Components | Requirements | Planned tests | Depends on |
|---|---|---|---|---|---|---|
| TASK-001 | FE/BE Leads | Workspace and quality foundation | PC-010, PC-012 | NFR-001–NFR-010, NFR-016 | TEST-001 | None |
| TASK-002 | BE Lead | Shared contracts, configuration, and errors | PC-010 | FR-014, NFR-014–NFR-017, BR-014–BR-016 | TEST-002 | TASK-001 |
| TASK-003 | BE Lead | Prisma schema and initial migration | PC-002, PC-007 | FR-013, BR-003, BR-010, BR-017–BR-018, BR-025 | TEST-003 | TASK-001, TASK-002 |
| TASK-004 | BE Lead | Folder backend | PC-002 | FR-001, FR-014, BR-003, BR-016 | TEST-004 | TASK-003 |
| TASK-005 | BE Lead | Vocabulary backend | PC-002 | FR-002, FR-004, FR-013–FR-014, BR-001–BR-003, BR-016–BR-018, BR-021 | TEST-005 | TASK-003, TASK-004 |
| TASK-006 | BE Lead | CSV import backend | PC-003 | FR-003, FR-014, BR-004–BR-006, BR-017, BR-019–BR-020 | TEST-006 | TASK-005 |
| TASK-007 | BE Lead | Test generation and signed token | PC-006 | FR-007–FR-009, FR-014, BR-009, BR-024 | TEST-007 | TASK-002, TASK-005 |
| TASK-008 | BE Lead | Completed-session persistence and retrieval | PC-006, PC-007 | FR-010–FR-011, FR-013–FR-014, BR-010, BR-025 | TEST-008 | TASK-003, TASK-007 |
| TASK-009 | BE Lead | Dashboard aggregation backend | PC-008 | FR-012–FR-014, BR-011, BR-025–BR-026 | TEST-009 | TASK-004, TASK-005, TASK-008 |
| TASK-010 | BE Lead | Optional AI backend boundary | PC-009 | FR-015–FR-016, BR-012–BR-013, BR-027–BR-028 | TEST-010 | TASK-002, TASK-005 |
| TASK-011 | FE Lead | Web shell and accessible UI system | PC-001, PC-011 | FR-014, NFR-011–NFR-013 | TEST-011 | TASK-001, TASK-002 |
| TASK-012 | FE Lead | Folder UI | PC-001 | FR-001, FR-014, BR-016 | TEST-012 | TASK-004, TASK-011 |
| TASK-013 | FE Lead | Vocabulary and IPA UI | PC-001, PC-004 | FR-002, FR-004, FR-014, BR-001–BR-003, BR-016–BR-018, BR-021 | TEST-013 | TASK-005, TASK-011, TASK-012 |
| TASK-014 | FE Lead | CSV import UI | PC-001, PC-003 | FR-003, FR-014, BR-019–BR-020 | TEST-014 | TASK-006, TASK-013 |
| TASK-015 | FE Lead | Browser pronunciation adapter/UI | PC-004 | FR-005, FR-014, BR-007, BR-022 | TEST-015 | TASK-013 |
| TASK-016 | FE Lead | Flashcard experience | PC-005 | FR-006, FR-014, BR-008, BR-023 | TEST-016 | TASK-013 |
| TASK-017 | FE Lead | Multiple-choice and results UI | PC-006 | FR-007–FR-011, FR-014, BR-009–BR-010, BR-024–BR-025 | TEST-017 | TASK-007, TASK-008, TASK-011 |
| TASK-018 | FE Lead | Dashboard UI | PC-008 | FR-012–FR-014, BR-011, BR-025–BR-026 | TEST-018 | TASK-009, TASK-011 |
| TASK-019 | FE Lead | Optional AI UI | PC-009 | FR-015–FR-016, FR-014, BR-012–BR-013, BR-027–BR-028 | TEST-019 | TASK-010, TASK-013 |
| TASK-020 | BE Lead/QA | Backend integration and coverage gate | PC-012 | NFR-005–NFR-010, NFR-014–NFR-017 | TEST-020 | TASK-003–TASK-010 |
| TASK-021 | FE Lead/QA | Frontend integration, accessibility, responsive, and coverage gate | PC-011, PC-012 | NFR-001–NFR-004, NFR-009–NFR-013 | TEST-021 | TASK-011–TASK-019 |
| TASK-022 | Technical Leads | Operational documentation and implementation evidence | PC-010, PC-012 | NFR-009–NFR-010, NFR-016–NFR-017 | TEST-022 | TASK-020, TASK-021 |

## Backend and foundation tasks

### TASK-001 — Workspace and quality foundation

**Planned paths:** root workspace manifests/configuration, `apps/web`, `apps/api`, `packages/contracts`; no feature implementation.
**Deliverables:** npm workspaces, strict TypeScript, separate Vitest configurations/scripts, lint/format/typecheck scripts, separate coverage output directories and 95% thresholds.
**Verification:** clean install, workspace typecheck, empty/smoke suites, and proof that each application’s coverage command fails independently below threshold.
**Done when:** foundation commands are deterministic and frontend/backend coverage cannot be combined. `TEST-001` covers workspace scripts and threshold configuration.

### TASK-002 — Shared contracts, configuration, and error foundation

**Planned paths:** `packages/contracts/src`, `apps/api/src/config`, `apps/api/src/http`, frontend API client boundary.
**Deliverables:** shared request/response Zod schemas, environment parsing, request IDs, safe error envelope/middleware, size/CORS/security-header configuration.
**Verification:** valid/invalid environment, unknown fields, safe 4xx/5xx payloads, no raw internal details. `TEST-002` covers AC-010, AC-023, and ADR-002.

### TASK-003 — Prisma schema and initial migration

**Planned paths:** `apps/api/prisma/schema.prisma`, generated initial migration, repository integration-test utilities.
**Deliverables:** Folder, Vocabulary, TestSession, TestAnswer; foreign keys/indexes; `completionKeyHash` on TestSession; migration-only schema creation.
**Database explanation:** SQLite data lives in ignored `apps/api/prisma/dev.db`; schema/migrations are committed; the migration creates the approved four tables/constraints; safe inspection uses the approved Prisma Studio script on the local database.
**Verification:** apply migration to a fresh temporary database; inspect constraints/relations; prove same-folder uniqueness, replay key uniqueness, and atomic rollback. `TEST-003` covers AC-009, AC-025, and ADR-003/ADR-005.

### TASK-004 — Folder backend

**Planned paths:** API folder schemas, service, repository port/Prisma adapter, routes, tests.
**Deliverables:** `GET /folders`, `POST /folders`, `GET /folders/:folderId`; normalization and safe duplicate/not-found errors.
**Verification:** boundaries 0/1/50/51, whitespace, case-insensitive duplicates, empty list, repository failure mapping. `TEST-004` covers AC-001 and AC-010.

### TASK-005 — Vocabulary backend

**Planned paths:** vocabulary schemas, service, repository, routes, tests.
**Deliverables:** list/create endpoints, trim/limits, optional IPA as null, same-folder normalized duplicate rule, cross-folder allowance.
**Verification:** field boundaries, Unicode, IPA null/limit, duplicates, missing folder, persistence/reload. `TEST-005` covers AC-002, AC-004, AC-009, AC-023.

### TASK-006 — CSV import backend

**Planned paths:** import parser/validator/classifier/service/route and fixtures/tests.
**Deliverables:** 1 MiB multipart guard, BOM/header validation, quoted CSV parsing, row Zod validation, partial transaction, truthful row report.
**Verification:** empty/header-only, header order, missing/unknown/duplicate headers, quoted comma, mixed rows, within-file/database duplicates, rollback/failure. `TEST-006` covers AC-003, AC-010, AC-025.

### TASK-007 — Test generation and signed token

**Planned paths:** test eligibility/question generator, RNG/clock/signer ports, HMAC adapter, start route, tests.
**Deliverables:** one randomized question per eligible word, four distinct meanings, expiring signed snapshot, safe ineligible state.
**Verification:** 0/3/4 words, repeated meanings, deterministic RNG, option/question invariants, tampered/expired token. `TEST-007` covers AC-007 and AC-023.

### TASK-008 — Completed-session persistence and retrieval

**Planned paths:** scoring/completion service, session repository, completion/retrieval routes, tests.
**Deliverables:** verify issued choices/full coverage, backend scoring, atomic session/answers, replay prevention, completed result retrieval; no draft persistence.
**Verification:** all correct/wrong, missing/duplicate answer, invalid choice, stale snapshot, replay, transaction failure, invariants. `TEST-008` covers AC-008, AC-009, AC-023, AC-025.

### TASK-009 — Dashboard aggregation backend

**Planned paths:** dashboard repository/service/route and tests.
**Deliverables:** folder, vocabulary, completed-session, correct/incorrect totals and one-decimal/zero accuracy.
**Verification:** no data, incomplete data absent by design, multiple sessions, rounding, no double count. `TEST-009` covers AC-009 and AC-010.

### TASK-010 — Optional AI backend boundary

**Planned paths:** AI schemas/service/port, disabled adapter/provider adapter, route, tests.
**Deliverables:** validate 1–10 unique IDs, load selected words only, timeout, safe disabled/provider errors, no persistence.
**Verification:** 0/1/10/11 selections, duplicates/missing vocabulary, disabled/timeout/failure/success, unchanged core data. `TEST-010` covers AC-011, AC-012, AC-025, ADR-006.

## Frontend tasks

### TASK-011 — Web shell and accessible UI system

**Planned paths:** web app/router/layout, shared components/styles, API state primitives, test setup.
**Deliverables:** self-designed responsive navigation/layout, semantic controls, visible focus, live regions, reusable loading/empty/error states.
**Verification:** keyboard navigation, accessible names/status, error focus, 320-pixel layout, AA color tokens. `TEST-011` covers AC-010 and AC-022.

### TASK-012 — Folder UI

**Deliverables:** folder list/create flow with loading, empty, success, validation, duplicate and retry states.
**Verification:** accessible form/list behaviors and API response/error handling. `TEST-012` covers AC-001, AC-010, AC-022.

### TASK-013 — Vocabulary and IPA UI

**Deliverables:** folder detail/list/create form, word/meaning/IPA display, `IPA unavailable`, responsive states.
**Verification:** field boundaries, duplicate/missing-folder errors, IPA/null rendering, reload result. `TEST-013` covers AC-002, AC-004, AC-010, AC-022.

### TASK-014 — CSV import UI

**Deliverables:** file selection/upload and accessible imported/skipped row report with corrective guidance.
**Verification:** pending lock, header/file error, zero/mixed/success reports, retry, row-number rendering. `TEST-014` covers AC-003, AC-010, AC-022.

### TASK-015 — Browser pronunciation adapter and UI

**Deliverables:** injectable SpeechPort, capability detection, pronounce action and accessible unsupported/failure state.
**Verification:** supported/unsupported/throwing speech adapter and proof no data mutation. `TEST-015` covers AC-005, AC-010, AC-025.

### TASK-016 — Flashcard experience

**Deliverables:** randomized start/restart, word/IPA front, meaning back, reveal/navigation, empty state; no API mutation.
**Verification:** deterministic injected shuffle, reveal/navigation/restart, missing IPA, no answer persistence. `TEST-016` covers AC-006, AC-010, AC-022.

### TASK-017 — Multiple-choice and results UI

**Deliverables:** start/ineligible/expired flows, one-submit-per-question, progress, completion, per-answer and summary results.
**Verification:** four choices, keyboard selection, duplicate-submit prevention, all results, API conflicts/retry, no abandoned-session call. `TEST-017` covers AC-007–AC-010, AC-022.

### TASK-018 — Dashboard UI

**Deliverables:** six approved metrics, one-decimal/zero accuracy, loading/empty/error/retry states.
**Verification:** representative values, zero state, responsive accessible presentation. `TEST-018` covers AC-009, AC-010, AC-022.

### TASK-019 — Optional AI UI

**Deliverables:** accessible unique selection of 1–10 words, generate/retry, identified display-only result, disabled/failure states.
**Verification:** 0/1/10/11, duplicates, success/timeout/disabled, no core-flow regression or persistence. `TEST-019` covers AC-011, AC-012, AC-022, AC-025.

## Quality and handoff tasks

### TASK-020 — Backend integration and coverage gate

Run all backend unit, HTTP, CSV, signature, repository/migration, transaction, security, and failure-path tests. Close legitimate gaps without excluding business logic. The independent backend report must reach at least 95% statements, 95% branches, 95% functions, and 95% lines. `TEST-020` covers AC-017–AC-021, AC-023–AC-025.

### TASK-021 — Frontend integration, accessibility, responsive, and coverage gate

Run all frontend unit/integration tests plus keyboard, accessible-state, speech, error, and responsive checks. Close legitimate gaps without excluding business logic. The independent frontend report must reach at least 95% statements, 95% branches, 95% functions, and 95% lines. `TEST-021` covers AC-013–AC-016, AC-021–AC-022, AC-025.

### TASK-022 — Operational documentation and implementation evidence

Document setup, environment variables, migration/app startup, safe database inspection, separate tests/coverage, limitations, and exact evidence. Update implementation report, status, dashboard, and traceability without claiming unrun results. `TEST-022` verifies documented commands/paths against the implemented repository and covers ADR-001–ADR-006.

## Requirement-to-task coverage

| Requirement group | Tasks |
|---|---|
| FR-001 | TASK-004, TASK-012 |
| FR-002, FR-004 | TASK-005, TASK-013 |
| FR-003 | TASK-006, TASK-014 |
| FR-005 | TASK-015 |
| FR-006 | TASK-016 |
| FR-007–FR-011 | TASK-007, TASK-008, TASK-017 |
| FR-012–FR-013 | TASK-003, TASK-005, TASK-008, TASK-009, TASK-018 |
| FR-014 | TASK-002, TASK-004–TASK-019 |
| FR-015–FR-016 | TASK-010, TASK-019 |
| NFR-001–NFR-004 | TASK-001, TASK-021 |
| NFR-005–NFR-008 | TASK-001, TASK-020 |
| NFR-009–NFR-010 | TASK-001, TASK-020–TASK-022 |
| NFR-011–NFR-013 | TASK-011–TASK-019, TASK-021 |
| NFR-014–NFR-017 | TASK-002–TASK-010, TASK-020, TASK-022 |

## Approval boundary

All tasks are `NOT STARTED`. No task, dependency installation, schema generation, migration, database creation, test execution, or source-code generation is authorized until Task Verification is `PASS` and the user explicitly approves Task Decomposition.
