# Rivalry Ledger — QA Portfolio Project

A full-stack football league management web application, used as the subject of a complete QA automation portfolio. This repository contains both the application source code and the full test suite.

---

## Application Overview

**Rivalry Ledger** is a football league tracker built for real use. It allows admins to record match results, manage players, track standings, manage cup competitions, and archive completed seasons. Visitors can view live standings, top scorers, head-to-head stats, and match history.

**Live:** https://rivalry-ledger.vercel.app

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| State Management | Zustand (persisted via localStorage) |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Edge Functions) |
| Data Persistence | GitHub API |
| Deployment | Vercel |

---

## QA Strategy

This project follows a structured QA approach with two automation layers:

| Layer | Tool | Scope |
|-------|------|-------|
| Unit & Integration | Jest + ts-jest | Pure logic — store actions, auth service, stat calculations |
| End-to-End | Cypress | Full browser flows — auth, match recording, navigation, standings |
| CI/CD | GitHub Actions | Runs full test suite on every push to main |

**Key principle:** No mocking except for unreproducible failure scenarios (forced 500s, GitHub API rate limits). Every test runs against real application logic.

**Test environment:** All automated tests run against `localhost:5173`. Production is never touched by automation.

---

## Project Structure

```
rivalry-ledger/
├── src/                        # Application source code
│   ├── store/
│   │   └── leagueStore.ts      # Core state — all match/player/team logic
│   ├── lib/
│   │   └── authService.ts      # Admin authentication logic
│   ├── pages/                  # Route pages
│   └── components/             # UI components
├── tests/
│   └── unit/
│       ├── leagueStore.test.ts # Jest unit tests — match logic
│       └── authService.test.ts # Jest unit tests — authentication
├── cypress/
│   ├── e2e/
│   │   ├── auth.cy.ts          # E2E — authentication flow
│   │   ├── navigation.cy.ts    # E2E — routing and navigation
│   │   └── matchFlow.cy.ts     # E2E — match recording and standings
│   ├── fixtures/               # Test data
│   └── support/                # Custom commands and config
├── docs/
│   ├── test-strategy.md        # QA strategy document
│   └── test-plan.md            # Test cases and automation mapping
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── cypress.config.ts
├── jest.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies
```bash
npm install
```

### Run the application locally
```bash
npm run dev
```
App runs on `http://localhost:5173`

---

## Running Tests

### Unit Tests (Jest)
```bash
# Run all unit tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests (Cypress)
```bash
# Make sure the app is running locally first
npm run dev

# Open Cypress interactive runner
npm run cypress:open

# Run Cypress headless
npm run cypress:run
```

---

## Test Coverage

### Unit Tests — leagueStore
| Test ID | Scenario | Status |
|---------|----------|--------|
| MATCH-01 | Home win → 3 points for home team | 🔜 |
| MATCH-02 | Draw → 1 point for both teams | 🔜 |
| MATCH-03 | Away win → 3 points for away team | 🔜 |
| MATCH-04 | Goals for/against update correctly | 🔜 |
| MATCH-05 | Played count increments for both teams | 🔜 |
| MATCH-06 | Scorer goals update after match | 🔜 |
| MATCH-07 | Own goal does not increment scorer goals | 🔜 |
| DEL-01 | Match deletion reverses all team stats | 🔜 |
| DEL-02 | Match deletion reverses player goals | 🔜 |
| EDIT-01 | Result change from win to draw updates points | 🔜 |
| EDIT-02 | Editing scorers updates player goal counts | 🔜 |

### Unit Tests — AuthService
| Test ID | Scenario | Status |
|---------|----------|--------|
| AUTH-01 | Correct password returns true | 🔜 |
| AUTH-02 | Incorrect password returns false | 🔜 |
| AUTH-03 | Empty password returns false | 🔜 |
| AUTH-04 | isAuthenticated returns true after login | 🔜 |
| AUTH-05 | logout clears session | 🔜 |

### E2E Tests — Cypress
| Test ID | Scenario | Status |
|---------|----------|--------|
| AUTH-E2E-01 | Login with correct password navigates to admin | 🔜 |
| AUTH-E2E-02 | Login with wrong password shows error | 🔜 |
| AUTH-E2E-03 | Unauthenticated user redirected from /admin | 🔜 |
| AUTH-E2E-04 | Session persists on page refresh | 🔜 |
| AUTH-E2E-05 | Logout clears session | 🔜 |
| NAV-01 | All routes load correctly | 🔜 |
| NAV-02 | Unknown route shows 404 | 🔜 |
| MATCH-E2E-01 | Record a match → standings update | 🔜 |

---

## CI/CD

Every push to `main` triggers the GitHub Actions pipeline:

1. Install dependencies
2. Run Jest unit tests
3. Start the dev server
4. Run Cypress E2E tests headless
5. Upload test artifacts on failure

---

## Documentation

| Document | Description |
|----------|-------------|
| [Test Strategy](./docs/test-strategy.md) | Overall QA approach, risk analysis, tools, environments |
| [Test Plan](./docs/test-plan.md) | Full test case list with steps, expected results, automation mapping |

---

## Author

**Yassine Kacem** — Junior QA Automation Engineer
ISTQB Certified | Jest · Cypress · GitHub Actions