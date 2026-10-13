# Rivalry Ledger — QA Automation Portfolio

A full-stack football league management app, used as the subject of a complete QA automation portfolio. This repository contains the application, the test suites at four levels, and the CI pipelines that run them.

**Live:** https://rivalry-ledger.vercel.app

[![API tests](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/api-tests.yml/badge.svg?branch=main)](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/api-tests.yml)
[![Unit and component tests](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/unit-component-tests.yml/badge.svg?branch=main)](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/unit-component-tests.yml)
[![E2E tests](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/e2e.yml/badge.svg?branch=main)](https://github.com/kacemyassine/rivalry-ledger/actions/workflows/e2e.yml)

<!-- Add a screenshot at docs/preview.png and uncomment:
![App preview](./docs/preview.png)
-->

---

## Why this project

I play eFootball with a close friend and we had no proper way to track our matches. We were recording results on paper. So I built Rivalry Ledger to solve that, and it became the subject of my QA portfolio. I wrote the features, then turned around and tried to break them. That dual view taught me more about finding real bugs than any tutorial.

---

## The application

Admins record match results, manage players, track standings, and archive completed seasons. Visitors view live standings, top scorers, match history, and archived leagues.

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| State | Zustand |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| Backend | Supabase Edge Functions (`update-json`, `archive-league`) |
| Data persistence | GitHub API (data is committed to `src/data/`) |
| Deployment | Vercel |

---

## QA at a glance

| Level | Tool | Size | Scope |
|-------|------|------|-------|
| Unit and component | Jest, React Testing Library | 366 passing, 21 skipped | Store logic, auth service, stat calculations, utilities, UI components |
| API | Postman, Newman | 64 requests, 257 assertions | Edge function validation, GitHub error handling, happy paths |
| E2E | Cypress, Cucumber (Gherkin), Page Object Model | 80 runs from 77 scenarios | Full browser flows in BDD feature files |

Test design techniques used: equivalence partitioning, boundary value analysis, decision tables, state transition testing, and error guessing. Details are in the [test strategy](./docs/test-strategy.md) and [test plan](./docs/test-plan.md).

**How the tests handle external services**
- E2E tests stub direct `api.github.com` calls with `cy.intercept()`.
- E2E and API tests call the real Supabase Edge Functions, which commit to `src/data/`. The CI workflows are built so these commits cannot re-trigger themselves.

---

## CI/CD

Three GitHub Actions workflows run the three suites, one per level. Each has branch and path rules so that data-only commits (made by the edge functions) don't trigger test runs.

| Workflow | Runs on |
|----------|---------|
| API tests | `main` pushes (except `src/data/**` only), `develop` pushes touching `supabase/**` or `postman/**`, PRs touching those folders, manual |
| Unit and component tests | `main` pushes (except `src/data/**` only), `develop` pushes touching `src/**` (not `src/data/**`) or `tests/**`, all PRs, manual |
| E2E tests | `main` pushes (except `src/data/**` only), all PRs, manual |

Reports are uploaded as artifacts (Newman HTML report, Jest coverage, Cypress screenshots on failure). Full details, secrets, and the reasoning behind the trigger rules are in [.github/README.md](./.github/README.md).

---

## Project structure

```
rivalry-ledger/
├── src/                      # Application code (store, lib, pages, components)
├── supabase/functions/       # Edge functions: update-json, archive-league
├── tests/
│   ├── unit/                 # Jest unit tests
│   ├── component/            # React Testing Library tests
│   ├── fixtures/             # Shared test data and validation suites
│   └── helpers/
├── cypress/
│   ├── e2e/                  # Gherkin feature files
│   ├── fixtures/
│   └── support/              # Step definitions, Page Object Model, helpers
├── postman/                  # Collection, environment, README
├── scripts/                  # pull-postman.mjs
├── docs/                     # Test strategy and test plan
└── .github/                  # Workflows and CI documentation
```

---

## E2E coverage

All E2E tests are Gherkin scenarios executed by Cypress.

| Feature file | Scenarios | Covers |
|--------------|----------:|--------|
| `admin-authentication` | 6 | Login, logout, wrong password, visitor blocked from admin |
| `match-recording-NSL` / `-WSL` | 5 + 5 | Recording matches with and without scorer tracking, scorer mismatch errors, own goals |
| `match-updating-and-deletion-NSL` / `-WSL` | 9 + 6 | Editing scores, scorers and dates, deleting matches, cancel flows |
| `player-management` | 15 | Add, edit and delete players, name validation, duplicates, minimum squad size |
| `create-new-league` | 26 | Archiving flow: unsaved-changes guard, incomplete-league warnings, config and confirmation dialogs, loading state, navigation |
| `archived-leagues` | 5 | Empty state, list, detail page, not-found handling |

---

## API test coverage

The Postman collection targets both edge functions and is split into validation, GitHub error handling, and happy paths: malformed JSON, wrong content type, missing fields, path traversal, invalid characters, wrong types, nonexistent owner, repo or branch, and successful write and archive with read-back. See [postman/README.md](./postman/README.md).

---

## Getting started

Prerequisites: Node.js (current LTS) and npm.

```bash
npm install
npm run dev        # http://localhost:8080
```

The app reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from your environment.

## Running the tests

```bash
# Unit and component tests
npm run test
npm run test:coverage

# E2E (starts the app automatically)
npm run cypress:open     # interactive
npm run cypress:run      # headless

# API tests
npm run newman:run -- --env-var "anon_key=YOUR_KEY"
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Test Strategy](./docs/test-strategy.md) | Approach, levels, risks, techniques, tools |
| [Test Plan](./docs/test-plan.md) | Test cases per feature with technique and automation status |
| [CI workflows](./.github/README.md) | Pipelines, triggers, secrets, artifacts |
| [API tests](./postman/README.md) | Collection structure and how to run it |

---

## Known gaps

- Two unit suites are excluded because they are out of date after app changes.
- No performance, accessibility, or cross-browser testing yet.
- E2E scenarios that save or archive data write to the real `src/data/` through the edge functions.

---

## Author

**Yassine Kacem**, Junior QA Automation Engineer
Cypress · Cucumber/Gherkin · Jest · Postman/Newman · TypeScript · React · GitHub Actions