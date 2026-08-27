# English Learning App

This repository contains a beginner-friendly, full-stack English-learning application.

For local development, see the [local run guide](docs/RUN-GUIDE.md):

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Then open http://localhost:5173.

## Project workflow

Start with the [SDD dashboard](docs/sdd/index.md) and follow [repository governance](AGENTS.md). Each stage requires an evidence-based verification result of `PASS` and explicit user approval before the next stage starts.

## Planned product scope

The planned product covers topic folders, manual and CSV vocabulary entry, IPA, pronunciation, flashcards, multiple-choice tests, per-session answer tracking, a progress dashboard, and optional AI-generated text using no more than ten selected words.

The implementation uses npm workspaces, React/Vite, Express, Prisma/SQLite, and automated tests.

## Documentation map

- `docs/sdd/`: stage artifacts, status, traceability, and templates.
- `.codex/agents/`: project-scoped role definitions.
- `.env.example`: safe local configuration placeholders.
- `.gitignore`: prevents local secrets, databases, dependencies, and generated reports from being committed.

## Beginner check

Open `docs/sdd/index.md` in a Markdown preview. Confirm that future stages are marked `NOT STARTED` before approving Specification work.
