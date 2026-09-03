# SDD Project Dashboard

## Current enhancement — Real AI Story Generator — 2026-09-03

The Gemini AI Story Generator implementation and real-provider integration are **PASS**. `AI_PROVIDER=gemini` selects `GeminiProvider`; its bounded `gemini-3.6-flash` primary and `gemini-3.5-flash-lite` fallback sequence, folder-scoped vocabulary validation, required-word verification, safe normalized response, and responsive highlighted-story UI are complete. Real-provider evidence includes a real HTTP 200 response and a 152-word Gemini story containing every selected word. Under the user-approved training-project policy, final browser acceptance is **PASS WITH EXTERNAL AVAILABILITY NOTE**: the browser flow, provider selection, real request boundary, and safe failure handling pass, while the latest live provider attempt remains accurately recorded as transient HTTP 503. No application defect is known, and the implementation is frozen.

| Field               | Value                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| Current stage       | Gemini Final Acceptance                                                              |
| Gate status         | **PASS WITH EXTERNAL AVAILABILITY NOTE**                                             |
| Completed           | Implementation, integration, story evidence, browser flow, tests, coverage, security |
| External dependency | **DEGRADED / TRANSIENT** — latest Gemini request returned HTTP 503                   |
| Next allowed action | Handoff / normal maintenance                                                         |

This section supersedes older current-state summaries below while preserving their historical evidence.

Focus-mode Back to Folder alignment is **PASS** for Flashcards and Multiple Choice; both now match the Vocabulary/Folder control. Next allowed action: Final Acceptance.

## Current UI refinement — 2026-09-03

Flashcards Visual Redesign and Multiple Choice Visual Redesign are **PASS**. Existing learning behavior is preserved, browser verification reports zero errors, and all frontend quality gates pass. Next allowed action: Final Acceptance.

## Current authoritative maintenance status — Folder Detail — 2026-09-01

Folder Detail Layout + Action Redesign is **PASS**. The opened-folder page now separates the compact `Back to Folders` control from the dynamic folder heading, presents real folder data in a responsive hero, groups Flashcards/Multiple Choice/AI Generator by learning purpose, and groups Add Vocabulary/Import CSV beside the vocabulary section. Existing REST calls, persistence, validation, pronunciation, CSV, study, AI, authentication, and routing behavior remain intact.

Frontend tests pass 61/61 with 99.83/95.11/96.40/99.83 coverage for statements/branches/functions/lines. The persistent real-browser workflow and instrumented long-name layout pass at 1440px, 768px, and 390px with no overlap, no document overflow, and zero browser errors (EVID-530–EVID-535).

| Field                | Value                                                                |
| -------------------- | -------------------------------------------------------------------- |
| Current stage        | Post-acceptance maintenance — Folder Detail Layout + Action Redesign |
| Gate status          | **PASS**                                                             |
| Current blockers     | None                                                                 |
| Next allowed action  | Handoff / normal maintenance                                         |
| User approval status | User-authorized maintenance complete                                 |

This section supersedes older current-state summaries below without rewriting their historical evidence.

## Current authoritative maintenance status — Left Navigation — 2026-09-01

Left Navigation Visual Redesign is **PASS**. Only Dashboard, Vocabulary, Practice, and Progress navigation presentation changed. The desktop sidebar and existing responsive drawer now use consistently left-aligned 52px items, 24px semantic icons, 15px labels, 12px corners, 8px gaps, restrained hover feedback, visible keyboard focus, and a soft active state with a 3px left accent.

Frontend tests pass 61/61 with 99.83/95.02/96.35/99.83 coverage for statements/branches/functions/lines. Instrumented browser verification passes at 1440px, 768px, and 390px with no page overflow, no layout shift, and zero browser errors (EVID-525–EVID-529).

| Field                | Value                                                         |
| -------------------- | ------------------------------------------------------------- |
| Current stage        | Post-acceptance maintenance — Left Navigation Visual Redesign |
| Gate status          | **PASS**                                                      |
| Current blockers     | None                                                          |
| Next allowed action  | Handoff / normal maintenance                                  |
| User approval status | User-authorized maintenance complete                          |

This section supersedes older current-state summaries below without rewriting their historical evidence.

## Current authoritative maintenance status — 2026-09-01

Learning Consistency Logic + UI Redesign is **PASS**. The dashboard now derives unique active local calendar days from persisted completed test sessions and calculates current-week consistency as active elapsed days divided by elapsed days from Monday through today. Future days are explicitly `Upcoming` and do not reduce the score.

The fabricated percentage-bar chart was replaced by an accessible seven-day timeline with weekday names, calendar dates, today/active/inactive/upcoming text and shape states, a percentage, and an explanatory active-day count. Frontend coverage is 99.86/95.10/96.35/99.86 and backend coverage is 97.39/95.08/98.61/97.39 for statements/branches/functions/lines. Persisted browser verification passes at 1440px, 768px, and 390px with zero browser errors and no page overflow (EVID-517–EVID-524).

| Field                | Value                                |
| -------------------- | ------------------------------------ |
| Current stage        | Post-acceptance maintenance          |
| Gate status          | **PASS**                             |
| Current blockers     | None                                 |
| Next allowed action  | Handoff / normal maintenance         |
| User approval status | User-authorized maintenance complete |

This section supersedes older current-state summaries below without rewriting their historical evidence.

## Current authoritative gate — 2026-08-28

Authentication and Routing Remediation and Final Acceptance are **PASS**. The complete browser acceptance workflow passed with the persistent dev server, including auth routing, learning flow, CSV import, flashcards, quiz, AI, and logout/login persistence. Handoff is **READY**.

Next allowed action: Handoff / normal maintenance.

Final Acceptance is complete. The completed Folder Detail redesign is PASS with representative browser evidence at 1440px, 768px, and 390px.

The former browser-evidence blocker was resolved by EVID-517–EVID-535. The npm registry was unreachable during the audit attempt; this remains a documented limitation, not an acceptance blocker.

Next allowed action: Handoff / normal maintenance.

This section supersedes older current-state summaries below without changing their historical evidence.

## Current authoritative gate

Post-acceptance UI/UX Redesign Review: **FAIL**. Blockers are frontend coverage below 95% and missing real-browser verification. TASK-001 through TASK-022 remain historically complete, but the redesigned handoff is **NOT READY**. Next allowed action: remediate coverage and execute the browser workflow. Evidence: EVID-493–EVID-501.

EVID-502 resolves the Windows setup and stale-process defect. It does not change the remaining redesign gate blockers.

| Field        | Value                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Document     | SDD dashboard                                                                                          |
| Stage        | Code Generation                                                                                        |
| Owner        | Software Architect                                                                                     |
| Status       | ✅ COMPLETE                                                                                            |
| Version      | 2.2                                                                                                    |
| Last updated | 2026-08-27                                                                                             |
| Depends on   | [Repository governance](../../AGENTS.md), [Project status](status.md), [Traceability](traceability.md) |
| Next review  | Final Acceptance                                                                                       |

> **Executive summary**
>
> Specification, Planning, and Task Decomposition are verified and approved. Code Generation is complete. TASK-001 through TASK-022 passed task-specific verification.

## Current gate

| Field                | Value                                    |
| -------------------- | ---------------------------------------- |
| Current stage        | Final Acceptance / Handoff               |
| Gate status          | ✅ PASS; TASK-001–TASK-022 PASS          |
| Current blockers     | None                                     |
| Next allowed action  | Handoff / normal maintenance             |
| User approval status | Final Acceptance accepted; handoff READY |

## Stage navigation

| Stage                     | Owner              | Artifact                                                            | Verification                                                     | Status                              |
| ------------------------- | ------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------- |
| Bootstrap                 | Repository Owner   | [Dashboard](index.md)                                               | [Project status](status.md)                                      | ✅ PASS                             |
| Specification             | Business Analyst   | [Specification](01-spec/spec.md)                                    | [Specification Verification](01-spec/verification.md)            | ✅ PASS and approved                |
| Planning                  | Software Architect | [Technical Plan](02-plan/plan.md)                                   | [Planning Verification](02-plan/verification.md)                 | ✅ PASS and approved                |
| Task Decomposition        | Technical Leads    | [Tasks](03-tasks/tasks.md)                                          | [Task Verification](03-tasks/verification.md)                    | ✅ PASS and approved                |
| Code Generation           | FE/BE Leads        | [Implementation report](04-implementation/implementation-report.md) | [Implementation Verification](04-implementation/verification.md) | ✅ COMPLETE; TASK-001–TASK-022 PASS |
| Code Review               | Reviewer           | [Review report](05-review/review-report.md)                         | [Review Verification](05-review/verification.md)                 | ✅ PASS                             |
| Unit Testing and Coverage | QA                 | [Test report](06-testing/test-report.md)                            | [Testing Verification](06-testing/verification.md)               | ✅ PASS                             |
| Final Acceptance          | User               | [Final acceptance](07-acceptance/final-acceptance.md)               | —                                                                | ✅ PASS                             |

## Planning artifacts

- [Technical plan](02-plan/plan.md)
- [Architecture and ADR register](02-plan/architecture.md)
- [Beginner database guide](02-plan/database-guide.md)
- [Logical data model](02-plan/data-model.md)
- [REST API contract](02-plan/api-contract.md)
- [Planning Verification](02-plan/verification.md)

## Coverage targets

| Application | Statements | Branches | Functions | Lines | Evidence status                              |
| ----------- | ---------: | -------: | --------: | ----: | -------------------------------------------- |
| Frontend    |       ≥95% |     ≥95% |      ≥95% |  ≥95% | Final verified coverage meets all thresholds |
| Backend     |       ≥95% |     ≥95% |      ≥95% |  ≥95% | Final verified coverage meets all thresholds |

A combined monorepo percentage cannot satisfy either application. Exclusions require documented technical justification and cannot remove business logic merely to raise coverage.

## Latest verified evidence

- Specification Verification: `PASS`; OQ-001–OQ-008 resolved; user approval recorded from the Planning authorization.
- Planning artifacts: six ADR entries, twelve planned components, eleven REST endpoints, and four persistent entities.
- Planning audit: eight executed checks with exit code `0`; 27/27 topics covered; no source or implementation task list found.
- Task Verification: 22/22 tasks and 22/22 planned TEST IDs; all FR/NFR and 12 components mapped; dependency order and Code lock passed.
- TASK-001: dependency installation, lock validation, typecheck, lint, formatting, TEST-001, separate coverage, threshold probes, security audit, and whitespace verification passed.
- TASK-002: 16 focused backend and 3 focused frontend tests passed; full suite, typecheck, lint, formatting, separate 100% foundation coverage, dependency audit, and whitespace verification passed.
- TASK-003: the real migration replays from fresh SQLite files; 5/5 database integration tests, all regressions, separate coverage, quality checks, and final zero-vulnerability audit passed.
- TASK-004: 14/14 focused folder tests, 36 backend regressions, safe error/duplicate behavior, separate coverage, quality checks, and zero-vulnerability audit passed.
- TASK-005: 20/20 focused vocabulary tests, 56 backend regressions, persistence/reload and scoped-duplicate behavior, separate coverage, quality checks, and zero-vulnerability audit passed.

## Blockers and approval

No implementation defect is open. Overall implementation progress is 22/22 tasks (100%). All tasks are PASS.

Dependency and security checks are now verified: `npm ls --all` passed. The historical Final Acceptance rejection was remediated by EVID-517–EVID-535; Final Acceptance is now PASS and handoff is READY.
Vocabulary UI redesign responsive verification is **PASS** at representative desktop, tablet, and mobile viewports.
Vocabulary visual refinement is **PASS**; no functional or backend changes were made.
Folder Detail UI redesign is **PASS**; all study and vocabulary controls remain available.
Dashboard visual redesign is **PASS**; real metrics and progress data remain dynamic.
