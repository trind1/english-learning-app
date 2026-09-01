# REST API Contract

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| Document     | REST API contract                                                |
| Stage        | Planning                                                         |
| Owner        | Backend Lead                                                     |
| Status       | ✅ PASS                                                          |
| Version      | 0.1                                                              |
| Last updated | 2026-08-26                                                       |
| Depends on   | [Specification](../01-spec/spec.md), [Data model](data-model.md) |
| Next review  | Explicit user approval of Planning                               |

> **Executive summary**
>
> The versioned JSON API owns validation, scoring, persistence, and safe errors. CSV is the only multipart input. Test drafts are signed and temporary; only verified completed sessions are stored.

## Conventions

- Base path: `/api/v1`.
- JSON requests/responses use UTF-8 and `camelCase` fields.
- IDs are opaque strings; clients never infer database structure.
- Success bodies use `{ "data": ... }`; import additionally returns a report within `data`.
- Dates use ISO 8601 UTC strings.
- Unknown fields are rejected for mutation bodies.
- `requestId` correlates safe client errors with server logs.

## Error format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Review the highlighted values.",
    "fieldErrors": [
      { "path": "word", "message": "Word must contain 1 to 100 characters." }
    ],
    "requestId": "opaque-request-id"
  }
}
```

| Status | Code examples                                                                        | Meaning                                            |
| -----: | ------------------------------------------------------------------------------------ | -------------------------------------------------- |
|    400 | `VALIDATION_ERROR`, `CSV_HEADER_INVALID`, `CSV_FILE_INVALID`                         | Request cannot be processed as supplied            |
|    404 | `FOLDER_NOT_FOUND`, `VOCABULARY_NOT_FOUND`                                           | Resource does not exist                            |
|    409 | `FOLDER_DUPLICATE`, `VOCABULARY_DUPLICATE`, `TEST_INELIGIBLE`, `TEST_SNAPSHOT_STALE` | Valid shape conflicts with current state           |
|    413 | `CSV_TOO_LARGE`                                                                      | Upload exceeds configured limit                    |
|    422 | `TEST_SUBMISSION_INVALID`                                                            | Well-formed completion violates test invariants    |
|    503 | `AI_UNAVAILABLE`                                                                     | Optional AI is disabled or temporarily unavailable |
|    500 | `INTERNAL_ERROR`                                                                     | Safe generic unexpected error                      |

Raw Zod, Prisma, stack, provider, token, and secret details never appear in responses.

## Folder endpoints

### `GET /folders`

Returns `{ data: { folders: FolderSummary[] } }`; empty result is `folders: []` with `200`.

### `POST /folders`

Request: `{ "name": "Travel" }`. Backend trims, validates 1–50, derives `normalizedName`, and returns `201`. Duplicate normalized name returns `409 FOLDER_DUPLICATE`.

### `GET /folders/:folderId`

Returns folder metadata and vocabulary count or `404`.

## Vocabulary endpoints

### `GET /folders/:folderId/vocabulary`

Returns `{ data: { folder, vocabulary: VocabularyItem[] } }`. Item fields: `id`, `folderId`, `word`, `meaning`, `ipa`, `createdAt`, `updatedAt`. Absence of IPA is JSON `null`.

### `POST /folders/:folderId/vocabulary`

Request: `{ "word": "journey", "meaning": "a trip", "ipa": "/ˈdʒɜːni/" }`; `ipa` may be omitted/null. Backend applies BR-001–BR-003 and BR-016–BR-018. Returns `201`; same-folder duplicate returns `409 VOCABULARY_DUPLICATE`.

## CSV import endpoint

### `POST /folders/:folderId/vocabulary/import`

Input is `multipart/form-data` with one `file` field. Planned configurable maximum is 1 MiB for MVP; changing it is operational configuration, not validation semantics.

Processing order:

1. Validate folder, content type, size, readable UTF-8, and non-empty file.
2. Parse headers case-sensitively after removing an optional UTF-8 BOM; require `word`, `meaning`, allow `ipa`, reject unknown/duplicate headers.
3. Parse quoted CSV fields and attach physical/data row numbers.
4. Zod-validate trimmed row values and normalize words.
5. Classify within-file and database duplicates without overwriting.
6. Insert classified valid rows in one transaction.
7. Return only actual persisted/skipped outcomes.

Response `200`:

```json
{
  "data": {
    "totalRows": 3,
    "importedCount": 2,
    "skippedCount": 1,
    "imported": [{ "row": 2, "vocabularyId": "id" }],
    "skipped": [
      {
        "row": 3,
        "code": "VOCABULARY_DUPLICATE",
        "message": "The word already exists in this folder."
      }
    ]
  }
}
```

Header/file failure imports nothing. Row failures allow other valid rows to persist. Header-only input returns zero counts.

## Test endpoints

### `POST /folders/:folderId/tests`

Validates at least four vocabulary items with four distinct meanings. Uses injected cryptographically suitable randomness in runtime and deterministic RNG in tests. Every eligible word appears once; each question contains exactly four distinct meaning choices.

Response `201`:

```json
{
  "data": {
    "testToken": "signed-opaque-token",
    "expiresAt": "2026-08-26T12:00:00.000Z",
    "questions": [
      {
        "vocabularyId": "id",
        "word": "journey",
        "ipa": "/.../",
        "choices": ["a trip", "...", "...", "..."]
      }
    ]
  }
}
```

The signed token uses `v1.<payload-base64url>.<signature-base64url>`, where payload is canonical UTF-8 JSON and signature is HMAC-SHA256 over the versioned encoded payload, both Base64URL encoded. The canonical payload property order is `version`, `folderId`, `issuedAt`, `expiresAt`, `questions`; each question contains `vocabularyId`, `word`, `ipa`, `correctMeaning`, and `choices` in that order. `issuedAt` and `expiresAt` are ISO UTC strings; expiry is exactly 30 minutes after issuance and valid only while `now < expiresAt`. `TEST_TOKEN_SECRET` signs and verifies with constant-time comparison; it is never in the payload or response. The token is not persisted. Ineligible folders return `409 TEST_INELIGIBLE` with safe details such as required/actual counts.

Malformed, unsupported-version, or tampered tokens return `400 INVALID_TEST_TOKEN`; validly signed expired tokens return `400 TEST_TOKEN_EXPIRED`. Signing/verifying failures use the existing safe `INTERNAL_ERROR` envelope with HTTP `500`.

### `POST /test-sessions`

Request: `{ "testToken": "...", "answers": [{ "vocabularyId": "id", "selectedMeaning": "a trip" }] }`.

Backend verifies signature/expiry, exact question coverage, one answer per vocabulary, and that each selected meaning was an issued choice. It recomputes correctness and atomically persists one completed session and all answer snapshots. Reusing the same token is prevented by a signed unique completion ID recorded on TestSession; duplicate completion returns `409`. Success returns `201` with session ID, total, correct, incorrect, accuracy, and per-answer feedback.

Completion rejects a validly signed snapshot when any referenced vocabulary record no longer matches its signed `vocabularyId`, `word`, `meaning`, or `ipa`, or no longer belongs to the signed folder; this is `409 TEST_SNAPSHOT_STALE`. Submission invariant failures are `400 TEST_SUBMISSION_INVALID`; replay is `409 TEST_ALREADY_COMPLETED`. A successful response contains `{ data: { sessionId, folderId, correctCount, incorrectCount, totalCount, completedAt, answers } }`, where each answer contains `vocabularyId`, `selectedMeaning`, `correctMeaning`, and `isCorrect` in signed-question order.

### `GET /test-sessions/:sessionId`

Returns the persisted completed summary and answer snapshots or `404`. There is no create-draft or abandon endpoint.

## Dashboard endpoint

### `GET /dashboard`

Returns:

```json
{
  "data": {
    "folderCount": 0,
    "vocabularyCount": 0,
    "completedSessionCount": 0,
    "completedSessionDates": [],
    "correctAnswerCount": 0,
    "incorrectAnswerCount": 0,
    "accuracyPercent": 0
  }
}
```

`completedSessionDates` contains ISO timestamps for persisted completed test sessions. The browser projects these instants into the user's local calendar before deduplicating active days for current-week Learning Consistency. This additive field does not change the meaning of the existing all-time totals or accuracy.

Only persisted completed sessions count. Accuracy is rounded to one decimal in the application service.

## AI endpoint

### `POST /ai/text`

Request: `{ "vocabularyIds": ["id-1", "id-2"] }` with 1–10 unique IDs. The API loads only their words, invokes the configured adapter with a timeout, and returns `{ data: { text, vocabularyIds } }`. Text is not persisted. Disabled/missing configuration returns `503 AI_UNAVAILABLE`; core endpoints remain unaffected.

## Contract evolution

Breaking changes require Specification approval and a new API version or compatible migration path. Shared contract schemas may be published from `packages/contracts`, but backend services remain authoritative.
