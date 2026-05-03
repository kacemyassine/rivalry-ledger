# Test Plan — Rivalry Ledger

**Version:** 1.1
**Author:** Yassine Kacem
**Date:** May 2026
**Status:** Active

---

## 1. Introduction

This document details the test planning for **Rivalry Ledger** — a football league management web application. It covers test scope, test cases per feature, test data, and automation mapping.

---

## 2. Features Under Test

### 2.1 Authentication
**Risk:** High — only protection for admin panel

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| AUTH-01 | Login with correct password grants access to admin panel | Functional | EP |
| AUTH-02 | Login with incorrect password shows error, stays on login | Negative | EP |
| AUTH-03 | Login with empty password is rejected | Negative | BVA |
| AUTH-04 | Authenticated session persists on page refresh | Functional | State Transition |
| AUTH-05 | Logout clears session and redirects to login | Functional | State Transition |
| AUTH-06 | Unauthenticated user accessing /admin is redirected | Security | Error Guessing |

---

### 2.2 Match Recording
**Risk:** Critical — core feature, directly affects standings and player stats

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| MATCH-01 | Admin records a home win → home team gains 3 points | Functional | EP |
| MATCH-02 | Admin records a draw → both teams gain 1 point | Functional | EP |
| MATCH-03 | Admin records an away win → away team gains 3 points | Functional | EP |
| MATCH-04 | Goals for/against update correctly after match | Functional | EP |
| MATCH-05 | Played count increments for both teams after match | Functional | EP |
| MATCH-06 | Match recorded with scorer → player goal count updates | Functional | EP |
| MATCH-07 | Match recorded with own goal → scorer's goals do not increment | Functional | Decision Table |
| MATCH-08 | Same team selected as home and away — match is blocked | Negative | Error Guessing |
| MATCH-09 | Score of 0-0 is valid and recorded as a draw | Boundary | BVA |

---

### 2.3 Match Deletion
**Risk:** Critical — must correctly reverse all stat changes

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| DEL-01 | Deleting a home win reverses 3 points from home team | Functional | EP |
| DEL-02 | Deleting a draw reverses 1 point from both teams | Functional | EP |
| DEL-03 | Deleting a match reverses goals for/against correctly | Functional | EP |
| DEL-04 | Deleting a match reverses player goal count | Functional | EP |
| DEL-05 | Played count decrements for both teams after deletion | Functional | EP |

---

### 2.4 Match Editing
**Risk:** High — delta calculation must be accurate

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| EDIT-01 | Changing result from win to draw updates points correctly | Functional | State Transition |
| EDIT-02 | Changing result from draw to loss updates points correctly | Functional | State Transition |
| EDIT-03 | Editing scorers updates player goal counts correctly | Functional | EP |
| EDIT-04 | Editing match date persists correctly | Functional | EP |

---

### 2.5 Player Management
**Risk:** Medium

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| PLAYER-01 | Admin adds a new player → player appears in squad | Functional | EP |
| PLAYER-02 | Admin edits a player name → change persists | Functional | EP |
| PLAYER-03 | Admin deletes a player → player removed from list | Functional | EP |
| PLAYER-04 | Deleted player's goals are removed from standings | Functional | Error Guessing |

---

### 2.6 Standings & Statistics
**Risk:** Medium — derived from match data

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| STAND-01 | Standings table is sorted by points descending | Functional | EP |
| STAND-02 | Goal difference calculated correctly (GF - GA) | Functional | EP |
| STAND-03 | Top scorers list reflects correct goal counts | Functional | EP |
| STAND-04 | Statistics page loads and displays charts | Functional | EP |

---

### 2.7 Navigation & Routing
**Risk:** Low

| ID | Test Case | Type | Technique |
|----|-----------|------|-----------|
| NAV-01 | Visiting / loads the visitor page | Functional | EP |
| NAV-02 | Visiting /statistics loads the statistics page | Functional | EP |
| NAV-03 | Visiting /archived-leagues loads the archives page | Functional | EP |
| NAV-04 | Visiting /cups loads the cups page | Functional | EP |
| NAV-05 | Visiting an unknown route shows 404 page | Negative | Error Guessing |
| NAV-06 | Navbar links navigate to correct pages | Functional | EP |

---

## 3. Test Data

### Teams (seeded in beforeEach for unit tests)
```json
[
  { "id": "team-1", "name": "Harbor United", "played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "points": 0 },
  { "id": "team-2", "name": "Ocean Dragon", "played": 0, "won": 0, "drawn": 0, "lost": 0, "goalsFor": 0, "goalsAgainst": 0, "points": 0 }
]
```

### Auth
- Valid password: `0217`
- Invalid password: `wrongpassword`, `""`, `" "`

---

## 4. Automation Mapping

| Test ID | Automated | Tool | Status |
|---------|-----------|------|--------|
| AUTH-01 | ✅ | Cypress | 🔜 |
| AUTH-02 | ✅ | Cypress | 🔜 |
| AUTH-03 | ✅ | Cypress | 🔜 |
| AUTH-04 | ✅ | Cypress | 🔜 |
| AUTH-05 | ✅ | Cypress | 🔜 |
| AUTH-06 | ✅ | Cypress | 🔜 |
| MATCH-01 | ✅ | Jest | 🔜 |
| MATCH-02 | ✅ | Jest | 🔜 |
| MATCH-03 | ✅ | Jest | 🔜 |
| MATCH-04 | ✅ | Jest | 🔜 |
| MATCH-05 | ✅ | Jest | 🔜 |
| MATCH-06 | ✅ | Jest | 🔜 |
| MATCH-07 | ✅ | Jest | 🔜 |
| MATCH-08 | ✅ | Jest | 🔜 |
| MATCH-09 | ✅ | Jest | 🔜 |
| DEL-01 | ✅ | Jest | 🔜 |
| DEL-02 | ✅ | Jest | 🔜 |
| DEL-03 | ✅ | Jest | 🔜 |
| DEL-04 | ✅ | Jest | 🔜 |
| DEL-05 | ✅ | Jest | 🔜 |
| EDIT-01 | ✅ | Jest | 🔜 |
| EDIT-02 | ✅ | Jest | 🔜 |
| EDIT-03 | ✅ | Jest | 🔜 |
| EDIT-04 | ✅ | Jest | 🔜 |
| STAND-01 | ✅ | Cypress | 🔜 |
| STAND-02 | ✅ | Jest | 🔜 |
| STAND-03 | ✅ | Cypress | 🔜 |
| NAV-01 | ✅ | Cypress | 🔜 |
| NAV-02 | ✅ | Cypress | 🔜 |
| NAV-03 | ✅ | Cypress | 🔜 |
| NAV-04 | ✅ | Cypress | 🔜 |
| NAV-05 | ✅ | Cypress | 🔜 |
| NAV-06 | ✅ | Cypress | 🔜 |

---

## 5. Schedule

| Day | Focus |
|-----|-------|
| 1-2 | Jest setup + leagueStore unit tests (MATCH, DEL, EDIT) |
| 3 | AuthService unit tests |
| 4-5 | Cypress setup + auth E2E tests |
| 6-7 | Cypress navigation + standings E2E tests |
| 8 | CI/CD GitHub Actions pipeline |
| 9 | Docs cleanup, README rewrite |
| 10 | Buffer — fix flaky tests, polish |