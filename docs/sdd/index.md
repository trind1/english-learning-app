# SDD Project Dashboard

## Current authoritative gate — 2026-08-28

Authentication and Routing Remediation and Final Acceptance are **PASS**. The complete browser acceptance workflow passed with the persistent dev server, including auth routing, learning flow, CSV import, flashcards, quiz, AI, and logout/login persistence. Handoff is **READY**.

Next allowed action: Final Acceptance.

Final Acceptance is **NOT STARTED** for the next project stage. The completed Folder Detail redesign is PASS with representative browser evidence at 1440px, 768px, and 390px.

The remaining gate blocker is the required complete real-browser workflow and mobile screenshot. Headless Chrome reached and captured the real dashboard, but the workflow did not pass before the browser rerun was denied (EVID-511–EVID-512). The npm registry was also unreachable during the current audit attempt; the lockfile is unchanged and historical zero-vulnerability evidence remains EVID-493, but the current audit attempt is recorded as a limitation in EVID-510.

Next allowed action: authorize and rerun `npm.cmd run browser:acceptance -- http://localhost:5173` while `npm.cmd run dev` is running on the default port, then inspect the desktop/mobile screenshots and make the Final Acceptance decision.

This section supersedes older current-state summaries below without changing their historical evidence.

## Current authoritative gate

Post-acceptance UI/UX Redesign Review: **FAIL**. Blockers are frontend coverage below 95% and missing real-browser verification. TASK-001 through TASK-022 remain historically complete, but the redesigned handoff is **NOT READY**. Next allowed action: remediate coverage and execute the browser workflow. Evidence: EVID-493–EVID-501.

EVID-502 resolves the Windows setup and stale-process defect. It does not change the remaining redesign gate blockers.

| Field        | Value                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| Document     | SDD dashboard                                                                                          |
| Stage        | Code Generation                                                                                        |
| Owner        | Software Architect                                                                                     |
| Status       | ✅ COMPLETE                                                                                             |
| Version      | 2.2                                                                                                    |
| Last updated | 2026-08-27                                                                                             |
| Depends on   | [Repository governance](../../AGENTS.md), [Project status](status.md), [Traceability](traceability.md) |
| Next review  | Final Acceptance                                                                                        |

> **Executive summary**
>
> Specification, Planning, and Task Decomposition are verified and approved. Code Generation is complete. TASK-001 through TASK-022 passed task-specific verification.

## Current gate

| Field                | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Current stage        | Final Acceptance — rejected pending browser verification |
| Gate status          | ✅ PASS; TASK-001–TASK-022 PASS                         |
| Current blockers     | None                                                    |
| Next allowed action  | Handoff / normal maintenance                            |
| User approval status | Final Acceptance not approved; handoff NOT READY       |

## Stage navigation

| Stage                     | Owner              | Artifact                                                            | Verification                                                     | Status                                 |
| ------------------------- | ------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Bootstrap                 | Repository Owner   | [Dashboard](index.md)                                               | [Project status](status.md)                                      | ✅ PASS                                |
| Specification             | Business Analyst   | [Specification](01-spec/spec.md)                                    | [Specification Verification](01-spec/verification.md)            | ✅ PASS and approved                   |
| Planning                  | Software Architect | [Technical Plan](02-plan/plan.md)                                   | [Planning Verification](02-plan/verification.md)                 | ✅ PASS and approved                   |
| Task Decomposition        | Technical Leads    | [Tasks](03-tasks/tasks.md)                                          | [Task Verification](03-tasks/verification.md)                    | ✅ PASS and approved                   |
| Code Generation           | FE/BE Leads        | [Implementation report](04-implementation/implementation-report.md) | [Implementation Verification](04-implementation/verification.md) | ✅ COMPLETE; TASK-001–TASK-022 PASS |
| Code Review               | Reviewer           | [Review report](05-review/review-report.md)                         | [Review Verification](05-review/verification.md)                 | ✅ PASS                              |
| Unit Testing and Coverage | QA                 | [Test report](06-testing/test-report.md)                            | [Testing Verification](06-testing/verification.md)               | ✅ PASS                              |
| Final Acceptance          | User               | [Final acceptance](07-acceptance/final-acceptance.md)               | —                                                                | ❌ REJECTED                           |

## Planning artifacts

- [Technical plan](02-plan/plan.md)
- [Architecture and ADR register](02-plan/architecture.md)
- [Beginner database guide](02-plan/database-guide.md)
- [Logical data model](02-plan/data-model.md)
- [REST API contract](02-plan/api-contract.md)
- [Planning Verification](02-plan/verification.md)

## Coverage targets

| Application | Statements | Branches | Functions | Lines | Evidence status                                                                                       |
| ----------- | ---------: | -------: | --------: | ----: | ----------------------------------------------------------------------------------------------------- |
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

Dependency and security checks are now verified: `npm ls --all` passed and `npm audit --audit-level=low` reports zero vulnerabilities after the targeted `tsx` upgrade and deduplication. Final Acceptance remains REJECTED because the required interactive browser workflow could not be executed in this environment; handoff remains NOT READY.
Vocabulary UI redesign responsive verification is **PASS** at representative desktop, tablet, and mobile viewports.
Vocabulary visual refinement is **PASS**; no functional or backend changes were made.
Folder Detail UI redesign is **PASS**; all study and vocabulary controls remain available.
Dashboard visual redesign is **PASS**; real metrics and progress data remain dynamic.
