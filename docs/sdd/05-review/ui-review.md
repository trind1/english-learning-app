# UI/UX Review

| Field | Value |
| --- | --- |
| Document | UI/UX review |
| Stage | Code Review — UI remediation planning |
| Owner | UI/UX Reviewer and Frontend Reviewer |
| Status | ❌ FAIL — remediation required |
| Version | 1.0 |
| Last updated | 2026-08-28 |
| Depends on | [Approved HTML designs](../../../UI), [review report](review-report.md), [project status](../status.md) |
| Next review | UI remediation implementation and verification |

> This review compares the current React interface with the approved HTML files in `UI/`. The app source was not changed. The live dashboard was inspected at 1440, 1280, 1024, 768, 390, and 375 pixels; the remaining pages were inspected from their React implementation and approved HTML because the available browser session could not navigate through the complete stateful workflow. Six major and five minor findings require remediation before visual acceptance.

## Review scope and evidence

| Evidence ID | Activity | Result |
| --- | --- | --- |
| EVID-513 | `git status --short` from the repository root | Exit code 0; clean worktree before documentation changes. |
| EVID-514 | `npm run dev` from the repository root | A second copy did not start: ports 3000 and 5173 were already in use. The already-running application was reachable at `http://127.0.0.1:5173/`; its dashboard API returned live data. |
| EVID-515 | Headless Chrome screenshots of the running dashboard at 1440×900, 1280×900, 1024×900, 768×900, 390×844, and 375×844 | Rendered dashboard inspected. Desktop screenshots show a horizontal scrollbar; 768px and smaller hide the sidebar with no replacement navigation. |
| EVID-516 | Read-only comparison of `UI/*.html`, `apps/web/src/*.tsx`, and `apps/web/src/styles.css` | Identified structural, page-fidelity, accessibility, responsive, and maintainability differences listed below. |

### Limitation

The live browser captured the default dashboard only. The current app uses in-memory view state rather than URLs, and the available review session did not complete the stateful flows required to capture every page. Findings for Login, Register, Vocabulary, Practice, Flashcards, Multiple Choice, and AI Generator are therefore source-assisted comparisons, not claims of full interactive visual verification. The required full browser workflow remains separately blocked in the existing Final Acceptance record.

## Findings

| Finding ID | Severity | Page | Current behavior | Expected behavior | Evidence | Recommended remediation |
| --- | --- | --- | --- | --- | --- | --- |
| UI-FIND-001 | MAJOR | Shared navigation | At 768px and below, `.side-navbar` is hidden and no menu button, drawer, or bottom navigation is rendered. Learners cannot reach Dashboard, Vocabulary, Practice, Progress, Start Lesson, Settings, or Help after changing page size. | Preserve the approved navigation structure through an accessible mobile representation. | EVID-515; `styles.css` responsive rules. | Add one responsive navigation pattern that preserves the approved order, groups, active state, and Start Lesson CTA. |
| UI-FIND-002 | MAJOR | Dashboard | The page header says “Welcome back,” then `Dashboard` renders a second “Welcome back!” section. The approved dashboard has one personalized welcome block and topic-folder content. | One coherent dashboard hierarchy matching `UI/dashboard.html`, without duplicate welcome text. | EVID-515; `Dashboard.tsx`; `UI/dashboard.html`. | Give dashboard ownership of its heading or remove the duplicate child heading; align its sections with the approved hierarchy. |
| UI-FIND-003 | MAJOR | Dashboard / shared shell | At 1440, 1280, and 1024 pixels, the live page has a horizontal scrollbar. The fixed 256px sidebar and `width: calc(100% - 256px)` content sizing use the viewport width while the vertical scrollbar reduces the layout viewport. | No horizontal overflow at any required viewport. | EVID-515; `main-wrapper` sizing in `styles.css`. | Make shell sizing scrollbar-safe and add viewport overflow checks. |
| UI-FIND-004 | MAJOR | Vocabulary | The approved manager presents vocabulary controls, searchable/filterable table rows, edit controls, and a modal. The React page instead combines a folder detail, card list, manual-add panel, CSV panel, and AI panel. Its layout and action hierarchy do not match the approved `UI/vocabulary.html`. | Render the approved Vocabulary Manager hierarchy while retaining approved API behavior. | EVID-516; `VocabularyPanel.tsx`, `CsvImportPanel.tsx`, `AiPanel.tsx`, `UI/vocabulary.html`. | Recompose the vocabulary screen around the approved header, list/table, primary actions, and edit interaction; keep import and manual add accessible. |
| UI-FIND-005 | MAJOR | Practice / AI Generator | Practice includes a free-text word input even though the approved workflow leads to vocabulary selection. The dedicated AI page is implemented as a generic story canvas plus side panel, not the approved generator composition and result state. | Practice should provide the approved three-mode entry flow; AI Generator should show selected-word state, maximum-ten guidance, Generate CTA, and approved result layout. | EVID-516; `PracticeHub.tsx`, `AiPanel.tsx`, `UI/practice.html`, `UI/ai_generator.html`. | Separate entry and generator presentation responsibilities; use the current selected vocabulary model for the approved selection UI. |
| UI-FIND-006 | MAJOR | Flashcards / Multiple Choice | Focus screens use a generic “Back to folder” page header. Flashcards contain extra score and scheduling controls; quiz lacks the approved correct/incorrect answer feedback state and its reference shell differs substantially. | Match the task-focused approved flashcard and quiz structures, with clear progress, answer feedback, next action, and result state. | EVID-516; `Flashcards.tsx`, `TestSession.tsx`, `App.tsx`, `UI/flashcard.html`, `UI/multi_choice.html`. | Align focus headers, card dimensions, controls, and state styling without changing quiz or flashcard business logic. |
| UI-FIND-007 | MINOR | Login / Register | React login and register forms add social sign-in controls and supporting copy not present in the approved visual specification. Login structure also differs from the reference treatment. | Use the approved form composition and visual hierarchy; do not introduce unimplemented sign-in paths. | EVID-516; `Login.tsx`, `Register.tsx`, `UI/login.html`, `UI/register.html`. | Remove or visually de-emphasize unsupported social controls and align spacing, field order, and auth-page composition. |
| UI-FIND-008 | MINOR | Shared shell | The top bar correctly limits content to notifications and profile, and the dropdown correctly has Information and Log out. However, its interaction lacks keyboard menu navigation, Escape-to-close, focus placement, and focus return. | Accessible profile menu behavior, while keeping exactly the approved controls and menu items. | EVID-516; `App.tsx`. | Implement menu keyboard interaction and dialog focus management as part of accessibility remediation. |
| UI-FIND-009 | MINOR | Shared shell | Material Symbols and web fonts are remote-only. In the live review environment they did not load, leaving the notification control visually blank and sidebar icons absent. | Core icons and typography should remain legible when remote font delivery fails. | EVID-515; `apps/web/index.html`. | Bundle or provide a semantic visual fallback for essential icons; verify with a network-constrained browser run. |
| UI-FIND-010 | MINOR | Shared UI code | Layout is split across many inline style objects in `App.tsx` and feature components. `PageHeader` overlaps feature-owned headings, making visual ownership and responsive changes difficult. | Reusable shell and page primitives with centralized responsive styles and visual tokens. | EVID-516; `App.tsx`, `Dashboard.tsx`, `Flashcards.tsx`, `TestSession.tsx`, `AiPanel.tsx`, `styles.css`. | Extract only repeated shell/page patterns and move repeated responsive presentation out of inline styles. |
| UI-FIND-011 | MINOR | Flashcards / quiz | Cards are clickable `<div>` elements or pressed buttons without the same semantics as the reference’s clearly labelled task controls. Quiz selected state is available, but correctness is only known after the entire session. | Keyboard-operable cards and clear, timely status feedback consistent with the approved visual states. | EVID-516; `Flashcards.tsx`, `TestSession.tsx`. | Use semantic controls and expose selection, feedback, and progress through accessible labels/status text. |

## Page comparison summary

| Page | Result | Material review conclusion |
| --- | --- | --- |
| Login | Remediation required | Form works structurally, but extra social controls and differing composition depart from the approved design. |
| Register | Remediation required | Field order is close, but the implementation needs an approved-design fidelity pass and removal of unsupported social paths. |
| Dashboard | Remediation required | Live inspection found duplicate hierarchy and horizontal overflow; approved topic-folder hierarchy is absent. |
| Vocabulary | Remediation required | The feature exists, but its composition is materially different from the approved manager design. |
| Practice | Remediation required | Three modes exist and are correctly outside permanent navigation, but the AI entry interaction differs from the approved workflow. |
| Flashcard | Remediation required | Progress and pronunciation exist, but focus layout and controls differ from the approved task screen. |
| Multiple Choice | Remediation required | Question, progress, options, and result exist, but approved feedback and visual state presentation are incomplete. |
| AI Generator | Remediation required | Maximum-ten selection exists, but hierarchy, selected state, CTA, and result presentation do not match the approved page. |

## Navigation and accessibility outcome

Desktop navigation preserves the required order and keeps Flashcard, Multiple Choice, and AI Generator out of the permanent sidebar. The top-right area contains only notifications and Profile, and its dropdown contains only Information and Log out. These approved constraints must be retained during remediation.

The principal accessibility defects are the missing responsive navigation, incomplete profile-menu keyboard behavior, remote-only essential icon rendering, and non-semantic interactive flashcard surface. Existing labels, skip link, button focus styles, pronunciation label, and status/error roles are useful foundations, but do not close these findings.

## Completion report

STAGE: Code Review — UI remediation planning

STATUS: ❌ FAIL — UI Review COMPLETE; UI Remediation PLANNED / NOT STARTED.

FILES_CREATED: `docs/sdd/05-review/ui-review.md`; `docs/sdd/05-review/ui-remediation-plan.md`.

FILES_MODIFIED: `docs/sdd/status.md`; `docs/sdd/index.md`; `docs/sdd/traceability.md`; `docs/sdd/05-review/verification.md`.

VERIFICATION_COMMANDS: `git status --short`; `npm run dev`; live HTTP checks for `http://127.0.0.1:5173/` and dashboard API; headless Chrome screenshots at 1440, 1280, 1024, 768, 390, and 375 pixels; read-only source and approved-HTML comparison.

VERIFICATION_RESULTS: EVID-513 through EVID-516 recorded above. The app rendered its default dashboard; full stateful page navigation was NOT RUN in the browser.

EVIDENCE: EVID-513–EVID-516.

OPEN_QUESTIONS: Can the planned changes satisfy the approved HTML designs at all required viewport sizes without changing the approved feature/API behavior?

NEXT_ALLOWED_ACTION: Obtain explicit user approval for the separate UI remediation task set, then implement tasks sequentially.

USER_APPROVAL_REQUIRED: Yes.
