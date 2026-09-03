# Code Generation Implementation Report

## Real AI Story Generator enhancement — 2026-09-03

STAGE: Real AI Story Generator

STATUS: PASS — implementation, automated verification, security, real Gemini integration/story evidence, and browser flow pass. Final browser acceptance is PASS WITH EXTERNAL AVAILABILITY NOTE under the user-approved training-project policy.

FILES_CREATED: `apps/api/src/modules/ai/openai-provider.ts`, responsive AI browser screenshots.

FILES_MODIFIED: `.env.example`, `package.json`, `package-lock.json`, AI environment/service/router/composition code, `AiPanel.tsx`, `App.tsx`, `styles.css`, AI tests, integrated browser harness, specification, architecture, and current SDD tracking.

IMPLEMENTATION: The frontend sends the active folder ID and 1–10 selected vocabulary IDs. The backend reloads their real word/meaning values within that folder. `AiService` owns validation, timeout, normalized output, selected-word verification, and one controlled missing-word retry. `GeminiProvider`, selected only by `AI_PROVIDER=gemini`, owns the OpenAI-compatible call and the bounded primary/retry/fallback/retry sequence for transient HTTP 503 or retryable network failures. It never falls back for authentication, validation, configuration, or malformed-response failures. `LocalAiProvider` remains explicit and is never a hidden real-provider fallback. The UI safely highlights text with React nodes and never renders provider HTML.

DATABASE: Vocabulary remains in `apps/api/prisma/dev.db` through the existing Prisma model. Stories are not stored, and no schema or migration changed. In plain terms, generation reads saved words and returns temporary text only.

NEXT_ALLOWED_ACTION: Handoff / normal maintenance. A future live Gemini rerun is optional availability confirmation, not a release gate.

USER_APPROVAL_REQUIRED: None for implementation. The backend credential must remain only in the ignored local `.env` and must not appear in SDD evidence.

## Focus-mode back-navigation refinement — 2026-09-03

STAGE: UI refinement

STATUS: PASS

FILES_MODIFIED: `apps/web/src/App.tsx`, `apps/web/src/styles.css`.

VERIFICATION_RESULTS: Flashcards and Multiple Choice now reuse the same visual classes, arrow treatment, dimensions, colors, and interaction states as the Vocabulary/Folder Back to Folder control. Existing folder navigation behavior is unchanged. Focused frontend tests, typecheck, lint, formatting, build, and whitespace validation passed.

NEXT_ALLOWED_ACTION: Final Acceptance.

USER_APPROVAL_REQUIRED: Yes, for Final Acceptance.

## Flashcards and Multiple Choice visual redesign — 2026-09-03

STAGE: UI refinement

STATUS: PASS

FILES_MODIFIED: `apps/web/src/Flashcards.tsx`, `apps/web/src/TestSession.tsx`, `apps/web/src/styles.css`, `apps/web/test/flashcards.test.tsx`.

VERIFICATION_RESULTS: Flashcards and Multiple Choice now share a focused learning-session visual system while retaining their existing navigation, pronunciation, rating, answer, score, and persistence behavior. The fake flashcard score, scheduling intervals, and generated context claim were removed. The real-browser learning workflow passed at representative desktop, tablet, and mobile viewports with zero browser errors.

NEXT_ALLOWED_ACTION: Final Acceptance.

USER_APPROVAL_REQUIRED: Yes, for Final Acceptance.

## Folder Detail layout and action redesign — 2026-09-01

STAGE: Folder Detail Layout + Action Redesign

STATUS: PASS

FILES_CREATED: `apps/web/test/setup.ts`, `docs/sdd/evidence/browser-folder-detail-desktop.png`, `docs/sdd/evidence/browser-folder-detail-tablet.png`, `docs/sdd/evidence/browser-folder-detail-mobile.png`.

FILES_MODIFIED: `apps/web/src/App.tsx`, `apps/web/src/VocabularyPanel.tsx`, `apps/web/src/CsvImportPanel.tsx`, `apps/web/src/styles.css`, `apps/web/test/app.test.tsx`, `apps/web/vitest.config.ts`, `scripts/browser-acceptance.mjs`, responsive browser evidence, and current SDD governance reports.

VERIFICATION_COMMANDS: focused and complete frontend Vitest commands; `npm.cmd run coverage:web`; `npm.cmd run typecheck`; `npm.cmd run lint`; `npm.cmd run format:check`; `npm.cmd run build`; `git diff --check`; `npm.cmd run browser:acceptance` against the running application.

VERIFICATION_RESULTS: 16 frontend files and 61/61 tests pass. Frontend coverage is 99.83% statements, 95.11% branches, 96.40% functions, and 99.83% lines. Typecheck, lint, formatting, production build, and diff checks pass. The complete persisted Chrome journey passes at 1440px, 768px, and 390px with no document overflow and zero browser errors.

EVIDENCE: EVID-530–EVID-535 and the three folder-detail screenshots.

OPEN_QUESTIONS: None.

NEXT_ALLOWED_ACTION: Handoff / normal maintenance.

USER_APPROVAL_REQUIRED: No.

### Scoped presentation changes

- The compact 44px back control always reads `← Back to Folders`; the dynamic folder name is rendered only as the hero heading. The generated long-name case wraps naturally at 390px without clipping or overflow.
- A soft folder hero groups the real folder icon, name, and live vocabulary count.
- Flashcards and Multiple Choice are emphasized learning-mode cards; AI Generator is a visually secondary card in the same study group. Their existing callbacks and learning logic are unchanged.
- The Vocabulary toolbar groups Add Vocabulary and Import CSV. These controls focus the existing manual-add and CSV inputs; the original forms, validation, persistence, loading, error/retry, and report behavior remain.
- Vocabulary entries use responsive study cards with word, IPA fallback, meaning, and pronunciation controls. Desktop uses a list-plus-editor layout; tablet and mobile stack without overlap.
- A test-only Vitest setup restores deterministic browser-like storage under Node 26, whose experimental global storage shadows jsdom. Production authentication and storage code are unchanged.

### Database explanation

This is a presentation-only frontend maintenance change. Folder and vocabulary data still live in the ignored local SQLite file at `apps/api/prisma/dev.db`; for example, adding `hello` still creates the same vocabulary record linked to the open folder through the existing REST API. No Prisma schema, migration, database query, API contract, or persistence rule changed. Inspect data safely with Prisma Studio or the existing API rather than editing the `.db` file manually. The technical term is **no schema migration**.

## Left Navigation visual redesign — 2026-09-01

STAGE: Left Navigation Visual Redesign

STATUS: PASS

FILES_CREATED: `docs/sdd/evidence/browser-sidebar-tablet.png`, `docs/sdd/evidence/browser-sidebar-mobile.png`.

FILES_MODIFIED: `apps/web/src/App.tsx`, `apps/web/src/styles.css`, `apps/web/test/app.test.tsx`, `scripts/browser-acceptance.mjs`, responsive browser evidence, and current SDD governance reports.

VERIFICATION_COMMANDS: sequential frontend Vitest and coverage commands with Node 26 web storage disabled; `npm.cmd run typecheck`; `npm.cmd run lint`; `npm.cmd run format:check`; `npm.cmd run build`; `git diff --check`; `npm.cmd run browser:acceptance -- http://localhost:5173`.

VERIFICATION_RESULTS: 61/61 frontend tests pass. Frontend coverage is 99.83% statements, 95.02% branches, 96.35% functions, and 99.83% lines. Static checks and the production build pass. Instrumented Chrome verification passes at 1440px, 768px, and 390px with zero browser errors and no page overflow.

EVIDENCE: EVID-525–EVID-529 and the desktop/tablet/mobile sidebar screenshots.

OPEN_QUESTIONS: None.

NEXT_ALLOWED_ACTION: Handoff / normal maintenance.

USER_APPROVAL_REQUIRED: No.

### Scoped design changes

- Primary navigation content is consistently left aligned: button x=12px, icon x=27px, and label x=64px in both the desktop sidebar and responsive drawer.
- Dashboard, Vocabulary, Practice, and Progress targets are 52px tall with 24px icon boxes, 15px semibold labels, 13px icon-label gaps, 12px corners, and 8px vertical gaps.
- The active item uses a soft primary background, primary icon/text, and a 3px left accent. `aria-current="page"` identifies active functional destinations.
- Inactive items receive a restrained primary-tinted hover background. Keyboard focus has a visible 3px outline.
- Existing Material Symbol spans and semantic names remain. Local vector masks guarantee the four navigation icons still render when the external Google font is unavailable.
- The existing desktop sidebar width, main-content position, routes, authentication, page components, CTA, Settings, Help, and Progress placeholder behavior are unchanged.

### Database explanation

This visual-only maintenance did not change the SQLite schema, migration, persistence code, or API. Application data remains in the ignored `apps/api/prisma/dev.db`; no migration is required. The technical term is **presentation-only frontend change**.

## Learning Consistency logic and UI redesign — 2026-09-01

STAGE: Learning Consistency Logic + UI Redesign

STATUS: PASS

FILES_CREATED: `apps/web/src/current-week-consistency.ts`, `apps/web/test/current-week-consistency.test.ts`.

FILES_MODIFIED: dashboard repository/service/adapter and tests; dashboard API schema; `Dashboard.tsx`; dashboard styles and tests; integrated app fixtures/assertions; browser acceptance script; responsive evidence images; SDD dashboard, status, traceability, API contract, implementation report, and verification report.

VERIFICATION_COMMANDS: focused API and web Vitest commands; `npm.cmd run coverage --workspace @english-learning/web -- --maxWorkers=1 --minWorkers=1` with `NODE_OPTIONS=--no-experimental-webstorage`; `npm.cmd run coverage:api`; `npm.cmd run typecheck`; `npm.cmd run lint`; `npm.cmd run format:check`; `npm.cmd run build`; `git diff --check`; isolated development servers on ports 3001/5174; `npm.cmd run browser:acceptance -- http://localhost:5174`.

VERIFICATION_RESULTS: 14 focused tests pass. The complete frontend and backend coverage runs pass 61/61 and 98/98 tests. Both applications independently exceed every 95% coverage threshold. Static checks and the production build pass. The persisted browser workflow and responsive checks pass at 1440px, 768px, and 390px with zero browser errors and no page overflow.

EVIDENCE: EVID-517–EVID-524 and `docs/sdd/evidence/browser-desktop.png`, `browser-tablet.png`, and `browser-mobile.png`.

OPEN_QUESTIONS: None.

NEXT_ALLOWED_ACTION: Handoff / normal maintenance.

USER_APPROVAL_REQUIRED: No.

### Logic correction

- **Old logic:** the widget showed six hard-coded bar heights and one bar derived from all-time quiz accuracy. No session date, current week, elapsed-day denominator, or future-day state was used.
- **Activity definition:** a unique local calendar day containing at least one persisted completed test session (`TestSession.completedAt`). Abandoned tests are not persisted and therefore do not count.
- **Week definition:** the user-facing local Monday-through-Sunday calendar week.
- **Active-day calculation:** completed-session timestamps are converted to local calendar keys and deduplicated, so multiple sessions on one date count once.
- **Percentage formula:** unique active elapsed days divided by elapsed days from Monday through today, multiplied by 100 and rounded to one decimal place.
- **Future-day handling:** future days are `Upcoming`, are never active or inactive, and are excluded from the denominator.
- **Today handling:** today is included in elapsed days and is labeled either `Today · Studied` or `Today · Not studied`.

### UI redesign

The fabricated continuous chart was replaced by a seven-cell activity timeline with explicit `Mon`–`Sun` labels, calendar dates, text and shape state indicators, a prominent percentage, and an explanatory active-day count. Today has a blue outline; active days use a check marker; inactive elapsed days use `No activity`; upcoming days use dashed muted styling and `Upcoming`. On mobile, the header remains fully visible and only the week strip scrolls horizontally.

### Database explanation

Plain meaning: completed quiz sessions still live in the ignored local SQLite file at `apps/api/prisma/dev.db`. The dashboard now reads their existing `completedAt` timestamps; for example, two completed quizzes on Tuesday produce one active Tuesday. The committed Prisma schema and migration did not change, so there is no migration to run. The `.db` data file remains ignored while the schema and migration remain committed. Inspect data safely with Prisma Studio or the dashboard API; do not edit rows manually. The technical terms are **read-only aggregation**, **local calendar projection**, and **unique active-day deduplication**.

## Final Acceptance remediation — 2026-08-28

STAGE: Code Generation remediation

STATUS: PASS — Final Acceptance accepted

FILES_CREATED: `.prettierrc.json`, `scripts/browser-acceptance.mjs`, `scripts/tsx-windows-shim.mjs`, `docs/sdd/evidence/browser-desktop.png`

FILES_MODIFIED: frontend dashboard, flashcards, vocabulary UI and tests; frontend coverage configuration; API/root scripts; lint/format configuration; SDD governance reports.

VERIFICATION_COMMANDS: `npm.cmd run setup`; `npm.cmd run coverage:web`; `npm.cmd run coverage:api`; `npm.cmd test`; `npm.cmd run typecheck`; `npm.cmd run lint`; `npm.cmd run format:check`; `npm.cmd run build`; `npm.cmd ls --all`; `git diff --check`; runtime `npm.cmd run dev`; attempted `npm.cmd run browser:acceptance -- http://localhost:5175`; attempted `npm.cmd audit --audit-level=low`.

VERIFICATION_RESULTS: implementation and automated quality commands pass when migration-heavy backend suites run sequentially. Folder Detail browser verification passes at 1440px, 768px, and 390px with zero browser errors.

EVIDENCE: EVID-503–EVID-513.

OPEN_QUESTIONS: None for the completed redesign scope.

NEXT_ALLOWED_ACTION: Handoff

USER_APPROVAL_REQUIRED: No

### Implemented remediation

- Added meaningful integrated frontend tests for navigation, folder/vocabulary, CSV, AI, flashcards, quiz/results, dashboard actions, and safe error branches.
- Excluded only `src/main.tsx`, the browser mount entry point with no product logic, from frontend unit coverage; `App` and feature behavior remain measured.
- Fixed a React cross-component update caused by invoking `onChanged` inside a child state updater.
- Rendered the approved pronunciation abstraction in real vocabulary and flashcard screens.
- Added flashcard progress, Previous, Next, Shuffle, and Restart controls.
- Grouped dashboard metric labels with their values after screenshot inspection found an ambiguous layout.
- Added a Node 26 Windows preload shim so `tsx` no longer fails in `os.userInfo()` before the API loads.
- Added a reusable Chrome DevTools Protocol acceptance script without adding a dependency.

### Database explanation

Plain meaning: no database structure changed. Existing folders, words, and completed quizzes continue to live in the local SQLite file at `apps/api/prisma/dev.db`. Example: adding `hello` still creates a vocabulary row linked to its folder. The committed schema and migration were not edited, and the local `.db` file remains ignored. Verify safely with `npm.cmd run db:studio --workspace @english-learning/api` after setup, or inspect the documented API; do not edit rows manually. The technical term is **no schema migration**.

## Integrated UI/UX redesign — 2026-08-27

The redesigned React shell makes the approved dashboard, library, folder detail, manual vocabulary, CSV import, flashcards, quiz/results, and optional AI panels reachable through one responsive navigation flow. It uses the existing REST API and migrated SQLite schema; no backend contract or schema changed.

Database note: development data is stored in the ignored `apps/api/prisma/dev.db` SQLite file. The existing migration creates the tables; it does not invent sample data. Stop the API and use Prisma Studio to inspect it safely. No raw database edits were made.

The implementation review is **FAIL** pending frontend coverage remediation and real-browser viewport/workflow verification. Existing TASK-011–TASK-021 identifiers cover this maintenance scope; no historical task evidence was rewritten.

| Evidence ID | Result                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EVID-493    | Dependency installation completed; audit reported zero vulnerabilities.                                                                                                                                                                                            |
| EVID-494    | Existing Prisma client generated and existing migration applied to the ignored local SQLite database.                                                                                                                                                              |
| EVID-495    | Frontend regression passed: 11 files, 28 tests.                                                                                                                                                                                                                    |
| EVID-496    | Backend coverage passed: 95.01% statements, 95.00% branches, 97.22% functions, 95.01% lines.                                                                                                                                                                       |
| EVID-497    | Frontend coverage failed: 97.41% statements, 89.71% branches, 65.21% functions, 97.41% lines.                                                                                                                                                                      |
| EVID-498    | Lint, typecheck, production build, and `git diff --check` passed.                                                                                                                                                                                                  |
| EVID-499    | Runtime HTTP verification passed: folder, four vocabulary items, four-question quiz, persisted 4/4 result, and dashboard update.                                                                                                                                   |
| EVID-500    | Real-browser interaction, pronunciation playback, console inspection, and viewport checks were NOT RUN because no browser tool was available.                                                                                                                      |
| EVID-501    | Repository-wide `format:check` failed on 86 baseline files; changed frontend files were formatted directly.                                                                                                                                                        |
| EVID-502    | Replaced the POSIX-only setup command with `scripts/setup.mjs`; Windows setup, migration, lint, typecheck, diff check, and a clean development-server start on ports 3000/5173 passed. Six verified stale project Node processes were stopped before verification. |

## Project-level review summary

Implementation is complete and has been reviewed and verified against the approved SDD artifacts. Review/Verification: **PASS**. Final Acceptance: **ACCEPTED**. All 22 tasks are PASS; no unresolved Critical or Major findings remain. Handoff: **READY**.

| Field                | Value                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Stage                | Code Generation                                                  |
| Current task         | TASK-022 — Operational documentation and implementation evidence |
| Verified tasks       | TASK-001–TASK-022                                                |
| Overall stage status | COMPLETE                                                         |
| Owner                | Frontend and Backend Leads                                       |
| Last updated         | 2026-08-27                                                       |
| Current requirements | FR-003, FR-014, BR-004–BR-006, BR-017, BR-019–BR-020             |
| Current component    | PC-002                                                           |
| Current test         | Final project verification suite                                 |

## Outcome

TASK-001 establishes the approved npm workspace and strict TypeScript quality foundation. Frontend and backend tests and coverage remain independently configured. No product feature, database schema, migration, REST endpoint, or TASK-002 work was introduced.

TASK-001 through TASK-022 pass their task-specific verification. The complete Implementation stage is complete: 22 of 22 tasks are implemented.

## TASK-010 verification

**Status:** PASS. Optional AI backend validates 1–10 unique IDs, loads selected vocabulary, supports provider success/timeout/failure and disabled-safe errors without persistence. TEST-010 passed 3/3. Full API coverage passed at 95.00% statements, 95.05% branches, 95.94% functions, and 95.00% lines. Typecheck, lint, formatting, and security checks passed.

## TASK-011 verification

**Status:** PASS. Added accessible responsive web shell, skip link, semantic navigation, live status, and browser entry point. TEST-011 passed 6/6; frontend coverage is 100% across statements, branches, functions, and lines. Typecheck, lint, formatting, and diff checks passed.

## TASK-009 verification

**Status:** PASS. Dashboard totals and one-decimal accuracy are implemented with zero-safe behavior. TEST-009 focused tests passed 2/2; full regression passed 92 backend and 4 frontend tests. API coverage: 95.54% statements, 95.45% branches, 97.14% functions, 95.54% lines. Web coverage remained 100% across all metrics. Typecheck, lint, formatting, audit, and diff checks passed.

## TASK-022 final handoff

All implementation tasks TASK-001 through TASK-022 are complete and verified. Final project regression passed; independent backend and frontend coverage remained above the required 95% thresholds. Operational setup, environment, migration, testing, coverage, security, and evidence records are maintained in the approved SDD artifacts.

## TASK-008 pre-implementation gate

**Status:** PASS

TEST-008-01 through TEST-008-11 pass against the completed-session persistence and retrieval implementation. Backend coverage is 97.78% statements, 95.33% branches, 98.43% functions, and 97.78% lines; frontend coverage remains 100% for every metric.

### TASK-008 implementation evidence

- `apps/api/src/modules/tests/session-service.ts` validates snapshots, scores answers server-side, prevents replay by completion hash, and maps public errors.
- `apps/api/src/modules/tests/session-repository.ts` persists sessions and answers atomically and retrieves ordered answers.
- `apps/api/src/modules/tests/session-router.ts` exposes completion and retrieval endpoints.
- `apps/api/test/session.test.ts` covers completion, invalid/stale/expired/replay/error paths, adapter persistence, and route behavior.

## Pre-implementation checks

- Repository governance, the SDD dashboard, approved Specification and Planning artifacts, TASK-001, and TEST-001 were reviewed.
- TASK-001 has no task dependency; its Specification, Planning, and Task gates were approved before implementation.
- Existing unrelated SDD changes were identified and preserved.
- Scope was limited to root tooling, workspace manifests, strict TypeScript configurations, independent frontend/backend Vitest configurations, and minimal foundation smoke modules/tests.

## Files created

- `package.json`
- `package-lock.json`
- `tsconfig.base.json`
- `eslint.config.mjs`
- `.prettierignore`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `apps/web/vitest.config.ts`
- `apps/web/src/foundation.ts`
- `apps/web/test/foundation.test.ts`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/vitest.config.ts`
- `apps/api/src/foundation.ts`
- `apps/api/test/foundation.test.ts`
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/src/index.ts`

## Files modified

- `docs/sdd/04-implementation/implementation-report.md`
- `docs/sdd/04-implementation/verification.md`
- `docs/sdd/index.md`
- `docs/sdd/status.md`
- `docs/sdd/traceability.md`

## Implementation summary

- Added npm workspaces for the web application, API, and shared contracts.
- Added strict shared and workspace TypeScript configurations.
- Added ESLint and Prettier commands scoped to TASK-001 source and configuration files.
- Added independent web and API Vitest configurations, coverage output directories, and 95% thresholds for statements, branches, functions, and lines.
- Aligned Vite on version `6.4.3` across the frontend toolchain, resolving the earlier duplicate-version type mismatch.
- Added a narrow `test-exclude`/`minimatch` override so the supported Node 18 environment does not receive a Node 20-only transitive package.
- Added minimal typed foundation modules and TEST-001 smoke tests. They prove the toolchain; they do not claim feature behavior or application-wide final coverage.

## Tests added

- `apps/web/test/foundation.test.ts`: verifies the web workspace foundation identity.
- `apps/api/test/foundation.test.ts`: verifies the API workspace foundation identity.

## Security and dependency disposition

The first audit identified 12 vulnerabilities. Dependencies were moved to patched, Node-18-compatible release lines and `npm audit fix` updated the vulnerable transitive routing package. The final audit reports zero vulnerabilities at every severity. `npm ci` emitted deprecation notices for transitive tooling packages; these are maintenance warnings, not audit findings, and should be revisited during routine dependency maintenance.

## Evidence

| Evidence ID | Result                                                           |
| ----------- | ---------------------------------------------------------------- |
| EVID-401    | Clean dependency installation and lockfile validation passed.    |
| EVID-402    | Workspace typecheck passed.                                      |
| EVID-403    | Lint and formatting checks passed.                               |
| EVID-404    | TEST-001 passed in both workspaces.                              |
| EVID-405    | Frontend foundation coverage reported 100% for all four metrics. |
| EVID-406    | Backend foundation coverage reported 100% for all four metrics.  |
| EVID-407    | Frontend 101% line-threshold probe failed as expected.           |
| EVID-408    | Backend 101% line-threshold probe failed as expected.            |
| EVID-409    | Final security audit reported zero vulnerabilities.              |
| EVID-410    | Final `git diff --check` passed.                                 |

## Risks and limitations

- Coverage is valid for the TASK-001 foundation modules only. Final product coverage is not yet measurable and must be reassessed as feature code is added.
- A production build is not applicable because the application entry points belong to later approved tasks.
- TASK-002 through TASK-022 are not started.

## Next allowed action

Clarification of the missing complete TEST-006 definition; no implementation may begin until the blocker is resolved.

## TASK-002 implementation

### Dependency and boundary evidence

- The user explicitly approved TASK-001 and authorized TASK-002 on 2026-08-27.
- TASK-001, the only dependency, is `PASS` with EVID-401–EVID-410.
- Existing unrelated working-tree changes were inspected and preserved.
- The boundary excludes feature endpoints, persistence, Prisma, migrations, database files, and TASK-003 work.

### Files created

- `packages/contracts/src/http.ts`
- `apps/api/src/config/environment.ts`
- `apps/api/src/http/app.ts`
- `apps/api/src/http/error-handler.ts`
- `apps/api/src/http/errors.ts`
- `apps/api/src/http/request-id.ts`
- `apps/api/test/contracts.test.ts`
- `apps/api/test/environment.test.ts`
- `apps/api/test/http.test.ts`
- `apps/web/src/api/client.ts`
- `apps/web/test/api-client.test.ts`

### Files modified

- `.env.example`
- `package-lock.json`
- `apps/api/package.json`
- `packages/contracts/src/index.ts`
- The five synchronized SDD implementation/governance documents.

### Delivered behavior

- Strict shared Zod schemas for success and error transport envelopes; unknown response fields are rejected.
- Zod startup configuration for database URL, port, exact web origin, test-token secret, and optional AI settings. AI credentials are required only when AI is enabled.
- A thin typed frontend API client that parses successful and failed JSON responses through shared schemas.
- Express composition with a 1 MiB JSON limit, exact-origin CORS, Helmet security headers, disabled framework disclosure, and safe request correlation IDs.
- Safe mappings for known HTTP errors, validation failures, oversized bodies, missing routes, and unexpected failures. Raw exception values are not returned.

### TEST-002 coverage

- Valid, defaulted, optional, and invalid environment values.
- Strict request/response envelope behavior and unknown-field rejection.
- Security/CORS/request-ID headers and safe 400, 404, 409, 413, and 500 payloads.
- Frontend success parsing, typed safe errors, URL validation, and malformed-response rejection.

### TASK-002 evidence

| Evidence ID | Result                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| EVID-411    | Dependency and lockfile update passed; final audit reports zero vulnerabilities. |
| EVID-412    | TEST-002 passed: 16 focused backend tests and 3 focused frontend tests.          |
| EVID-413    | Complete affected test suite passed: 17 backend and 4 frontend tests.            |
| EVID-414    | Workspace typecheck passed.                                                      |
| EVID-415    | Lint and final formatting checks passed.                                         |
| EVID-416    | Backend coverage passed at 100% for all four metrics.                            |
| EVID-417    | Frontend coverage passed at 100% for all four metrics.                           |
| EVID-418    | Final `git diff --check` passed.                                                 |

### Limitations

- Configuration is parsed and composable, but process startup belongs to a later API task.
- The frontend client is a transport boundary only; feature calls and UI states belong to TASK-011 and later tasks.
- At the TASK-002 checkpoint, coverage applied only to TASK-001/TASK-002 modules; current TASK-003 evidence is recorded below.

## TASK-003 implementation

### Dependency and scope evidence

- The user explicitly approved TASK-002 and authorized TASK-003 on 2026-08-27.
- TASK-001 and TASK-002, the only dependencies, are `PASS` and user-approved.
- FR-013, BR-003, BR-010, BR-017, BR-018, BR-025, AC-009, and AC-025 exist in the approved Specification.
- Existing unrelated working-tree changes were inspected and preserved.
- No repository implementation, service, route, seed dataset, feature validation, or TASK-004 file was created.

### Files created

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/migration_lock.toml`
- `apps/api/prisma/migrations/20260827014118_initial_schema/migration.sql`
- `apps/api/test/support/database.ts`
- `apps/api/test/database.test.ts`

### Files modified

- `apps/api/package.json`
- `package-lock.json`
- The five synchronized SDD implementation/governance documents.

### Database explanation

The application’s local learning data will be stored in `apps/api/prisma/dev.db`. Think of this file as one small filing cabinet: its four tables hold folders, vocabulary, completed test sessions, and answer snapshots. The file is ignored by Git because it contains local runtime data.

`apps/api/prisma/schema.prisma` is the committed description of those tables and relationships. The generated migration in `apps/api/prisma/migrations/20260827014118_initial_schema/migration.sql` is the committed, replayable instruction sheet that creates them. This process is called a **Prisma migration**.

The migration creates:

- `Folder`, with a unique normalized name.
- `Vocabulary`, belonging to exactly one folder and unique by normalized word within that folder.
- `TestSession`, representing completed sessions only and protecting completion replay with a unique `completionKeyHash`.
- `TestAnswer`, belonging to one session and vocabulary item, with historical question/meaning snapshots.
- Restrictive folder/vocabulary history, controlled cascading from a deleted test session to its answers, and the approved lookup indexes.

The migration was verified by applying it to fresh disposable databases and then exercising the constraints through Prisma. Temporary databases are deleted after each test. A developer may safely inspect a local development database with `npm run db:studio --workspace @english-learning/api` after confirming `DATABASE_URL`; Studio should not be used to make undocumented schema changes.

### TEST-003 coverage

- Fresh migration replay creates all four model tables.
- Same-folder normalized vocabulary duplicates fail while the same word in another folder succeeds.
- Duplicate `completionKeyHash` values fail, preventing completed-session replay.
- Folder deletion is restrictive when history exists; controlled session deletion cascades only to its answers.
- A transaction that cannot insert every answer rolls back both the session and all answers.

### TASK-003 evidence

| Evidence ID | Result                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| EVID-419    | Approved identifiers, dependencies, file boundary, and dirty worktree were verified.     |
| EVID-420    | Prisma schema validates and the generated migration SQL matches the approved data model. |
| EVID-421    | Fresh migration deployment and migration-status verification passed.                     |
| EVID-422    | TEST-003 passed: 5 database integration tests.                                           |
| EVID-423    | Full regressions passed: 22 backend and 4 frontend tests.                                |
| EVID-424    | Typecheck, lint, and formatting checks passed.                                           |
| EVID-425    | Backend coverage passed at 100% for all four measured source metrics.                    |
| EVID-426    | Frontend coverage passed at 100% for all four measured source metrics.                   |
| EVID-427    | Prisma 6.12.0 dependency validation and final audit passed with zero vulnerabilities.    |
| EVID-428    | Final `git diff --check`, no-database-file, scope, and synchronization checks passed.    |

### Risks and limitations

- BR-010 count equality is an approved application-service invariant, not a database check in the approved data model. TASK-008 must enforce it before the atomic transaction.
- Prisma schema/configuration and generated client code are not counted as authored runtime source coverage. TEST-003 verifies them through real migration and constraint behavior instead.
- In this restricted execution environment, the Prisma schema engine requires an empty SQLite file to exist before migration. The test utility creates that disposable file and then uses the real committed migration; it does not create schema manually.
- Prisma 6.19.3 was rejected after its CLI dependency produced three high-severity audit findings. Final Prisma CLI and client versions are aligned at audit-clean, Node-18-compatible `6.12.0`.
- At the TASK-003 checkpoint, TASK-004 through TASK-022 were not started; current TASK-004 evidence is recorded below.

## TASK-004 implementation

### Dependency and scope evidence

- The user explicitly approved TASK-003 and authorized TASK-004 on 2026-08-27.
- TASK-003, the only dependency, is `PASS` and user-approved.
- FR-001, FR-014, BR-003, BR-016, AC-001, and AC-010 exist in the approved Specification.
- Existing unrelated working-tree changes were inspected and preserved.
- No vocabulary endpoint, vocabulary service, CSV behavior, or TASK-005 artifact was created.

### Files created

- `packages/contracts/src/folders.ts`
- `apps/api/src/app.ts`
- `apps/api/src/modules/folders/folder-errors.ts`
- `apps/api/src/modules/folders/folder-repository.ts`
- `apps/api/src/modules/folders/folder-service.ts`
- `apps/api/src/modules/folders/prisma-folder-repository.ts`
- `apps/api/src/modules/folders/folder-router.ts`
- `apps/api/test/folders.test.ts`

### Files modified

- `packages/contracts/src/index.ts`
- The five synchronized SDD implementation/governance documents.

### Delivered behavior

- `GET /api/v1/folders` returns `{ data: { folders: [] } }` for an empty database and typed folder summaries otherwise.
- `POST /api/v1/folders` strictly accepts only `name`, trims it, enforces 1–50 characters, derives the lowercase normalized key, persists it, and returns `201`.
- Case-insensitive duplicates return safe `409 FOLDER_DUPLICATE` responses without Prisma details.
- `GET /api/v1/folders/:folderId` returns folder metadata plus an accurate vocabulary count or safe validation/not-found responses.
- The application service depends on a repository port. The Prisma adapter owns persistence details and translates its unique-key conflict into an application error.
- Unexpected repository failures reach the existing safe generic `500 INTERNAL_ERROR` boundary without exposing raw database information.

### TEST-004 coverage

- Empty folder list.
- Name boundaries at 0/blank, 1, 50, and 51 characters, including trimming and unknown-field rejection.
- Case-insensitive duplicate rejection.
- List/detail persistence and vocabulary count.
- Invalid and missing folder identifiers.
- Safe unexpected repository failure handling.
- Transport mapping and unexpected Prisma adapter error propagation.

### TASK-004 evidence

| Evidence ID | Result                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------- |
| EVID-429    | TASK-003 dependency, approved identifiers, file boundary, and dirty worktree were verified.  |
| EVID-430    | TEST-004 passed: 14/14 focused tests.                                                        |
| EVID-431    | Full regressions passed: 36 backend and 4 frontend tests.                                    |
| EVID-432    | Workspace typecheck passed.                                                                  |
| EVID-433    | Lint passed with zero warnings.                                                              |
| EVID-434    | Final formatting check passed.                                                               |
| EVID-435    | Backend coverage passed: 99.39% statements, 98.66% branches, 100% functions, 99.39% lines.   |
| EVID-436    | Frontend coverage passed at 100% for all four metrics.                                       |
| EVID-437    | Dependency audit passed with zero vulnerabilities.                                           |
| EVID-438    | Final `git diff --check`, no-database, TASK-005 boundary, and synchronization checks passed. |

### Risks and limitations

- The folder router is implemented as an injectable module but is not attached to a long-running process entry point; application startup belongs to a later authorized composition task.
- The repository port file contains only TypeScript types. V8 reports it as an uncovered zero-runtime file, but it remains included in the backend report; no exclusion was added to raise coverage.
- Folder deletion is not an approved endpoint.
- At the TASK-004 checkpoint, TASK-005 through TASK-022 were not started; current TASK-005 evidence is recorded below.

## TASK-005 implementation

### Dependency and scope evidence

- The user explicitly approved TASK-004 and authorized TASK-005 on 2026-08-27.
- TASK-003 and TASK-004 provide the approved migrated schema, Folder service, and application composition required by TASK-005.
- FR-002, FR-004, FR-013–FR-014, BR-001–BR-003, BR-016–BR-018, BR-021, AC-002, AC-004, AC-009, AC-010, and AC-023 exist in the approved Specification.
- Existing unrelated TASK-001–TASK-004 and SDD working-tree changes were inspected and preserved.
- CSV import, audio playback, flashcards, tests/sessions, dashboard, AI behavior, frontend vocabulary UI, and TASK-006+ behavior remain outside this task.

### Files created

- `packages/contracts/src/vocabulary.ts`
- `apps/api/src/modules/vocabulary/vocabulary-errors.ts`
- `apps/api/src/modules/vocabulary/vocabulary-repository.ts`
- `apps/api/src/modules/vocabulary/vocabulary-service.ts`
- `apps/api/src/modules/vocabulary/prisma-vocabulary-repository.ts`
- `apps/api/src/modules/vocabulary/vocabulary-router.ts`
- `apps/api/test/vocabulary.test.ts`

### Files modified

- `packages/contracts/src/index.ts`
- `apps/api/src/app.ts`
- The five synchronized SDD implementation/governance documents.

### Delivered behavior

- `GET /api/v1/folders/:folderId/vocabulary` returns the existing folder summary and its ordered vocabulary list, including an explicit empty list.
- `POST /api/v1/folders/:folderId/vocabulary` strictly validates and trims word, meaning, and optional IPA fields before persistence.
- Word length is 1–100 characters, meaning length is 1–500, and IPA is null or at most 100 characters. Blank or omitted IPA is stored and returned as `null`; no IPA is fabricated.
- The service derives a lowercase normalized word. The database-backed repository rejects a normalized duplicate in the same folder while allowing it in another folder.
- Missing folders, validation failures, duplicates, and unexpected persistence failures use safe error envelopes without raw Prisma details.
- The application service depends on repository and Folder-service boundaries; Prisma remains confined to the persistence adapter.

### Database explanation

Vocabulary rows are stored in the local SQLite file configured by `DATABASE_URL`, normally `apps/api/prisma/dev.db`. Each row points to one Folder, so a word cannot be stored under a folder that does not exist. The existing committed migration already created this relationship and the `(folderId, normalizedWord)` unique constraint; TASK-005 did not change the schema or create a migration. In plain terms, that pair acts like a folder-specific duplicate label: `Journey` and `journey` conflict inside one folder but can exist in different folders.

TEST-005 verified persistence using disposable SQLite files created from the committed migration. It also disconnected and opened a new Prisma client to prove data survives a connection reload. Local database files remain ignored and were not committed. A developer can inspect local data with Prisma Studio after confirming `DATABASE_URL`; schema changes must still be made through a documented migration, not through Studio.

### TEST-005 coverage

- Empty vocabulary list for an existing folder.
- Strict fields; trimmed and Unicode values; word, meaning, and IPA minimum/maximum boundaries.
- Omitted, explicit-null, blank, and maximum-length IPA behavior.
- Same-folder normalized duplicate rejection and cross-folder allowance.
- Missing-folder list/create responses and safe unexpected repository failure handling.
- Persistence across a newly opened Prisma client connection.
- Service/repository separation, normalization ownership, and shared request-schema behavior.

### TASK-005 evidence

| Evidence ID | Result                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| EVID-439    | TASK-004 approval, dependencies, identifiers, exact file boundary, and dirty worktree were verified. |
| EVID-440    | TEST-005 passed: 20/20 focused tests.                                                                |
| EVID-441    | Full regressions passed: 56 backend and 4 frontend tests.                                            |
| EVID-442    | Workspace typecheck passed.                                                                          |
| EVID-443    | Lint and formatting checks passed.                                                                   |
| EVID-444    | Backend coverage passed: 98.94% statements, 97.16% branches, 100% functions, 98.94% lines.           |
| EVID-445    | Frontend coverage passed at 100% for all four metrics.                                               |
| EVID-446    | Dependency graph inspection passed; optional platform packages were correctly unmet.                 |
| EVID-447    | Final security audit reported zero vulnerabilities.                                                  |
| EVID-448    | Final `git diff --check`, scope, database-file, and synchronization checks passed.                   |

### Risks and limitations

- Vocabulary edit/delete operations are not approved endpoints.
- IPA is stored and returned only; browser speech behavior belongs to TASK-015.
- CSV import and its row-level duplicate handling belong to TASK-006.
- V8 includes type-only repository-port files as zero-runtime files; no exclusion was added, and all backend metrics remain above 95%.
- At the TASK-005 checkpoint, TASK-006 through TASK-022 had not started; the current TASK-006 blocker is recorded below.

## TASK-006 pre-implementation blocker resolution

TASK-006 was historically `BLOCKED` before implementation because TEST-006 was incomplete. The blocker was resolved by formalizing the contract, after which the CSV import backend and tests were implemented. No new product behavior was introduced.

Evidence: EVID-449 records the original blocker; EVID-450 records its resolution and the READY decision.

Coverage remediation added meaningful multipart/router and Prisma repository tests. Backend coverage improved to 95.62% statements, 88.82% branches, 97.82% functions, and 95.62% lines, but the branch threshold remained unmet at that checkpoint. Evidence: EVID-461–EVID-464.

Additional targeted branch tests and a behavior-preserving parser simplification raised backend coverage to 97.78% statements, 95.62% branches, 97.82% functions, and 97.78% lines. TASK-006 now passes its independent backend coverage gate. Evidence: EVID-465–EVID-470.

## TASK-007 implementation evidence

TASK-007 implements eligibility, randomized question generation, injectable clock/RNG ports, canonical HMAC-SHA256 snapshots, opaque token creation, and the test-start route. Session completion and persistence remain deferred to TASK-008.

| Evidence ID | Result                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------- |
| EVID-471    | TASK-007 pre-implementation dependencies, scope, and approved identifiers verified.          |
| EVID-472    | TEST-007 focused suite passed: 7 tests.                                                      |
| EVID-473    | Full workspace regression passed: 81 backend and 4 frontend tests.                           |
| EVID-474    | Typecheck and lint passed.                                                                   |
| EVID-475    | Backend coverage passed: 96.79% statements, 95.00% branches, 98.24% functions, 96.79% lines. |
| EVID-476    | Frontend coverage passed: 100% for all metrics.                                              |
| EVID-477    | Formatting, dependency audit, database-artifact cleanup, and `git diff --check` passed.      |

## Post-acceptance UI/UX maintenance

The accepted application received a behavior-preserving visual refresh. The React shell now uses a responsive learning dashboard, clearer navigation and hierarchy, a focused welcome area, folder cards, improved forms, accessible focus states, and mobile layouts. Existing labels, API behavior, validation, and user flows remain unchanged.

Evidence: EVID-489–EVID-492.
