# Specification Traceability Matrix

| Field | Value |
|---|---|
| Document | Traceability matrix |
| Stage | Code Generation |
| Owner | Business Analyst |
| Status | 🟡 IN PROGRESS |
| Version | 1.2 |
| Last updated | 2026-08-27 |
| Depends on | [Product specification](01-spec/spec.md), [Technical plan](02-plan/plan.md), [Tasks](03-tasks/tasks.md) |
| Next review | User review of verified TASK-003 |

> **Executive summary**
>
> Every requirement maps to approved acceptance criteria, planned components, and implementation tasks. TASK-001 through TASK-003 map implemented foundations to TEST-001–TEST-003 and EVID-401–EVID-428. Later tasks remain not started.

## Governance state

| Gate | Verification | User approval | Downstream state |
|---|---|---|---|
| Specification | ✅ PASS | Approved by the request authorizing Planning | Planning authorized |
| Planning | ✅ PASS | Approved by current Task Decomposition request | Task Decomposition authorized |
| Task Decomposition | ✅ PASS | Approved | TASK-001 authorized |
| Code Generation | 🟡 IN PROGRESS | TASK-001–TASK-002 approved; TASK-003 pending review | TASK-004+ locked |

## Original request coverage

| Original requirement | Specification coverage | Result |
|---|---|---|
| Self-designed UI | FR-014, NFR-011–013, AC-010, AC-022 | Covered |
| Manual word and meaning creation | FR-002, BR-001–003, AC-002 | Covered |
| CSV vocabulary import | FR-003, BR-004–006, BR-017, BR-019–BR-020, AC-003 | Covered |
| Topic folders | FR-001, BR-003, AC-001 | Covered |
| Pronunciation audio | FR-005, BR-007, BR-021–BR-022, AC-005 | Covered |
| IPA on cards | FR-004, BR-002, BR-021, AC-004 | Covered |
| Flashcards | FR-006, BR-008, BR-023, AC-006 | Covered |
| Multiple choice | FR-007–009, BR-009, BR-024, AC-007 | Covered |
| Per-session correct/incorrect tracking | FR-010–011, BR-010, BR-025, AC-008 | Covered |
| Progress dashboard | FR-012–013, BR-011, BR-025–BR-026, AC-009 | Covered |
| Optional AI text with at most ten words | FR-015–016, BR-012–BR-013, BR-027–BR-028, AC-011–AC-012 | Covered |
| Frontend, backend, database | FR-013, NFR-014–017, AC-023–025 | Covered without architecture decision |
| Clean, maintainable code | NFR-016, AC-024 | Covered |
| Separate frontend/backend coverage ≥95% for four metrics | NFR-001–010, AC-013–021 | Covered |

## Specification-era requirement mapping

| Requirement | Acceptance criteria | Prior Planning state | Task | Code | Test | Status |
|---|---|---|---|---|---|---|
| FR-001 | AC-001 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-002 | AC-002 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-003 | AC-003 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-004–FR-005 | AC-004–AC-005 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-006–FR-009 | AC-006–AC-007 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-010–FR-011 | AC-008 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-012–FR-013 | AC-009 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-014 | AC-010 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| FR-015–FR-016 | AC-011–AC-012 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-001 | AC-013 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-002 | AC-014 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-003 | AC-015 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-004 | AC-016 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-005 | AC-017 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-006 | AC-018 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-007 | AC-019 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-008 | AC-020 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-009–NFR-010 | AC-021 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-011–NFR-013 | AC-022 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-014–NFR-015 | AC-023 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-016 | AC-024 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |
| NFR-017 | AC-025 | Stage locked | Stage locked | Stage locked | Stage locked | Defined |

## Planning component mapping

| Component ID | Planned component | Requirements and rules | Plan evidence | Downstream status |
|---|---|---|---|---|
| PC-001 | Folder and vocabulary frontend features | FR-001, FR-002, FR-003, FR-004, FR-014; BR-001, BR-002, BR-003, BR-016, BR-017, BR-018 | [Plan](02-plan/plan.md), [API](02-plan/api-contract.md) | TASK-011–TASK-014 |
| PC-002 | Folder/vocabulary API services and repositories | FR-001, FR-002, FR-003, FR-004, FR-013; BR-001–BR-006, BR-015–BR-021 | [Architecture](02-plan/architecture.md), [Data model](02-plan/data-model.md) | TASK-003–TASK-006 |
| PC-003 | CSV import pipeline | FR-003, FR-014, BR-004–BR-006, BR-017, BR-019–BR-020 | [API import](02-plan/api-contract.md#csv-import-endpoint) | TASK-006, TASK-014 |
| PC-004 | IPA display and browser speech adapter | FR-004, FR-005, FR-014, BR-002, BR-007, BR-021–BR-022 | [Plan workflows](02-plan/plan.md#feature-workflows) | TASK-013, TASK-015 |
| PC-005 | Flashcard frontend and shuffle helper | FR-006, BR-008, BR-023 | [Architecture](02-plan/architecture.md#frontend-architecture) | TASK-016 |
| PC-006 | Test generation, signed token, scoring, and UI | FR-007, FR-008, FR-009, FR-010, FR-011, FR-014; BR-009–BR-010, BR-024–BR-025 | [ADR-005](02-plan/architecture.md#adr-005-stateless-test-draft-with-atomic-completion), [API](02-plan/api-contract.md#test-endpoints) | TASK-007, TASK-008, TASK-017 |
| PC-007 | Session/answer persistence | FR-010, FR-011, FR-012, FR-013; BR-010–BR-011, BR-025–BR-026 | [Data model](02-plan/data-model.md) | TASK-003, TASK-008, TASK-009 |
| PC-008 | Dashboard UI and aggregation service | FR-012, FR-013, FR-014; BR-011, BR-025–BR-026 | [Dashboard API](02-plan/api-contract.md#dashboard-endpoint) | TASK-009, TASK-018 |
| PC-009 | Optional AI UI/service/provider port | FR-015, FR-016; BR-012–BR-013, BR-027–BR-028 | [ADR-006](02-plan/architecture.md#adr-006-optional-ai-provider-boundary) | TASK-010, TASK-019 |
| PC-010 | Validation, errors, environment, and security | FR-014; NFR-014, NFR-015, NFR-016, NFR-017; BR-014–BR-016 | [API errors](02-plan/api-contract.md#error-format), [Plan security](02-plan/plan.md#security-considerations) | TASK-001, TASK-002, TASK-004–TASK-010, TASK-022 |
| PC-011 | Responsive accessible UI system | NFR-011, NFR-012, NFR-013 | [Frontend architecture](02-plan/architecture.md#frontend-architecture) | TASK-011–TASK-019, TASK-021 |
| PC-012 | Separate frontend/backend test infrastructure | NFR-001, NFR-002, NFR-003, NFR-004, NFR-005, NFR-006, NFR-007, NFR-008, NFR-009, NFR-010 | [Testing architecture](02-plan/plan.md#testing-architecture), [ADR-004](02-plan/architecture.md#adr-004-testability-and-coverage-boundaries) | TASK-001, TASK-020–TASK-022 |

## Requirement-to-task mapping

| Requirement | Task coverage | Planned test coverage | Downstream state |
|---|---|---|---|
| FR-001 | TASK-004, TASK-012 | TEST-004, TEST-012 | Code locked |
| FR-002 | TASK-005, TASK-013 | TEST-005, TEST-013 | Code locked |
| FR-003 | TASK-006, TASK-014 | TEST-006, TEST-014 | Code locked |
| FR-004 | TASK-005, TASK-013 | TEST-005, TEST-013 | Code locked |
| FR-005 | TASK-015 | TEST-015 | Code locked |
| FR-006 | TASK-016 | TEST-016 | Code locked |
| FR-007–FR-009 | TASK-007, TASK-017 | TEST-007, TEST-017 | Code locked |
| FR-010–FR-011 | TASK-008, TASK-017 | TEST-008, TEST-017 | Code locked |
| FR-012–FR-013 | TASK-003, TASK-005, TASK-008, TASK-009, TASK-018 | TEST-003, TEST-005, TEST-008, TEST-009, TEST-018 | TASK-003 PASS for FR-013 persistence foundation; remainder locked |
| FR-014 | TASK-002, TASK-004–TASK-019 | TEST-002, TEST-004–TEST-019 | TASK-002 PASS; remainder locked |
| FR-015–FR-016 | TASK-010, TASK-019 | TEST-010, TEST-019 | Code locked |
| NFR-001–NFR-004 | TASK-001, TASK-021 | TEST-001, TEST-021 | Code locked |
| NFR-005–NFR-008 | TASK-001, TASK-020 | TEST-001, TEST-020 | Code locked |
| NFR-009–NFR-010 | TASK-001, TASK-020–TASK-022 | TEST-001, TEST-020–TEST-022 | Code locked |
| NFR-011–NFR-013 | TASK-011–TASK-019, TASK-021 | TEST-011–TEST-019, TEST-021 | Code locked |
| NFR-014–NFR-017 | TASK-002–TASK-010, TASK-020, TASK-022 | TEST-002–TEST-010, TEST-020, TEST-022 | TASK-002 PASS; remainder locked |

## TASK-001 implementation mapping

| Task | Requirements | Components | Code and configuration | Test | Evidence | Status |
|---|---|---|---|---|---|---|
| TASK-001 | NFR-001–NFR-010, NFR-016 | PC-010, PC-012 | Root npm/TypeScript/ESLint/Prettier configuration; `apps/web`; `apps/api`; `packages/contracts` | TEST-001 | EVID-401–EVID-410 | ✅ PASS |

| Requirement group | TASK-001 implementation evidence | Remaining coverage |
|---|---|---|
| NFR-001–NFR-004 | Separate frontend coverage configuration, 100% TASK-001 foundation metrics, and a failing 101% probe | Feature coverage continues in TASK-021 |
| NFR-005–NFR-008 | Separate backend coverage configuration, 100% TASK-001 foundation metrics, and a failing 101% probe | Feature coverage continues in TASK-020 |
| NFR-009–NFR-010 | Independent 95% thresholds for all four metrics; combined coverage is not used | Full application enforcement continues in TASK-020–TASK-022 |
| NFR-016 | Strict TypeScript, lint, formatting, smoke tests, and validated dependency graph | Maintainability verification continues in later implementation tasks |

## TASK-002 implementation mapping

| Task | Requirements and rules | Acceptance | Component | Code and configuration | Test | Evidence | Status |
|---|---|---|---|---|---|---|---|
| TASK-002 | FR-014, NFR-014–NFR-017, BR-014–BR-016 | AC-010, AC-023; ADR-002 | PC-010 | Shared HTTP contracts; API configuration and HTTP safety adapters; frontend API client boundary | TEST-002 | EVID-411–EVID-418 | ✅ PASS |

| Trace item | TASK-002 evidence | Remaining coverage |
|---|---|---|
| FR-014 / AC-010 | Typed frontend error parsing and safe backend error-state foundation | Feature-specific UI states remain in TASK-011–TASK-019 |
| NFR-014–NFR-015 / BR-014 / AC-023 | Strict schemas, startup configuration, safe errors, no raw internal response content | Feature input schemas continue in TASK-004–TASK-010 |
| NFR-016 / ADR-002 | Contracts, configuration, HTTP adapters, and frontend transport have explicit boundaries | Domain and persistence layers remain later tasks |
| NFR-017 | Foundation error paths do not access or mutate persistence | Persistence consistency continues in TASK-003–TASK-010 |
| BR-015–BR-016 | Single-user/no-auth and approved validation limits remain unchanged | Feature schemas apply exact field limits in later tasks |

## TASK-003 implementation mapping

| Task | Requirements and rules | Acceptance/ADR | Components | Code and migration | Test | Evidence | Status |
|---|---|---|---|---|---|---|---|
| TASK-003 | FR-013, BR-003, BR-010, BR-017–BR-018, BR-025 | AC-009, AC-025; ADR-003, ADR-005 | PC-002, PC-007 | Prisma schema, generated initial migration, disposable migrated-database utility | TEST-003 | EVID-419–EVID-428 | ✅ PASS |

| Trace item | TASK-003 evidence | Remaining coverage |
|---|---|---|
| FR-013 / AC-009 | Four migrated relational models persist the approved data shapes | Repository/reload behavior continues in TASK-005 and TASK-008–TASK-009 |
| BR-003 | Vocabulary requires a restrictive Folder foreign key | Folder/vocabulary services begin in TASK-004–TASK-005 |
| BR-010 | Session count columns and atomic session/answers transaction foundation | Count equality is enforced by TASK-008 application logic |
| BR-017–BR-018 | Composite same-folder uniqueness with cross-folder allowance verified | Normalization/rejection messages begin in TASK-005 |
| BR-025 | Schema represents completed sessions only; no draft persistence model exists | Completion workflow begins in TASK-008 |
| AC-025 / ADR-003 / ADR-005 | Real migration replay and failed-answer transaction rollback preserve consistency | Feature-specific failure consistency continues in later tasks |

TASK-004 through TASK-022 remain `NOT STARTED`; no code or test evidence is claimed for them.

## Business-rule mapping

| Business rule | Acceptance criteria | Status |
|---|---|---|
| BR-001–BR-003 | AC-001–AC-002, AC-004 | Defined |
| BR-004–BR-006 | AC-003 | Defined |
| BR-007–BR-009 | AC-005–AC-007 | Defined |
| BR-010–BR-011 | AC-008–AC-009 | Defined |
| BR-012–BR-013 | AC-011–AC-012, AC-025 | Defined |
| BR-014 | AC-023 | Defined |
| BR-015–BR-016 | AC-001–AC-002, AC-009, AC-023 | Defined from OQ-001–OQ-002 |
| BR-017–BR-020 | AC-002–AC-003 | Defined from OQ-003–OQ-004 |
| BR-021–BR-022 | AC-004–AC-005 | Defined from OQ-005 |
| BR-023–BR-024 | AC-006–AC-007 | Defined from OQ-006 |
| BR-025–BR-026 | AC-008–AC-009 | Defined from OQ-007 |
| BR-027–BR-028 | AC-011–AC-012 | Defined from OQ-008 |

## Open-decision mapping

| Open question | Affected area | Status |
|---|---|---|
| OQ-001 | User model, persistence, security | ✅ Resolved → BR-015 |
| OQ-002 | Validation limits | ✅ Resolved → BR-016 |
| OQ-003 | Duplicate identity/action | ✅ Resolved → BR-017–BR-018 |
| OQ-004 | CSV schema/atomicity | ✅ Resolved → BR-019–BR-020 |
| OQ-005 | IPA/audio source | ✅ Resolved → BR-021–BR-022 |
| OQ-006 | Flashcard/test mechanics | ✅ Resolved → BR-023–BR-024 |
| OQ-007 | Sessions/dashboard | ✅ Resolved → BR-025–BR-026 |
| OQ-008 | AI provider/storage | ✅ Resolved → BR-027–BR-028 |
