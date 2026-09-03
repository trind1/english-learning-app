# System Architecture and Decisions

| Field        | Value                                                          |
| ------------ | -------------------------------------------------------------- |
| Document     | Architecture and ADR register                                  |
| Stage        | Planning                                                       |
| Owner        | Software Architect                                             |
| Status       | ✅ PASS                                                        |
| Version      | 0.1                                                            |
| Last updated | 2026-08-26                                                     |
| Depends on   | [Technical plan](plan.md), [Specification](../01-spec/spec.md) |
| Next review  | Explicit user approval of Planning                             |

> **Executive summary**
>
> The architecture uses a browser client, REST API, application/domain services, and Prisma repository adapters. Dependencies point inward: HTTP, database, browser speech, and AI are replaceable edges. Four ADR entries capture the stack, boundaries, persistence, and testability decisions.

## Component boundaries

| Layer                    | Responsibility                                                                  | Must not do                                                   |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| React presentation       | Routes, accessible UI, local interaction state                                  | Access Prisma/database; decide authoritative correctness      |
| Frontend feature/service | API calls, DTO parsing, speech adapter, view models                             | Store secrets; duplicate backend business policy as authority |
| Express HTTP             | Routing, request parsing, Zod boundary validation, response mapping             | Contain repository queries or raw provider errors             |
| Application/domain       | Use cases, normalization, imports, question generation, scoring, dashboard math | Depend on Express, Prisma, browser APIs                       |
| Ports                    | Repository, clock, RNG, signer, AI-provider interfaces                          | Implement infrastructure                                      |
| Adapters                 | Prisma, HMAC signer, AI provider, browser speech                                | Leak adapter errors across boundaries                         |

## Frontend architecture

- Routes: dashboard, folders, folder vocabulary/import, flashcards, test, test result, AI text.
- Feature folders own components, hooks, API adapters, Zod response parsing, and tests.
- Server state is fetched through a thin typed API client; mutation state is explicit (`idle/pending/success/error`).
- Flashcard reveal and test navigation are local state. Completed session persistence occurs only through the API.
- `SpeechPort` wraps `window.speechSynthesis`; tests substitute a fake.
- Semantic HTML, focus movement, live regions, and 320-pixel layouts are designed with components, not retrofitted.

## Backend architecture

Each module (`folders`, `vocabulary`, `imports`, `tests`, `dashboard`, `ai`) contains HTTP handlers, schemas, application services, ports, and adapters. A global error middleware maps known application errors to the stable API envelope. Transactions are started by repository/unit-of-work adapters at application-service boundaries.

## Runtime interactions

- All `/api/v1` routes return JSON except CSV upload input.
- The frontend and API may run on separate local ports; CORS accepts only configured web origins.
- SQLite is used by the API process only.
- AI calls are outbound from the API only and use a timeout/abort signal.

## ADR-001: Approved monorepo stack

**Status:** Accepted

**Context:** The product requires one frontend, one backend, shared contracts, and independent testing.

**Decision:** npm workspaces; React/Vite/TypeScript; Express/TypeScript; Zod; Vitest/RTL/Supertest.

**Consequences:** One lockfile and shared scripts; application coverage remains separate; strict workspace boundaries are required.

## ADR-002: Layered ports and adapters

**Status:** Accepted

**Context:** Business rules must be testable without UI, HTTP, database, browser, or AI.

**Decision:** Application services depend on ports; Express, Prisma, HMAC, browser speech, and AI are adapters.

**Consequences:** More explicit interfaces and mapping code; faster deterministic unit tests and safer provider replacement.

## ADR-003: Prisma and SQLite persistence

**Status:** Accepted

**Context:** The single-user MVP needs durable relational data with reviewable schema evolution.

**Decision:** SQLite file accessed only through Prisma repositories; schema changes use committed Prisma migrations.

**Consequences:** Simple local operation and relational constraints; not designed for multi-process/high-write deployment without a future ADR.

## ADR-004: Testability and coverage boundaries

**Status:** Accepted

**Context:** Frontend and backend must each meet four 95% metrics. Randomness, time, signatures, speech, and AI otherwise create flaky tests.

**Decision:** Inject RNG, clock, signer, speech, and AI ports; maintain separate Vitest configurations where each application enforces 95% statements, 95% branches, 95% functions, and 95% lines.

**Consequences:** Deterministic tests and visible application-specific failures; no combined coverage can satisfy the gate.

## ADR-005: Stateless test draft with atomic completion

**Status:** Accepted

**Context:** Abandoned sessions must not be persisted, while clients must not control question integrity or scoring.

**Decision:** The API returns questions plus a signed, expiring snapshot token. Completion verifies the signature/snapshot, recomputes outcomes, and atomically inserts one completed session and all answers.

**Consequences:** Requires `TEST_TOKEN_SECRET`; expired/changed snapshots return safe conflicts; no abandoned database rows require cleanup.

### TASK-007 cryptographic and deterministic boundaries

The token adapter signs canonical `v1` payloads with Node's built-in HMAC-SHA256 and compares signatures in constant time. A minimal `Clock` port exposes `now(): Date`; production uses the system clock and tests use a fixed clock. A minimal `RandomSource` port supplies deterministic values in tests and cryptographically suitable runtime randomness in production. These ports remain outside the business service.

## ADR-006: Optional AI provider boundary

**Status:** Accepted

**Context:** AI is optional, provider details are a Planning decision, generated text is not persisted, and core data must survive failures.

**Decision:** Define an `AiProvider` port behind `AiService`. The browser sends the active folder ID plus one-to-ten selected vocabulary IDs; the service reloads stored word/meaning data within that folder, enforces timeout, verifies every word in normalized output, and retries at most once. `AI_PROVIDER=openai` selects an OpenAI-compatible backend adapter configured by `AI_API_KEY`, `AI_MODEL`, and `AI_BASE_URL`; `AI_PROVIDER=local` selects an explicitly labelled deterministic development provider. Credentials remain backend-only.

**Consequences:** The application can run with AI disabled; provider-specific code stays isolated; provider errors become safe `AI_UNAVAILABLE` responses; no AI output table or schema migration exists.
