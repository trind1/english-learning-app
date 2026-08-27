# English Learning App — Repository Instructions

## Project mission
Build a real, beginner-friendly full-stack English-learning application with a React frontend, REST API, persistent database, tests, and auditable SDD traceability.

## User knowledge level
Assume the user is new to AI-assisted and database development. Keep every repository action and written artifact in English. Explain database work in beginner-friendly English: plain meaning, a small example, file location, verification method, then the technical term. Preserve user-provided domain data in its original language.

## Language policy
- All repository documents, source code, comments, tests, UI text, errors, logs, reports, and suggested Git messages must be in English.
- User-provided domain data may remain in its original language.

## SDD stage order
`Specification → Specification Verification → Planning → Planning Verification → Task Decomposition → Task Verification → Code Generation → Implementation Verification → Code Review → Review Verification → Unit Testing and Coverage → Testing Verification → Final Acceptance`

Bootstrap creates governance and placeholder artifacts before this sequence begins. It does not authorize Specification work.

## Stage-gate policy
- A stage starts only when the previous verification is `PASS` and explicitly user-approved.
- Stop after every stage. Never treat “mostly complete” as `PASS`.
- Gate statuses are `PASS`, `FAIL`, and `BLOCKED`; templates may use `NOT STARTED`.
- Do not implement before Specification, Plan, and Tasks are verified and approved.

## Approval policy
Only an explicit user instruction grants approval. Never infer approval or change `Pending` automatically. Never silently change an approved requirement or API contract; record approved changes.

## Traceability policy
- Requirements use stable IDs (`FR-`, `NFR-`, `BR-`); tasks use `TASK-`; tests use `TEST-`.
- Every task references requirements; every code change references a task; every test references a requirement, rule, or task.
- Keep [traceability](docs/sdd/traceability.md) current.

## Verification and evidence policy
Use [the verification template](docs/sdd/templates/verification-template.md). Record exact commands, working directory, exit codes, output evidence, and limitations. Label unexecuted commands `NOT RUN`. Never invent output, results, dates, or coverage.

## Engineering constraints
The proposed stack is npm workspaces, React/Vite/TypeScript, Express/TypeScript, SQLite, Prisma, Zod, Vitest, React Testing Library, and Supertest; it remains unapproved until Plan. Frontend must not access the database directly. Validate inputs and do not expose raw database errors.

Use clean architecture and clean-code practices. Keep responsibilities separated and dependencies directed through explicit boundaries.

## Database explanation policy
For every database task explain in beginner-friendly English where data is stored, schema changes, what the migration does, committed versus ignored files, and how to inspect data safely. Change schemas through migrations, never through undocumented manual database edits.

## Testing and coverage policy
Measure frontend and backend unit-test coverage separately. Each must independently reach at least 95% statements, 95% branches, 95% functions, and 95% lines. Never combine results to conceal a shortfall. Exclusions require documented technical justification and must never be used only to raise a percentage. Any metric below 95%, or any failing test, fails the testing gate.

## Documentation policy
Follow the [documentation style guide](docs/sdd/documentation-style-guide.md). Use concise beginner-friendly language, relative links, stable IDs, and evidence-backed statements.

## Role boundaries
- BA owns requirements, scope, business rules, acceptance criteria, ambiguity detection, and requirement verification; no application code or undocumented architecture decisions.
- FE Dev owns UI, accessibility, client validation, API integration, and frontend tests; no database access, contract changes, or backend logic in UI.
- BE Dev owns API, validation, persistence, backend tests, and CSV import; no requirement changes, raw database errors, or validation bypasses.
- QA owns cases, traceability, evidence, and separate coverage; no estimated coverage or acceptance of failures.
- Reviewer reviews read-only first for correctness, security, maintainability, regression, architecture, tests, and requirements. Record findings before fixes; no open Critical or High finding may remain at `PASS`.

## Completion report contract
End each stage with: `STAGE`, `STATUS`, `FILES_CREATED`, `FILES_MODIFIED`, `VERIFICATION_COMMANDS`, `VERIFICATION_RESULTS`, `EVIDENCE`, `OPEN_QUESTIONS`, `NEXT_ALLOWED_ACTION`, and `USER_APPROVAL_REQUIRED`. Update [status](docs/sdd/status.md) and traceability.

## Durable governance synchronization
At the end of every stage execution, stage verification, gate decision, or material project-status transition, synchronize:
- [SDD dashboard](docs/sdd/index.md)
- [Project status](docs/sdd/status.md)
- [Traceability](docs/sdd/traceability.md) when traceability is affected
- The current stage report
- The current verification report

These artifacts must agree on the current stage, gate status, blockers, approval state, and next allowed action. Do not fabricate commands, exit codes, evidence, or completion status.

## Prohibited behavior
Do not skip gates, invent evidence, claim unrun checks, silently change scope/contracts, generate premature implementation, create fake migrations, install dependencies without stage authorization, commit secrets, or continue after a failed gate or without approval. Preserve unrelated user changes.
