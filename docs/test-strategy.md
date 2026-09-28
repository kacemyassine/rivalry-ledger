# Test Strategy — Rivalry Ledger

**Version:** 2.0  
**Author:** Yassine Kacem  
**Date:** September 2026  
**Status:** Active  

---

## 1. Introduction

This document defines the overall quality assurance strategy for **Rivalry Ledger**, a football league management web application that allows administrators to manage leagues, record match results, track player statistics, and archive completed seasons. The application is built with React, TypeScript, Zustand, and Supabase, with GitHub as a data persistence layer.

---

## 2. Scope

### In Scope
- Visitor-facing pages (Home, Statistics, Archived Leagues)
- Admin panel (match recording, match editing and deletion, player management, league archiving)
- GitHub API integration (data fetching and saving — intercepted in all automated tests)
- Supabase edge functions (archiving flow)
- Authentication flow (admin password protection)
- Dialog state machine (unsaved changes, league incomplete, config, confirmation)

### Out of Scope
- Third-party service internals (GitHub API, Supabase infrastructure)
- Performance and load testing (future phase)
- Accessibility testing (future phase)
- Mobile responsiveness (manual exploratory only)

---

## 3. Test Objectives

- Verify all functional requirements work as specified
- Identify and document defects before they reach end users
- Ensure data integrity across all admin operations (match CRUD, player CRUD, league archiving)
- Validate the application handles edge cases and negative inputs gracefully
- Build a maintainable, readable, and stable automated regression suite

---

## 4. Test Levels

### 4.1 Unit Testing
**Tool:** Jest + ts-jest  
**Scope:** Individual functions and pure logic  
**Examples:**
- Goal calculation and stats reversal (match edit/delete)
- Points calculation for win/draw/loss
- AuthService authenticate, isAuthenticated, logout

### 4.2 Component Testing
**Tool:** Jest + React Testing Library
**Scope:** Individual UI components in isolation, rendering and behavior
**Examples:**
- NavBar renders correct auth state and handles login dialog
- MatchHistory paginates correctly
- PlayerForm validates inputs and calls correct store actions
- ProtectedRoute redirects unauthenticated users

### 4.3 Integration Testing
**Tool:** Jest + ts-jest  
**Scope:** Interaction between store actions and state, consistency after operations  
**Examples:**
- State store reflects correct values after match operations
- Auth session persists correctly across operations

### 4.3 E2E Acceptance Testing
**Tool:** Cypress + Cucumber (Gherkin via @badeball/cypress-cucumber-preprocessor)  
**Scope:** Full browser flows written in BDD-style feature files, run against localhost:8080  
**Key principle:** All GitHub API calls are intercepted using `cy.intercept()` — no real network requests leave the browser during test runs. Tests are stable, deterministic, and fast.  
**Examples:**
- Admin records a match → match appears in history with correct scorers
- Admin archives league → spinner shown → app navigates to home on success
- Protected route blocks unauthenticated users

---

## 5. Test Types

### 5.1 Functional Testing
Verify every feature works according to requirements — match recording, match editing and deletion, player management, league archiving, authentication, and dialog flows.

### 5.2 Regression Testing
Automated suite (Jest + Cypress) run on every push via GitHub Actions to catch unintended side effects.

### 5.3 Negative Testing
Intentional invalid inputs to verify the application handles errors gracefully — invalid scores, empty fields, duplicate players, scorer goals mismatch, whitespace-only league names, future match dates.

### 5.4 Exploratory Testing
Unscripted testing sessions targeting high-risk areas, edge cases, and mobile behavior.

---

## 6. Test Design Techniques

| Technique | Application |
|-----------|-------------|
| **Equivalence Partitioning** | Valid/invalid score inputs, player name validation, league name validation |
| **Boundary Value Analysis** | Match limits (fewer than 4, exactly 4, at target), scorer goal counts |
| **State Transition Testing** | Dialog state machine (no dialog → unsaved warning → league incomplete → config → confirmation), league archiving flow |
| **Decision Tables** | Own goal behavior, scorer goals mismatch logic |
| **Error Guessing** | Whitespace-only league names, same team home/away, future match dates, player at minimum squad size |
| **Exploratory Testing** | Unscripted sessions on admin panel and mobile devices |

---

## 7. Test Approach by Feature

| Feature | Automated (Cypress) | Unit (Jest) | Exploratory |
|---------|--------------------:|------------:|------------:|
| Admin Authentication | ✅ | ✅ | ✅ |
| Match Recording (NSL) | ✅ | ✅ | ✅ |
| Match Recording (WSL) | ✅ | ✅ | ✅ |
| Match Editing & Deletion | ✅ | ✅ | ✅ |
| Player Management | ✅ | ❌ | ✅ |
| League Archiving (Create New League) | ✅ | ❌ | ✅ |
| GitHub API Integration | ✅ (intercepted) | ❌ | ✅ |
| Dialog State Machine | ✅ | ❌ | ✅ |

---

## 8. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GitHub API rate limiting | Medium | High | All E2E tests intercept GitHub API calls — never hit the real API |
| Data corruption on match edit/delete | Low | Critical | Unit test stats reversal logic thoroughly |
| Dialog state machine regression | Medium | High | Full E2E coverage of all dialog transitions |
| Flaky Cypress tests due to async rendering | Medium | Major | `cy.intercept()`, proper waiting strategies, timeout tuning |
| Supabase edge function failure during archive | Low | High | Test archiving flow E2E; failure scenarios covered manually |
| Input validation bypass | Medium | Major | Negative test cases for all user-facing forms |

---

## 9. Test Environment

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | http://localhost:8080 | All automated testing (E2E + unit) |
| Production | https://rivalry-ledger.vercel.app | Manual exploratory testing only |

**Rule:** Production is never touched by automation.

---

## 10. Entry and Exit Criteria

### Entry Criteria
- Application runs locally on localhost:8080
- Test environment configured (Jest + Cypress installed)
- Feature files and step definitions written
- Test fixtures prepared

### Exit Criteria
- All critical and major test cases executed
- No open Critical bugs
- No more than 2 open Major bugs
- Regression suite passes on CI

---

## 11. Tools & Environment

| Tool | Purpose |
|------|---------|
| Cypress 16.x | E2E browser automation |
| @badeball/cypress-cucumber-preprocessor | Gherkin/BDD support for Cypress |
| Jest 29.x + ts-jest | Unit and integration testing |
| GitHub Actions | CI/CD pipeline |

---

## 12. Defect Management

### Severity Levels
| Severity | Description | Example |
|----------|-------------|---------|
| Critical | App crash, data loss, core feature broken | Match recording corrupts standings |
| Major | Feature not working as expected | Stats not rolling back on match delete |
| Minor | UI issue, cosmetic defect | Button misaligned on mobile |
| Trivial | Typos, minor inconsistencies | Wrong label text |

### Priority Levels
| Priority | Description |
|----------|-------------|
| P1 | Fix immediately |
| P2 | Fix in current sprint |
| P3 | Fix in next sprint |
| P4 | Fix when possible |

---

## 13. Deliverables

- ✅ Test Strategy (this document)
- ✅ Test Plan
- ✅ E2E Test Suite (Cypress + Cucumber)
- ✅ Unit Test Suite (Jest) — leagueStore, authService, githubUtils, standingsUtils, matchHistoryUtils, matchFormUtils, playerFormUtils, scorersUtils, leagueHeaderUtils
- 🔜 CI/CD Pipeline (GitHub Actions) — in progress
- 🔜 Test Metrics Report