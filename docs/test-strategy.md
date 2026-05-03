# Test Strategy — Rivalry Ledger

**Version:** 1.1
**Author:** Yassine Kacem
**Date:** May 2026
**Status:** Active

---

## 1. Introduction

This document defines the overall quality assurance strategy for **Rivalry Ledger**, a football league management web application that allows administrators to manage leagues, record match results, track player statistics, and manage cup competitions. The application is built with React, TypeScript, Zustand, and Supabase, with GitHub as a data persistence layer.

---

## 2. Scope

### In Scope
- Visitor-facing pages (Home, Statistics, Archived Leagues, Cups)
- Admin panel (match recording, player management, league archiving, cup management)
- GitHub API integration (data fetching and saving)
- Supabase edge functions
- Responsive behavior on desktop and mobile
- Authentication flow (admin password protection)

### Out of Scope
- Third-party service internals (GitHub API, Supabase infrastructure)
- Browser extensions interference
- Performance/load testing (future phase)
- Accessibility testing (future phase)

---

## 3. Test Objectives

- Verify all functional requirements work as specified
- Identify and document defects before they reach end users
- Ensure data integrity across all admin operations (match CRUD, player CRUD, cup management)
- Validate the application behaves correctly on both desktop and mobile
- Ensure the GitHub API integration handles success and failure scenarios gracefully
- Build a maintainable automated regression suite

---

## 4. Test Levels

### 4.1 Unit Testing
**Tool:** Jest + ts-jest
**Scope:** Individual functions and pure logic
**Examples:**
- Goal calculation and stats reversal (match edit/delete)
- Score validation in match form
- Points calculation for win/draw/loss
- AuthService authenticate, isAuthenticated, logout

### 4.2 Integration Testing
**Tool:** Jest + jsdom
**Scope:** Interaction between store actions and localStorage, state consistency after operations
**Examples:**
- State store reflects correct values after match operations
- localStorage persists correctly after addMatch/deleteMatch
- Auth session persists in sessionStorage across operations

### 4.3 System Testing
**Tool:** Cypress
**Scope:** Full end-to-end user flows in a real browser against localhost
**Examples:**
- Admin records a match with scorers → standings update correctly
- Admin deletes a match → standings roll back correctly
- Visitor views top scorers → correct data displayed
- Protected route redirects unauthenticated users

### 4.4 Acceptance Testing
**Approach:** Manual exploratory testing
**Scope:** Validate the application meets real-world usage expectations
**Examples:**
- Admin workflow feels intuitive and error-free
- Mobile experience is usable and functional

---

## 5. Test Types

### 5.1 Functional Testing
Verify every feature works according to requirements — match recording, player management, cup management, league archiving, authentication.

### 5.2 Regression Testing
Automated suite (Jest + Cypress) run on every push via GitHub Actions to catch unintended side effects of new changes.

### 5.3 UI Testing
Manual and automated checks for layout, responsiveness, component rendering on desktop and mobile viewports.

### 5.4 Negative Testing
Intentional invalid inputs to verify the application handles errors gracefully — invalid scores, empty fields, duplicate players, network failures.

### 5.5 Exploratory Testing
Experience-based unscripted testing sessions targeting high-risk areas, edge cases, and mobile behavior.

---

## 6. Test Design Techniques

| Technique | Application |
|-----------|-------------|
| **Equivalence Partitioning** | Valid/invalid score inputs, player goal counts |
| **Boundary Value Analysis** | Match limits (0, 1, max-1, max), goal counts |
| **Decision Tables** | Cup winner determination logic |
| **State Transition Testing** | Cup lifecycle (no matches → leg 1 → leg 2 → leg 3 → decided) |
| **Error Guessing** | Known risk areas — mobile keyboard, localStorage conflicts, same-team selection |
| **Exploratory Testing** | Unscripted sessions on admin panel and mobile devices |

---

## 7. Test Approach by Feature

| Feature | Black Box | White Box | Experience Based |
|---------|-----------|-----------|-----------------|
| Match Recording | ✅ | ✅ | ✅ |
| Player Management | ✅ | ❌ | ✅ |
| Standings & Stats | ✅ | ✅ | ❌ |
| Cup Management | ✅ | ✅ | ✅ |
| League Archiving | ✅ | ❌ | ✅ |
| Authentication | ✅ | ❌ | ✅ |
| GitHub API Integration | ✅ | ❌ | ✅ |
| Mobile Responsiveness | ✅ | ❌ | ✅ |

---

## 8. Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GitHub API rate limiting | Medium | High | Mock API in tests, monitor rate limits |
| Data loss on match edit/delete | Low | Critical | Unit test stats reversal logic thoroughly |
| Mobile UI regression | High | Major | Automate viewport testing in Cypress |
| localStorage conflicts between test runs | Medium | Major | Clear localStorage in beforeEach |
| Flaky Cypress tests due to async rendering | Medium | Major | Use cy.intercept and proper waiting strategies |
| Supabase edge function failure | Low | High | Test failure scenarios manually |

---

## 9. Entry and Exit Criteria

### Entry Criteria
- Application runs locally on localhost:5173
- Test environment is configured (Jest + Cypress installed)
- Test cases are written and reviewed
- Test data is prepared

### Exit Criteria
- All critical and major test cases executed
- No open Critical bugs
- No more than 2 open Major bugs
- Regression suite passes on CI
- Test metrics documented

---

## 10. Tools & Environment

| Tool | Version | Purpose |
|------|---------|---------|
| Cypress | 13.x | E2E browser automation |
| Jest | 29.x | Unit and integration testing |
| ts-jest | 29.x | TypeScript support for Jest |
| GitHub Actions | - | CI/CD pipeline |
| Jira | Cloud | Bug tracking |
| TestRail | Cloud | Test case management |

### Test Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | http://localhost:5173 | All automated testing (E2E + unit) |
| Production | https://rivalry-ledger.vercel.app | Manual exploratory testing only |

---

## 11. Defect Management

All defects are logged in **Jira** with the following workflow:
```
Open → In Progress → In Review → Resolved → Closed
```

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
| P2 | Fix in current cycle |
| P3 | Fix in next cycle |
| P4 | Fix when possible |

---

## 12. Roles & Responsibilities

| Role | Responsibility |
|------|---------------|
| QA Engineer (Yassine Kacem) | Test planning, test case writing, automation, bug reporting |

---

## 13. Deliverables

- ✅ Test Strategy (this document)
- ✅ Test Plan
- 🔜 Unit Test Suite (Jest)
- 🔜 E2E Test Suite (Cypress)
- 🔜 CI/CD Pipeline (GitHub Actions)
- 🔜 Test Metrics Report
- 🔜 Final Bug Report Summary