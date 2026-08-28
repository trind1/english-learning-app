# UI Remediation Plan

| Field | Value |
| --- | --- |
| Document | UI remediation plan |
| Stage | Code Review — UI remediation planning |
| Owner | Frontend Developer and UI/UX Reviewer |
| Status | ⚪ NOT STARTED |
| Version | 1.0 |
| Last updated | 2026-08-28 |
| Depends on | [UI/UX review](ui-review.md), [approved HTML designs](../../../UI) |
| Next review | User approval for implementation |

> This is a separate remediation task set. It does not replace historical TASK-001 through TASK-022, does not change APIs or business rules, and is not implementation authorization. Execute tasks in order after explicit user approval, retaining the approved sidebar and profile-menu constraints.

## Execution order

| Order | Task | Priority | Findings addressed | Complexity |
| ---: | --- | --- | --- | --- |
| 1 | UI-REM-001 | P0 | UI-FIND-001, UI-FIND-003, UI-FIND-009 | Medium |
| 2 | UI-REM-002 | P0 | UI-FIND-002, UI-FIND-010 | Medium |
| 3 | UI-REM-003 | P1 | UI-FIND-004 | Large |
| 4 | UI-REM-004 | P1 | UI-FIND-005 | Medium |
| 5 | UI-REM-005 | P1 | UI-FIND-006, UI-FIND-011 | Medium |
| 6 | UI-REM-006 | P2 | UI-FIND-007 | Medium |
| 7 | UI-REM-007 | P2 | UI-FIND-008, UI-FIND-009, UI-FIND-010 | Medium |
| 8 | UI-REM-008 | P0 | All applicable findings | Medium |

## Tasks

### UI-REM-001 — Repair the responsive application shell

| Field | Value |
| --- | --- |
| Priority | P0 |
| Findings addressed | UI-FIND-001, UI-FIND-003, UI-FIND-009 |
| Requirements / rules | NFR-011–NFR-013, AC-010, AC-022; approved shared navigation in `UI/` |
| Objective | Remove horizontal overflow and provide an accessible mobile representation of the approved navigation. |
| Exact scope | Make the desktop shell scrollbar-safe; preserve the sidebar item order and groups; add one mobile navigation control/presentation with Dashboard, Vocabulary, Practice, Progress, Start Lesson, Settings, and Help. Keep focus screens intentionally separate. Provide a fallback for essential navigation and notification icons. |
| Likely files/components | `apps/web/src/App.tsx`, `apps/web/src/styles.css`, `apps/web/index.html`, focused frontend tests. |
| Dependencies | None. |
| Implementation guidance | Use shared classes rather than one-off widths. The mobile navigation must not add Flashcard, Multiple Choice, or AI Generator as permanent items. |
| Verification steps | Run frontend tests and browser checks at 1440, 1280, 1024, 768, 390, and 375 pixels; assert no horizontal overflow and keyboard reachability. |
| Acceptance criteria | Every approved navigation destination is available at all required widths; no horizontal scrollbar is introduced; essential icons remain understandable if remote fonts fail. |
| Estimated complexity | Medium |

### UI-REM-002 — Align the dashboard hierarchy and shared page header

| Field | Value |
| --- | --- |
| Priority | P0 |
| Findings addressed | UI-FIND-002, UI-FIND-010 |
| Requirements / rules | FR-012–FR-014, NFR-011–NFR-013, AC-009–AC-010; `UI/dashboard.html` |
| Objective | Remove duplicate headings and match the approved dashboard hierarchy. |
| Exact scope | Establish a single owner for dashboard welcome content; align progress, consistency, metrics, and topic-folder presentation with `UI/dashboard.html`; retain live dashboard data and existing actions. |
| Likely files/components | `apps/web/src/App.tsx`, `apps/web/src/Dashboard.tsx`, `apps/web/src/styles.css`, dashboard tests. |
| Dependencies | UI-REM-001. |
| Implementation guidance | Do not fabricate personalized or streak data. Use neutral approved-design wording when live data is unavailable. |
| Verification steps | Test loading/error/data states; compare desktop and mobile screenshots with the approved dashboard. |
| Acceptance criteria | Exactly one dashboard welcome hierarchy is rendered; layout has no overflow; content hierarchy visibly matches the approved source without changing API requests. |
| Estimated complexity | Medium |

### UI-REM-003 — Align the Vocabulary Manager

| Field | Value |
| --- | --- |
| Priority | P1 |
| Findings addressed | UI-FIND-004 |
| Requirements / rules | FR-002–FR-005, FR-014, NFR-011–NFR-013, AC-002–AC-005, AC-010; `UI/vocabulary.html` |
| Objective | Present existing vocabulary behavior in the approved Vocabulary Manager design. |
| Exact scope | Align header, vocabulary list/table, Word, Meaning, IPA, pronunciation, manual add, CSV import, actions, spacing, empty/error/success states, and edit presentation. Keep current folder-scoped API and validation. |
| Likely files/components | `apps/web/src/App.tsx`, `VocabularyPanel.tsx`, `CsvImportPanel.tsx`, `PronunciationButton.tsx`, `styles.css`, vocabulary/import tests. |
| Dependencies | UI-REM-001 and UI-REM-002. |
| Implementation guidance | Do not expose database errors or change CSV/API contracts. If the reference includes nonimplemented editing, present only behavior authorized by the approved specification or record a separate requirements decision. |
| Verification steps | Test manual add, pronunciation, CSV import, validation, empty, error, and responsive states; inspect at all required widths. |
| Acceptance criteria | Existing vocabulary functions remain accessible and the page visually follows `UI/vocabulary.html`; unsupported actions are not misleading. |
| Estimated complexity | Large |

### UI-REM-004 — Align Practice and AI Generator flows

| Field | Value |
| --- | --- |
| Priority | P1 |
| Findings addressed | UI-FIND-005 |
| Requirements / rules | FR-006–FR-009, FR-015–FR-016, NFR-011–NFR-013, AC-006–AC-007, AC-011–AC-012; `UI/practice.html`, `UI/ai_generator.html` |
| Objective | Match the approved practice entry and AI generator layouts without moving practice modes into the sidebar. |
| Exact scope | Rework the three practice cards, selected-vocabulary state, maximum-ten indication, Generate CTA, generated result, spacing, empty/error/loading states, and mobile composition. |
| Likely files/components | `PracticeHub.tsx`, `AiPanel.tsx`, `App.tsx`, `styles.css`, practice and AI tests. |
| Dependencies | UI-REM-001. |
| Implementation guidance | Keep the existing selection limit and AI API boundary. Do not use free-text input as a substitute for selected vocabulary unless the approved requirements explicitly permit it. |
| Verification steps | Test zero, one, ten, and attempted eleven selected words; generate success/error; compare to both approved HTML pages at required widths. |
| Acceptance criteria | The Practice flow leads to Flashcard, Multiple Choice, and AI Generator; AI visibly communicates selection and limit and matches the approved visual hierarchy. |
| Estimated complexity | Medium |

### UI-REM-005 — Align task-focused flashcard and quiz screens

| Field | Value |
| --- | --- |
| Priority | P1 |
| Findings addressed | UI-FIND-006, UI-FIND-011 |
| Requirements / rules | FR-004–FR-011, NFR-011–NFR-013, AC-004–AC-009; `UI/flashcard.html`, `UI/multi_choice.html` |
| Objective | Match approved flashcard and multiple-choice task screens with accessible controls and states. |
| Exact scope | Align focus headers, progress, card sizing, IPA/pronunciation, reveal state, quiz options, selected/correct/incorrect feedback, next action, and results. |
| Likely files/components | `Flashcards.tsx`, `TestSession.tsx`, `App.tsx`, `styles.css`, flashcard and test-session tests. |
| Dependencies | UI-REM-001. |
| Implementation guidance | Preserve the existing test-session submission model. If immediate correctness feedback would change approved business behavior, stop and request a requirements decision rather than infer it. |
| Verification steps | Keyboard and pointer test all controls; inspect front/revealed cards, quiz selection/results, and narrow layouts. |
| Acceptance criteria | Controls are semantic and keyboard-operable; the approved task hierarchy and visible states are represented without altering scoring or persistence behavior. |
| Estimated complexity | Medium |

### UI-REM-006 — Align Login and Register pages

| Field | Value |
| --- | --- |
| Priority | P2 |
| Findings addressed | UI-FIND-007 |
| Requirements / rules | FR-014, NFR-011–NFR-013, AC-010; `UI/login.html`, `UI/register.html` |
| Objective | Match both approved authentication pages and remove misleading unimplemented paths. |
| Exact scope | Align layout, field order, sizing, typography, spacing, validation presentation, buttons, and mobile composition. |
| Likely files/components | `Login.tsx`, `Register.tsx`, `styles.css`, login/register tests. |
| Dependencies | UI-REM-001. |
| Implementation guidance | Do not add authentication providers or modify login behavior. |
| Verification steps | Test form validation and transitions; compare 1440, 768, 390, and 375 screenshots to approved HTML. |
| Acceptance criteria | Auth pages follow their approved layouts and show no nonfunctional sign-in affordance. |
| Estimated complexity | Medium |

### UI-REM-007 — Complete accessibility and maintainability hardening

| Field | Value |
| --- | --- |
| Priority | P2 |
| Findings addressed | UI-FIND-008, UI-FIND-009, UI-FIND-010 |
| Requirements / rules | FR-014, NFR-011–NFR-013, NFR-016, AC-010, AC-024; approved shared shell constraints |
| Objective | Make shared UI behavior keyboard-accessible and easier to maintain after visual alignment. |
| Exact scope | Add profile-menu keyboard operation and dialog focus handling; centralize repeated shell/page styles; retain visual tokens and focus states. |
| Likely files/components | `App.tsx`, shared UI components created only if repetition warrants them, `styles.css`, frontend tests. |
| Dependencies | UI-REM-001 through UI-REM-006. |
| Implementation guidance | Keep the profile control set exactly to Notifications and Profile, and the dropdown items exactly to Information and Log out. Avoid architecture changes unrelated to UI consistency. |
| Verification steps | Keyboard traversal, Escape, outside click, focus return, screen-reader labels, typecheck, lint, formatting, and frontend tests. |
| Acceptance criteria | Shared UI passes keyboard interaction checks and repeated visual layout is owned by maintainable shared primitives. |
| Estimated complexity | Medium |

### UI-REM-008 — Run final visual and responsive verification

| Field | Value |
| --- | --- |
| Priority | P0 |
| Findings addressed | All applicable findings |
| Requirements / rules | NFR-001–NFR-010, NFR-011–NFR-013, NFR-016, AC-010, AC-013–AC-022; all approved `UI/` pages |
| Objective | Produce auditable evidence that remediation matches approved designs without regressions. |
| Exact scope | Run the full real-browser workflow, inspect Login, Register, Dashboard, Vocabulary, Practice, Flashcards, Multiple Choice, and AI Generator at all required viewports, then rerun frontend tests, separate coverage, static checks, and build. |
| Likely files/components | Tests and SDD evidence/report artifacts only unless a new defect is found. |
| Dependencies | UI-REM-001 through UI-REM-007. |
| Implementation guidance | Record exact commands, exit codes, screenshots, observed behavior, and limitations. Do not mark any remediation task PASS if a visual mismatch, failing test, or sub-95% frontend coverage remains. |
| Verification steps | `npm run test:web`; `npm run coverage:web`; `npm run typecheck`; `npm run lint`; `npm run format:check`; `npm run build`; full browser workflow and required viewport review. |
| Acceptance criteria | All approved pages and shared navigation pass visual, responsive, and accessibility review; required frontend coverage is independently at least 95% for statements, branches, functions, and lines. |
| Estimated complexity | Medium |

## Approval boundary

Implementation of this plan requires explicit user approval. The first allowable implementation action after approval is UI-REM-001 only.
