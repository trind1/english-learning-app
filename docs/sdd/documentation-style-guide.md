# SDD Documentation Style Guide

| Field | Value |
|---|---|
| Document | Documentation style guide |
| Stage | Bootstrap |
| Owner | Technical Writer |
| Status | PASS |
| Version | 1.0 |
| Last updated | 2026-08-26 |
| Depends on | [Repository instructions](../../AGENTS.md) |
| Next review | Bootstrap approval |

> **Executive summary**
>
> This guide makes SDD documents consistent, beginner-friendly, and auditable in VS Code and GitHub. All later artifacts must follow it; Bootstrap approval is the next action.

## Structure
- Use exactly one H1, then the required metadata table and executive summary.
- Use H2 for major sections, H3 only when needed, and never skip levels.
- Add a table of contents for more than six H2 sections or roughly 100 lines.
- Prefer short paragraphs, focused tables, and verification checklists.

## Markdown
- Use fenced code blocks with a language label when known.
- Use Mermaid only when it materially clarifies a relationship or flow.
- Use relative links; do not commit raw absolute paths or decorative HTML.
- Avoid nested or extremely wide tables. Do not rely on color or icons alone.

## Status markers
Use only: ✅ PASS, ❌ FAIL, ⛔ BLOCKED, ⏳ IN PROGRESS, ⚪ NOT STARTED, and ⚠️ WARNING. Text is mandatory.

### Status semantics

`PASS` requires all acceptance and verification gates for the task to pass. Use `IN PROGRESS` whenever remaining implementation, tests, coverage, browser verification, local defect repair, static checks, or SDD synchronization is locally actionable. These conditions must never be labeled `BLOCKED`. Reserve `BLOCKED` only for a material issue that cannot be resolved autonomously, including contradictory approved requirements, unavailable required external credentials/services, destructive decisions requiring user approval, or architecture decisions that cannot safely be derived. While a task is `IN PROGRESS`, diagnose, fix, rerun focused verification, and continue; if a run ends before completion, report `IN PROGRESS`.

## Stable IDs
Use `FR-001`, `NFR-001`, `BR-001`, `AC-001`, `TASK-001`, `TEST-001`, `FIND-001`, `EVID-001`, `ADR-001`, and `RISK-001`. Approved IDs never change.

## Required metadata
Every artifact starts with Document, Stage, Owner, Status, Version, Last updated, Depends on, and Next review. Use `Pending` rather than inventing a date.

## Executive summary
After metadata, add a two-to-four-sentence blockquote explaining purpose, current outcome, and the main blocker or next action.

## Verification documents
Use [verification-template.md](templates/verification-template.md). Record exact commands and evidence; `PASS` cannot depend only on assumptions. Coverage values appear only after measurement.

## Beginner explanation pattern
Explain plain meaning first, then a small example, the containing file, how to verify it, and only then the technical term.
