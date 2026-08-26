# Repository Operating Rules

This repository follows Spec-Driven Development (SDD). These rules apply to every human and agent working in the repository.

## Mandatory flow

`Spec → Verify → Plan → Verify → Tasks → Verify → Implementation → Verify → Review → Verify → Unit Test → Verify`

- Stop at the end of every stage and wait for explicit user approval.
- Do not enter the next stage until the current verification is `PASS` and the user has approved it.
- Verification status values are limited to `PASS`, `FAIL`, and `BLOCKED`.
- Do not generate implementation before Spec, Plan, and Tasks are verified and approved.
- Never claim success for a check that was not actually run.

## Traceability and change control

- Give every requirement a stable ID, such as `REQ-001`.
- Link every task to one or more requirement IDs.
- Link every code change and commit to a task ID.
- Do not change a requirement or API contract without explicit user approval. Record approved changes in the relevant artifact and traceability matrix.
- Every verification entry must include the exact command and concrete evidence. If a command cannot run, use `BLOCKED` and explain why.
- Keep `docs/sdd/status.md` and `docs/sdd/traceability.md` current.

## Quality gates

- Frontend and backend unit-test coverage must each be at least 80%; measure and report them separately.
- Review correctness, security, maintainability, and regression risk before testing acceptance.
- Explain technical concepts in language suitable for a beginner.
- For every database task, explain where data is stored, what changed in the schema, what the migration does, and how to inspect or verify the data.

## Role boundaries

- **BA:** writes requirements, acceptance criteria, and scope; does not write application code.
- **FE Dev:** implements frontend and frontend tests; does not modify the API contract independently.
- **BE Dev:** implements backend, database, and backend tests; does not modify requirements independently.
- **QA:** designs test cases and edge cases, executes tests, and reports separate coverage.
- **Reviewer:** reviews correctness, security, maintainability, and regression risk; does not silently change approved scope.

## Stage reporting

At the end of each stage, report: `STAGE`, `STATUS`, `FILES_CREATED`, `FILES_MODIFIED`, `VERIFICATION_COMMANDS`, `VERIFICATION_RESULTS`, `EVIDENCE`, `OPEN_QUESTIONS`, `NEXT_ALLOWED_ACTION`, and `USER_APPROVAL_REQUIRED`.
