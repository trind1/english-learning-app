# Coverage Report

## Current verified coverage — 2026-08-28

| Application | Statements | Branches | Functions | Lines | Evidence | Status |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| Frontend | 99.57% | 95.41% | 100% | 99.57% | EVID-504 | PASS |
| Backend | 95.01% | 95.00% | 97.22% | 95.01% | EVID-506 | PASS |

Frontend excludes only `src/main.tsx`, the browser mount entry point with no product behavior. The exclusion is technical, not a means of removing business logic. Application behavior remains measured through `App` and all feature components.

> Status: PASS
> Backend and frontend coverage independently met all four required thresholds.
