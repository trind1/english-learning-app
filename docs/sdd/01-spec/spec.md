# English Learning App — Product Specification

| Field | Value |
|---|---|
| Document | Product specification |
| Stage | Specification |
| Owner | Business Analyst |
| Status | ✅ PASS |
| Version | 0.3 |
| Last updated | 2026-08-26 |
| Depends on | [Repository instructions](../../../AGENTS.md), [SDD dashboard](../index.md) |
| Next review | Planning |

> **Executive summary**
>
> This specification defines a beginner-friendly application for organizing, learning, testing, and tracking English vocabulary. All original capabilities are represented by traceable requirements and acceptance criteria. OQ-001–OQ-008 were explicitly confirmed by the user on 2026-08-26 and are now approved product rules; Specification Verification is the next gate.

## Table of contents

- [Product vision](#product-vision)
- [Problem statement](#problem-statement)
- [Target users](#target-users)
- [Goals and scope](#goals-and-scope)
- [User journeys](#user-journeys)
- [Functional requirements](#functional-requirements)
- [Non-functional requirements](#non-functional-requirements)
- [Business rules](#business-rules)
- [Detailed behavior](#detailed-behavior)
- [Acceptance criteria](#acceptance-criteria)
- [Approved decisions](#approved-decisions)
- [Risks](#risks)
- [Definition of done](#definition-of-done)

## Product vision

Provide one approachable place where an English learner can build a personal vocabulary collection, organize it by topic, practice it, check understanding, and see measurable progress.

## Problem statement

Vocabulary learners often split word entry, pronunciation, review, testing, and progress tracking across unrelated tools. This makes learning history hard to understand and increases repetitive data entry. The product must provide a coherent workflow while preserving valid learning data when optional services or individual operations fail.

## Target users

The primary user is a beginner or intermediate English learner who wants to manage a personal vocabulary collection from a desktop or mobile web browser. The user may have limited technical knowledge, may enter meanings in another language, and needs plain labels, clear validation, and recoverable errors.

## Goals and scope

### Product goals

- Make vocabulary entry and organization simple.
- Support active recall through flashcards and multiple-choice tests.
- Retain correct and incorrect results for every completed test session.
- Present useful progress totals without requiring manual calculation.
- Keep optional AI assistance separate from core learning functions.

### In scope

- A self-designed responsive web interface.
- Manual vocabulary creation with a word and meaning.
- CSV vocabulary import and topic folders.
- IPA display and pronunciation audio.
- Flashcard and multiple-choice learning modes.
- Correct and incorrect answer tracking by test session.
- A learning-progress dashboard.
- Optional AI-generated text using no more than ten selected vocabulary words.
- Frontend, REST API, persistent database, automated tests, and maintainable code.

### Out of scope

- Native mobile applications, social sharing, classrooms, or teacher administration.
- Speech recording or automatic pronunciation grading.
- Automatic translation or IPA accuracy guarantees.
- Spaced-repetition scheduling unless later approved.
- AI as a dependency for core learning functions.
- A technical plan, API contract, database schema, tasks, or source code in this stage.

## User journeys

| ID | Journey | Expected outcome |
|---|---|---|
| UJ-001 | Create a topic folder and manually enter a word, meaning, and optional IPA. | Valid vocabulary is stored in the selected folder. |
| UJ-002 | Import a CSV file into a topic folder. | Valid rows are imported and skipped rows receive row-level reasons. |
| UJ-003 | View IPA and request pronunciation. | The word is displayed and audio plays when supported; otherwise a recoverable message appears. |
| UJ-004 | Review a folder as flashcards. | Each card can reveal its meaning without changing stored data. |
| UJ-005 | Complete a multiple-choice test. | Every submitted answer is evaluated once and the completed session retains its results. |
| UJ-006 | Open the dashboard. | Stored vocabulary and completed-session metrics are summarized accurately. |
| UJ-007 | Select up to ten words and request AI-generated text. | Text is shown when available; failure does not affect core data or features. |

## Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | The system shall let the user create and view topic folders. | Must |
| FR-002 | The system shall let the user create vocabulary manually in a selected folder using a word and meaning, with IPA optional. | Must |
| FR-003 | The system shall partially import valid vocabulary from a CSV containing `word`, `meaning`, and optional `ipa` columns into a selected folder and report imported and skipped rows. | Must |
| FR-004 | The system shall display each item’s word, meaning, and IPA value or an explicit unavailable state. | Must |
| FR-005 | The system shall let the user request pronunciation audio for a vocabulary word. | Must |
| FR-006 | The system shall provide flashcard review for vocabulary in a selected folder. | Must |
| FR-007 | The system shall provide a randomized multiple-choice test when a folder contains at least four vocabulary items with distinct meanings. | Must |
| FR-008 | The system shall ask each eligible word once per test and present four distinct meaning choices: one correct and three from other eligible vocabulary. | Must |
| FR-009 | The system shall evaluate each submitted answer as correct or incorrect. | Must |
| FR-010 | The system shall retain answer outcomes for every completed test session and shall not retain an abandoned session. | Must |
| FR-011 | The system shall show a session summary with correct, incorrect, answered, and total-question counts. | Must |
| FR-012 | The system shall provide a progress dashboard derived from persisted folders, vocabulary, and completed sessions. | Must |
| FR-013 | The system shall persist folders, vocabulary, completed sessions, and answer records across reloads. | Must |
| FR-014 | The system shall present loading, success, empty, validation, and recoverable error states where applicable. | Must |
| FR-015 | The system shall optionally generate display-only, non-persisted text from a selection of one to ten vocabulary words. | Should |
| FR-016 | The system shall keep all core learning functions available when AI is unavailable or fails. | Must |

## Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-001 | The frontend test report shall independently achieve at least 95% statements coverage. |
| NFR-002 | The frontend test report shall independently achieve at least 95% branches coverage. |
| NFR-003 | The frontend test report shall independently achieve at least 95% functions coverage. |
| NFR-004 | The frontend test report shall independently achieve at least 95% lines coverage. |
| NFR-005 | The backend test report shall independently achieve at least 95% statements coverage. |
| NFR-006 | The backend test report shall independently achieve at least 95% branches coverage. |
| NFR-007 | The backend test report shall independently achieve at least 95% functions coverage. |
| NFR-008 | The backend test report shall independently achieve at least 95% lines coverage. |
| NFR-009 | Frontend and backend coverage shall be reported separately; a combined percentage shall not satisfy either threshold. |
| NFR-010 | Coverage exclusions require technical justification and shall not be made solely to increase coverage. |
| NFR-011 | Primary workflows shall work at a 320-pixel viewport without page-level horizontal scrolling. |
| NFR-012 | Workflows shall support keyboard use, visible focus, programmatic labels, and accessible status/error announcements. |
| NFR-013 | Text and essential controls shall meet WCAG 2.1 AA contrast expectations. |
| NFR-014 | The backend shall validate all untrusted input; frontend validation is not the security boundary. |
| NFR-015 | User-facing responses shall not expose stack traces, raw database errors, credentials, or secrets. |
| NFR-016 | The implementation shall separate UI, API, business logic, and persistence responsibilities. |
| NFR-017 | Persisted learning data shall remain consistent when an import, audio request, or AI request fails. |

## Business rules

The rules below include OQ-001–OQ-008, explicitly approved by the user on 2026-08-26.

| ID | Rule |
|---|---|
| BR-001 | A vocabulary item requires a non-blank word and non-blank meaning after trimming. |
| BR-002 | IPA is optional and must never be fabricated when absent. |
| BR-003 | Every vocabulary item belongs to one topic folder. |
| BR-004 | CSV import stores valid vocabulary records, not the uploaded file as the datastore. |
| BR-005 | An invalid CSV row shall not cause another row to be reported as imported unless that row was persisted. |
| BR-006 | Duplicate handling follows OQ-003; duplicates must never be silently overwritten. |
| BR-007 | Requesting pronunciation shall not modify vocabulary or progress. |
| BR-008 | Flashcard activity shall not count as a correct or incorrect test answer. |
| BR-009 | A multiple-choice submission shall be evaluated at most once for the active question. |
| BR-010 | For a completed session, `correct + incorrect = answered`, and `answered ≤ total questions`. |
| BR-011 | Dashboard values derive from persisted data and shall not double-count an answer or session. |
| BR-012 | AI generation accepts no fewer than one and no more than ten selected vocabulary words. |
| BR-013 | AI failure, timeout, or missing configuration shall not modify core learning data. |
| BR-014 | Secrets shall not appear in client code, committed environment files, logs, or user-facing errors. |
| BR-015 | The MVP is single-user and provides no authentication or multi-user data isolation. |
| BR-016 | After trimming, folder names are 1–50 characters, words 1–100, meanings 1–500, and optional IPA 0–100 characters. |
| BR-017 | A duplicate is the same trimmed, case-insensitive word in one folder; manual duplicates are rejected and CSV duplicates are skipped without overwrite. |
| BR-018 | The same normalized word may exist in different folders. |
| BR-019 | CSV headers are exactly `word`, `meaning`, and optional `ipa`; header order may vary, but unknown headers reject the file. |
| BR-020 | CSV import persists valid rows and skips invalid or duplicate rows; `word` and `meaning` are required and `ipa` is optional. |
| BR-021 | IPA is supplied by manual entry or CSV import; the system does not automatically infer or look it up. |
| BR-022 | Pronunciation uses browser speech synthesis and provides an accessible fallback when unsupported or failed. |
| BR-023 | Flashcard order is randomized when a review starts or restarts. |
| BR-024 | A test requires at least four vocabulary items with four distinct meanings, uses four distinct meaning choices, randomizes questions and choices, and asks each eligible word once. |
| BR-025 | Only completed sessions are persisted and included in dashboard metrics; abandoned sessions are not retained. |
| BR-026 | Dashboard accuracy is `correct / answered × 100`, rounded to one decimal place; zero answers display `0%`. |
| BR-027 | AI-generated text is display-only and is not persisted. |
| BR-028 | The AI provider and prompt design are architecture decisions deferred to Planning without changing the approved one-to-ten-word behavior. |

## Detailed behavior

### Validation rules

- Folder name, word, and meaning reject values blank after trimming.
- Apply the approved length limits in BR-016.
- Validation messages identify the affected field and corrective action.
- The backend repeats all trust-boundary validation even after frontend validation.
- Failed submission preserves safe input where practical and prevents accidental duplicate submission.

### CSV import behavior

- The user selects the destination folder before import.
- Accept the approved headers and required/optional columns in BR-019–BR-020.
- File/header failures are distinguished from individual row failures.
- Each row uses the same vocabulary validation as manual creation.
- Valid rows import while invalid or duplicate rows are skipped.
- Results show rows considered, imported, skipped, and a reason for each skipped row.
- Empty or header-only files create no blank vocabulary and produce an explicit result.
- Quoted commas are parsed as part of one field by a standards-compliant CSV parser.

### Duplicate vocabulary behavior

- Duplicate vocabulary is never silently overwritten.
- Duplicate identity and cross-folder behavior follow BR-017–BR-018.
- Manual conflicts return a clear message; imported conflicts are skipped and reported by row.

### IPA and audio behavior

- Cards display stored IPA or “IPA unavailable”; missing IPA is never guessed.
- IPA and audio follow BR-021–BR-022.
- Audio failure creates an accessible recoverable message and changes no stored data.

### Flashcard behavior

- Flashcards use vocabulary from one selected folder.
- One side shows the word and available IPA; the other shows the meaning.
- The user can reveal the hidden side and move through cards.
- Card order is randomized when review starts or restarts.
- Flashcard actions create no test answer records.

### Multiple-choice behavior

- Each question shows a word and multiple meaning choices with exactly one correct choice.
- Alternatives come from other eligible vocabulary, not invented text.
- Eligibility, choice count, question count, and ordering follow BR-024.
- If distinct choices cannot be formed, the test does not start and explains why.
- A submitted answer receives feedback and cannot be counted twice.

### Test-session tracking behavior

- Every answer belongs to one session and records whether the submitted selection was correct.
- A completed session retains enough information to reproduce all summary counts.
- Abandoned sessions are not persisted or counted; completed sessions are persisted and counted.
- Reloading does not erase a completed session or its outcomes.

### Dashboard behavior

- Show total folders, vocabulary, completed sessions, correct answers, incorrect answers, and accuracy.
- Accuracy is `correct / answered × 100`; when no answers exist, display `0%`.
- Accuracy is rounded to one decimal place; no time or folder filter is required for the MVP dashboard.
- Empty values appear as meaningful zeros with guidance to add vocabulary.

### Optional AI text-generation behavior

- The user explicitly selects one to ten vocabulary words.
- The request contains only selected vocabulary needed for generation.
- Generated text is identified as AI-generated and may be retried.
- Generated text is not persisted; provider and prompt design are deferred architecture decisions under BR-028.
- AI failure is recoverable and does not block core workflows.

### Error and empty states

| Context | Required behavior |
|---|---|
| No folders | Explain the empty state and offer folder creation. |
| Empty folder | Offer manual entry and CSV import. |
| No completed tests | Show zero metrics rather than missing values. |
| Missing IPA | Show “IPA unavailable.” |
| Invalid form | Identify invalid fields, retain safe input, and persist nothing invalid. |
| CSV file/header failure | Import no rows and explain correction. |
| CSV row failure | Report actual row outcomes according to the approved import rule. |
| Ineligible test | Do not start; explain the exact eligibility issue. |
| API/persistence failure | Show a safe retry message and do not claim success. |
| Audio/AI failure | Show a recoverable message and leave learning data unchanged. |
| Loading | Announce work and prevent duplicate submissions until completion or failure. |

### Security and data handling

- Form, file, route, and external-service input is untrusted and backend-validated.
- CSV content is not executed or rendered as trusted markup.
- User text is escaped or rendered as text to prevent script injection.
- Raw persistence errors and stack traces are never returned to users.
- Real credentials/local environment files are excluded from Git; `.env.example` contains placeholders only.
- The frontend never accesses the database directly.
- Future schema changes use reviewed migrations, never undocumented manual edits.
- The approved MVP is single-user without authentication; multi-user isolation is out of scope.

## Acceptance criteria

| ID | Covers | Given / When / Then |
|---|---|---|
| AC-001 | FR-001, BR-003, BR-016 | **Given** a unique trimmed folder name of 1–50 characters, **when** created, **then** the folder persists and appears; blank, over-limit, or duplicate input produces a specific message. |
| AC-002 | FR-002, BR-001–003, BR-016–BR-018 | **Given** valid word/meaning and optional IPA, **when** saved, **then** vocabulary persists in the selected folder; over-limit or same-folder duplicate data does not, while the same word remains allowed in another folder. |
| AC-003 | FR-003, BR-004–006, BR-017, BR-019–BR-020 | **Given** approved CSV headers and mixed-validity rows, **when** import completes, **then** valid rows persist, invalid/duplicate rows are skipped with reasons, and unknown headers reject the file. |
| AC-004 | FR-004, BR-002 | **Given** vocabulary with/without IPA, **when** displayed, **then** word, meaning, and IPA or “IPA unavailable” appear. |
| AC-005 | FR-005, BR-007, BR-021–BR-022 | **Given** browser speech synthesis, **when** requested, **then** the word plays; unsupported/failure shows an accessible fallback and changes no data. |
| AC-006 | FR-006, BR-008, BR-023 | **Given** folder vocabulary, **when** flashcards start or restart, **then** cards are randomized and word/IPA and meaning can be revealed without recording test answers. |
| AC-007 | FR-007–009, BR-009, BR-024 | **Given** at least four items with distinct meanings, **when** a randomized test runs, **then** every eligible word is asked once with four distinct choices and each answer is counted once. |
| AC-008 | FR-010–011, BR-010, BR-025 | **Given** a completed test, **when** summarized, **then** outcomes persist and `correct + incorrect = answered = total`; an abandoned session is not retained. |
| AC-009 | FR-012–013, BR-011, BR-025–BR-026 | **Given** persisted completed sessions, **when** the dashboard loads/reloads, **then** metrics exclude abandoned sessions, avoid double counting, and show one-decimal accuracy or `0%`. |
| AC-010 | FR-014 | **Given** a pending, empty, invalid, successful, or failed operation, **when** state changes, **then** the UI truthfully presents it and an appropriate action. |
| AC-011 | FR-015, BR-012, BR-027–BR-028 | **Given** one to ten selected words, **when** AI succeeds, **then** identified display-only text appears without persistence; zero or over ten is rejected. |
| AC-012 | FR-016, BR-013 | **Given** AI failure/unavailability, **when** requested, **then** retry guidance appears and core functions/data remain unaffected. |
| AC-013 | NFR-001 | Frontend statements coverage measured by its successful coverage command is at least 95%. |
| AC-014 | NFR-002 | Frontend branches coverage measured by its successful coverage command is at least 95%. |
| AC-015 | NFR-003 | Frontend functions coverage measured by its successful coverage command is at least 95%. |
| AC-016 | NFR-004 | Frontend lines coverage measured by its successful coverage command is at least 95%. |
| AC-017 | NFR-005 | Backend statements coverage measured by its successful coverage command is at least 95%. |
| AC-018 | NFR-006 | Backend branches coverage measured by its successful coverage command is at least 95%. |
| AC-019 | NFR-007 | Backend functions coverage measured by its successful coverage command is at least 95%. |
| AC-020 | NFR-008 | Backend lines coverage measured by its successful coverage command is at least 95%. |
| AC-021 | NFR-009–010 | Coverage evidence reports applications separately and documents legitimate exclusions. |
| AC-022 | NFR-011–013 | Primary journeys remain usable at 320 pixels and by keyboard with labels, focus, status announcements, and AA contrast. |
| AC-023 | NFR-014–015, BR-014 | Invalid/malicious input is rejected without exposing internal errors, credentials, or secrets. |
| AC-024 | NFR-016 | Review confirms separated responsibilities and no open Critical/High maintainability finding. |
| AC-025 | NFR-017 | Import/audio/AI failures leave previously valid stored learning data consistent and readable. |

## Approved decisions

The user explicitly confirmed OQ-001–OQ-008 as proposed on 2026-08-26. Their behavior is incorporated into BR-015–BR-028.

| ID | Area | Approved decision | Status |
|---|---|---|---|
| OQ-001 | Users | Single-user MVP without authentication. | ✅ Resolved |
| OQ-002 | Limits | Folder 1–50; word 1–100; meaning 1–500; IPA 0–100 characters after trimming. | ✅ Resolved |
| OQ-003 | Duplicates | Same trimmed case-insensitive word in one folder is duplicate; reject manual and skip CSV duplicates; allow across folders. | ✅ Resolved |
| OQ-004 | CSV | Headers `word,meaning,ipa`; first two required; IPA optional; unknown headers reject file; valid rows persist while invalid rows skip. | ✅ Resolved |
| OQ-005 | IPA/audio | IPA is entered/imported; audio uses browser speech synthesis with an accessible fallback. | ✅ Resolved |
| OQ-006 | Learning | Randomized cards/questions; tests require four distinct meanings, use four choices, and ask each eligible word once. | ✅ Resolved |
| OQ-007 | Progress | Only completed sessions count; abandoned sessions are not retained; accuracy rounds to one decimal. | ✅ Resolved |
| OQ-008 | AI | Generated text is display-only; provider and prompt design are selected during Planning. | ✅ Resolved |

## Risks

| ID | Risk | Mitigation |
|---|---|---|
| RISK-001 | Approved behavior could be changed silently during Planning. | Preserve BR-015–BR-028 and require explicit change approval. |
| RISK-002 | Audio differs by browser/device. | Approve and verify the OQ-005 fallback. |
| RISK-003 | Repeated meanings can prevent valid distractors. | Approve eligibility rules and show an ineligible state. |
| RISK-004 | AI privacy, latency, cost, and availability vary. | Keep AI optional and decide provider/data handling in Planning. |
| RISK-005 | Eight separate 95% thresholds require deliberate testability. | Preserve thresholds through Planning, Tasks, and separate commands. |

## Definition of done

- Every original capability maps to an FR, NFR, BR, or AC.
- OQ-001–OQ-008 remain recorded as resolved and mapped to BR-015–BR-028.
- Specification Verification is rerun with actual evidence and reaches `PASS`.
- The user explicitly approves Specification before Planning.

No technical plan, tasks, API contract, database design, dependencies, or source code is authorized by this document.
