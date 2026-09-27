# Rivalry Ledger — QA Automation Portfolio

A full-stack football league management web application, used as the subject of a complete QA automation portfolio. This repository contains both the application source code and the full test suite.

**Live:** https://rivalry-ledger.vercel.app

---

## Why This Project

I play eFootball with a close friend and we had no proper way to track our matches — we were recording results on paper, which was messy and impractical. So I built Rivalry Ledger from scratch to solve that real problem. What started as a personal tool became the subject of my entire QA portfolio. Testing it myself meant I was both the developer and the QA — I wrote the features, then turned around and tried to break them. That dual perspective taught me more about finding real bugs than any tutorial could.

![App Preview](./docs/preview.png)

---

---

## Application Overview

**Rivalry Ledger** is a football league tracker built for real use. It allows admins to record match results, manage players, track standings, and archive completed seasons. Visitors can view live standings, top scorers, and match history.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript + Vite |
| State Management | Zustand |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| Backend | Supabase (Edge Functions) |
| Data Persistence | GitHub API |
| Deployment | Vercel |

---

## QA Strategy

This project follows a structured, multi-layer QA approach:

| Layer | Tool | Scope |
|-------|------|-------|
| Unit & Integration | Jest + ts-jest | Pure logic — store actions, auth service, stat calculations |
| E2E Acceptance | Cypress + Cucumber (Gherkin) | Full browser flows written in BDD-style feature files |
| CI/CD | GitHub Actions (in progress) | Automated test runs on push |

**Key principle:** GitHub API calls are intercepted in all E2E tests using `cy.intercept()` — no real network calls leave the browser during test runs. Every test runs against `localhost:8080`.

---

## Project Structure

```
rivalry-ledger/
├── src/                          # Application source code
│   ├── store/leagueStore.ts      # Core state — all match/player/team logic
│   ├── lib/authService.ts        # Admin authentication logic
│   ├── pages/                    # Route pages (AdminPage, HomePage, etc.)
│   └── components/               # UI components
├── cypress/
│   ├── e2e/                      # Gherkin feature files (one per feature)
│   │   ├── admin-authentication.feature
│   │   ├── create-new-league.feature
│   │   ├── match-recording-NSL.feature
│   │   ├── match-recording-WSL.feature
│   │   ├── match-updating-and-deletion-NSL.feature
│   │   ├── match-updating-and-deletion-WSL.feature
│   │   └── player-management.feature
│   ├── fixtures/                 # Test data (leagueData.json)
│   └── support/
│       ├── POM/                  # Page Object Model classes
│       │   ├── components/       # Reusable component POMs (MatchForm, MatchHistory, PlayerForm, TopScorers)
│       │   ├── configDialog.ts
│       │   ├── confirmationDialog.ts
│       │   └── leagueData.ts     # Fixture manipulation and API intercept helper
│       ├── pages/
│       │   └── adminPage.ts      # Admin page POM with dialog state machine
│       ├── step_definitions/     # Cucumber step definitions
│       └── matchHelpers.ts       # Shared intercept helpers
├── docs/
│   ├── test-strategy.md          # Full QA strategy document
│   ├── test-plan.md              # Test cases and automation mapping
│   └── components/               # Static component review docs
├── cypress.config.ts
├── jest.config.ts
└── package.json
```

---

## E2E Test Coverage

All E2E tests are written in Gherkin (Cucumber) and executed with Cypress. Each feature file maps to a real user-facing flow.

### Admin Authentication
| Scenario | Status |
|----------|--------|
| Login with correct password | ✅ |
| Login with incorrect password | ✅ |
| Logout from admin page | ✅ |
| Visitor blocked from admin page | ✅ |

### Match Recording — NSL (No Scorers League)
| Scenario | Status |
|----------|--------|
| Record match with score only (multiple scores) | ✅ |
| Record match with goal scorers | ✅ |
| Scorer goals don't add up — error shown | ✅ |
| Same player added as separate scorer rows | ✅ |
| Own goal does not increment scorer's goals | ✅ |

### Match Recording — WSL (With Scorers League)
| Scenario | Status |
|----------|--------|
| Same scenarios as NSL with scorer tracking enforced | ✅ |

### Match Updating & Deletion — NSL & WSL
| Scenario | Status |
|----------|--------|
| Edit match score | ✅ |
| Edit match with scorers | ✅ |
| Scorer goals mismatch on edit — error shown | ✅ |
| Delete a match | ✅ |

### Player Management
| Scenario | Status |
|----------|--------|
| Add a new player | ✅ |
| Cannot add player without name | ✅ |
| Cannot add player with name < 3 characters | ✅ |
| Cannot add player with special characters | ✅ |
| Cannot add duplicate player name | ✅ |
| Edit player name | ✅ |
| Edit player team | ✅ |
| Cannot edit to invalid name | ✅ |
| Cannot delete player with goals | ✅ |
| Delete player with no goals | ✅ |
| Cannot delete when team is at minimum squad size | ✅ |

### Create New League (League Archiving)
| Scenario | Status |
|----------|--------|
| Cannot start with unsaved changes | ✅ |
| Cannot start with fewer than 4 matches | ✅ |
| Warned when league has not reached target matches | ✅ |
| Proceed despite incomplete league | ✅ |
| Cancel league incomplete warning | ✅ |
| Config dialog opens when target is reached | ✅ |
| Next button disabled with empty or whitespace name | ✅ |
| Select league type (With/Without Scorers) | ✅ |
| Proceed to confirmation with valid config | ✅ |
| Cancel config dialog | ✅ |
| Go back from confirmation to config | ✅ |
| Archiving spinner shown while processing | ✅ |
| App navigates home after archive success | ✅ |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Install dependencies
```bash
npm install
```

### Run the application
```bash
npm run dev
```
App runs on `http://localhost:8080`

---

## Running Tests

### Unit Tests (Jest)
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Cypress)
```bash
# Interactive mode
npm run cypress:open

# Headless
npm run cypress:run
```

> The app must be running locally before launching Cypress. The `cypress:open` and `cypress:run` scripts handle this automatically via `start-server-and-test`.

---

## Documentation

| Document | Description |
|----------|-------------|
| [Test Strategy](./docs/test-strategy.md) | QA approach, risk analysis, test levels, tools |
| [Test Plan](./docs/test-plan.md) | Full test case list with steps and automation mapping |

---

## Author

**Yassine Kacem** — Junior QA Automation Engineer  
Cypress · Cucumber/Gherkin · Jest · TypeScript · React · GitHub Actions