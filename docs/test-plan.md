# Test Plan — Rivalry Ledger

**Version:** 2.0  
**Author:** Yassine Kacem  
**Date:** September 2026  
**Status:** Active  

---

## 1. Introduction

This document details the test planning for **Rivalry Ledger** — a football league management web application. It covers test scope, test cases per feature, test data, and automation status.

---

## 2. Features Under Test

### 2.1 Authentication
**Risk:** High — only protection for admin panel

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| AUTH-E2E-01 | Login with correct password grants access to admin panel | Functional | EP | Cypress | ✅ |
| AUTH-E2E-02 | Login with incorrect password shows error, stays on home | Negative | EP | Cypress | ✅ |
| AUTH-E2E-03 | Logout clears session and redirects to home page | Functional | State Transition | Cypress | ✅ |
| AUTH-E2E-04 | Unauthenticated user accessing /admin is redirected | Security | Error Guessing | Cypress | ✅ |
| AUTH-UNIT-01 | authenticate() returns true and creates session on correct password | Unit | EP | Jest | ✅ |
| AUTH-UNIT-02 | authenticate() returns false on wrong password | Unit | EP | Jest | ✅ |
| AUTH-UNIT-03 | authenticate() returns false for empty string | Unit | BVA | Jest | ✅ |
| AUTH-UNIT-04 | authenticate() is case-sensitive | Unit | EP | Jest | ✅ |
| AUTH-UNIT-05 | isAuthenticated() returns false when no session exists | Unit | EP | Jest | ✅ |
| AUTH-UNIT-06 | isAuthenticated() returns true after successful authentication | Unit | EP | Jest | ✅ |
| AUTH-UNIT-07 | isAuthenticated() returns false after logout | Unit | State Transition | Jest | ✅ |
| AUTH-UNIT-08 | isAuthenticated() returns false if token removed externally | Unit | Error Guessing | Jest | ✅ |
| AUTH-UNIT-09 | logout() clears session token from sessionStorage | Unit | EP | Jest | ✅ |
| AUTH-UNIT-10 | logout() is a no-op when called without active session | Unit | Error Guessing | Jest | ✅ |
| AUTH-UNIT-11 | generateToken() returns a non-empty unique string | Unit | EP | Jest | ✅ |
| AUTH-UNIT-12 | generateToken() token starts with admin_ prefix | Unit | EP | Jest | ✅ |
| AUTH-UNIT-13 | throws RATE_LIMITED after 3 failed attempts | Unit | BVA | Jest | ✅ |
| AUTH-UNIT-14 | throws LOCKED_OUT after 5 failed attempts | Unit | BVA | Jest | ✅ |
| AUTH-UNIT-15 | resetAttempts() allows authentication again after failed attempts | Unit | State Transition | Jest | ✅ |
| AUTH-UNIT-16 | token uses crypto.randomUUID() not Math.random() | Unit | Error Guessing | Jest | ✅ |
| AUTH-UNIT-17 | isAuthenticated() returns false for invalid token format | Unit | Error Guessing | Jest | ✅ |
| AUTH-UNIT-18 | warns when same listener registered twice (memory leak prevention) | Unit | Error Guessing | Jest | ✅ |
| AUTH-UNIT-19 | multiple listeners are all notified | Unit | EP | Jest | ✅ |

---

### 2.2 Match Recording — NSL (Non Scorers League)
**Risk:** Critical — core feature

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| MATCH-NSL-E2E-01 | Record a match with a final score (5-4, 2-0, 0-0) | Functional | EP + BVA | Cypress | ✅ |
| MATCH-NSL-E2E-02 | Record a match with goal scorers | Functional | EP | Cypress | ✅ |
| MATCH-NSL-E2E-03 | Scorer goals don't add up — error shown | Negative | Error Guessing | Cypress | ✅ |
| MATCH-NSL-E2E-04 | Same player added as separate scorer rows | Functional | EP | Cypress | ✅ |
| MATCH-NSL-E2E-05 | Own goal does not increment scorer's goal count | Functional | Decision Table | Cypress | ✅ |

---

### 2.3 Match Recording — WSL (With Scorers League)
**Risk:** Critical

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| MATCH-WSL-E2E-01 | Record a match with a final score | Functional | EP | Cypress | ✅ |
| MATCH-WSL-E2E-02 | Record a match with goal scorers | Functional | EP | Cypress | ✅ |
| MATCH-WSL-E2E-03 | Scorer goals don't add up — error shown | Negative | Error Guessing | Cypress | ✅ |
| MATCH-WSL-E2E-04 | Same player added as separate scorer rows | Functional | EP | Cypress | ✅ |
| MATCH-WSL-E2E-05 | Own goal does not increment scorer's goal count | Functional | Decision Table | Cypress | ✅ |

---

### 2.4 Match Recording — Unit Tests (leagueStore)
**Risk:** Critical — all standings derive from these functions

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| MATCH-UNIT-01 | Home win → home team gains 3 points, away gains 0 | Unit | EP | Jest | ✅ |
| MATCH-UNIT-02 | Away win → away team gains 3 points, home gains 0 | Unit | EP | Jest | ✅ |
| MATCH-UNIT-03 | Draw → both teams gain 1 point | Unit | EP | Jest | ✅ |
| MATCH-UNIT-04 | Multiple matches — points accumulated correctly | Unit | EP | Jest | ✅ |
| MATCH-UNIT-05 | Goals for/against update correctly for home win | Unit | EP | Jest | ✅ |
| MATCH-UNIT-06 | Goals for/against update correctly for away win | Unit | EP | Jest | ✅ |
| MATCH-UNIT-07 | Goals for/against update correctly for draw | Unit | EP | Jest | ✅ |
| MATCH-UNIT-08 | Matches played increments for both teams | Unit | EP | Jest | ✅ |
| MATCH-UNIT-09 | Throws when matches exceed targetMatches | Unit | BVA | Jest | ✅ |
| MATCH-UNIT-10 | Player goals updated correctly after match | Unit | EP | Jest | ✅ |
| MATCH-UNIT-11 | Player scoring multiple times has goals summed correctly | Unit | EP | Jest | ✅ |
| MATCH-UNIT-12 | Own goal does not increment scorer's goal count | Unit | Decision Table | Jest | ✅ |
| MATCH-UNIT-13 | Player scoring own goal and regular goal in same match | Unit | Decision Table | Jest | ✅ |
| MATCH-UNIT-14 | Player listed twice in scorers has goals summed correctly | Unit | EP | Jest | ✅ |

---

### 2.5 Match Editing & Deletion — NSL
**Risk:** Critical

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| EDIT-NSL-E2E-01 | Edit a match score with no scorers | Functional | EP | Cypress | ✅ |
| EDIT-NSL-E2E-02 | Edit a match score with scorers | Functional | EP | Cypress | ✅ |
| EDIT-NSL-E2E-03 | Scorer goals mismatch on edit — error shown | Negative | Error Guessing | Cypress | ✅ |
| EDIT-NSL-E2E-04 | Cancel edit without saving — match unchanged | Functional | State Transition | Cypress | ✅ |
| EDIT-NSL-E2E-05 | Change match date to a valid date | Functional | EP | Cypress | ✅ |
| EDIT-NSL-E2E-06 | Change match date to a future date — error shown | Negative | BVA | Cypress | ✅ |
| DEL-NSL-E2E-01 | Delete a match with no scorers | Functional | EP | Cypress | ✅ |
| DEL-NSL-E2E-02 | Delete a match with scorers — player goals adjust | Functional | EP | Cypress | ✅ |
| DEL-NSL-E2E-03 | Cancel a match deletion — match remains | Functional | State Transition | Cypress | ✅ |
| EDIT-UNIT-01 | Updates home goals correctly | Unit | EP | Jest | ✅ |
| EDIT-UNIT-02 | Updates away goals correctly | Unit | EP | Jest | ✅ |
| EDIT-UNIT-03 | Updates scorers correctly | Unit | EP | Jest | ✅ |
| EDIT-UNIT-04 | Updates date correctly | Unit | EP | Jest | ✅ |
| EDIT-UNIT-05 | Recalculates points correctly after edit | Unit | State Transition | Jest | ✅ |
| EDIT-UNIT-06 | Recalculates goals for/against correctly after edit | Unit | EP | Jest | ✅ |
| EDIT-UNIT-07 | Recalculates win/draw/loss correctly after edit | Unit | State Transition | Jest | ✅ |
| EDIT-UNIT-08 | Recalculates player goals correctly after edit | Unit | EP | Jest | ✅ |
| EDIT-UNIT-09 | Editing a match does not affect other matches | Unit | Error Guessing | Jest | ✅ |
| EDIT-UNIT-10 | Throws NOT_FOUND if match id does not exist | Unit | Error Guessing | Jest | ✅ |
| DEL-UNIT-01 | Removes the match from the matches list | Unit | EP | Jest | ✅ |
| DEL-UNIT-02 | Recalculates points correctly after deletion | Unit | EP | Jest | ✅ |
| DEL-UNIT-03 | Recalculates goals for/against correctly after deletion | Unit | EP | Jest | ✅ |
| DEL-UNIT-04 | Recalculates win/draw/loss correctly after deletion | Unit | EP | Jest | ✅ |
| DEL-UNIT-05 | Recalculates player goals correctly after deletion | Unit | EP | Jest | ✅ |
| DEL-UNIT-06 | Recalculates player goals correctly when match has multiple scorers | Unit | EP | Jest | ✅ |
| DEL-UNIT-07 | Recalculates correctly when single player listed multiple times as scorer | Unit | EP | Jest | ✅ |
| DEL-UNIT-08 | Deleting a match does not affect other matches | Unit | Error Guessing | Jest | ✅ |
| DEL-UNIT-09 | Throws NOT_FOUND if match id does not exist | Unit | Error Guessing | Jest | ✅ |

---

### 2.6 Match Editing & Deletion — WSL
**Risk:** Critical

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| EDIT-WSL-E2E-01 | Edit a match score with no scorers | Functional | EP | Cypress | ✅ |
| EDIT-WSL-E2E-02 | Edit a match score with scorers | Functional | EP | Cypress | ✅ |
| EDIT-WSL-E2E-03 | Scorer goals mismatch on edit — error shown | Negative | Error Guessing | Cypress | ✅ |
| EDIT-WSL-E2E-04 | Cancel edit without saving — match unchanged | Functional | State Transition | Cypress | ✅ |
| EDIT-WSL-E2E-05 | Change match date to a valid date | Functional | EP | Cypress | ✅ |
| EDIT-WSL-E2E-06 | Change match date to a future date — error shown | Negative | BVA | Cypress | ✅ |
| DEL-WSL-E2E-01 | Delete a match with no scorers | Functional | EP | Cypress | ✅ |
| DEL-WSL-E2E-02 | Delete a match with scorers — player goals adjust | Functional | EP | Cypress | ✅ |
| DEL-WSL-E2E-03 | Cancel a match deletion — match remains | Functional | State Transition | Cypress | ✅ |

---

### 2.7 Player Management
**Risk:** Medium

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| PLAYER-E2E-01 | Add a new player | Functional | EP | Cypress | ✅ |
| PLAYER-E2E-02 | Cannot add player without a name | Negative | BVA | Cypress | ✅ |
| PLAYER-E2E-03 | Cannot add player with name shorter than 3 characters | Negative | BVA | Cypress | ✅ |
| PLAYER-E2E-04 | Cannot add player with name starting with special character | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-05 | Cannot add player with special characters in name | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-06 | Cannot add duplicate player name in same team | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-07 | Edit player name | Functional | EP | Cypress | ✅ |
| PLAYER-E2E-08 | Edit player team | Functional | EP | Cypress | ✅ |
| PLAYER-E2E-09 | Cannot edit player name to less than 3 characters | Negative | BVA | Cypress | ✅ |
| PLAYER-E2E-10 | Cannot edit player name starting with special character | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-11 | Cannot edit player name with special characters | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-12 | Cannot edit player name to an existing name in the team | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-13 | Cannot delete player with goals | Negative | Error Guessing | Cypress | ✅ |
| PLAYER-E2E-14 | Delete player with no goals | Functional | EP | Cypress | ✅ |
| PLAYER-E2E-15 | Cannot delete any player when team is at minimum squad size | Negative | BVA | Cypress | ✅ |
| PLAYER-UNIT-01 | addPlayer() adds player with all required properties | Unit | EP | Jest | ✅ |
| PLAYER-UNIT-02 | addPlayer() throws NOT_FOUND if teamId does not exist | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-03 | addPlayer() throws DUPLICATE if same name exists in team | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-04 | editPlayer() updates player name correctly | Unit | EP | Jest | ✅ |
| PLAYER-UNIT-05 | editPlayer() updates player teamId correctly | Unit | EP | Jest | ✅ |
| PLAYER-UNIT-06 | editPlayer() partial update does not overwrite unchanged fields | Unit | EP | Jest | ✅ |
| PLAYER-UNIT-07 | editPlayer() does not allow editing goals directly | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-08 | editPlayer() throws NOT_FOUND if player id does not exist | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-09 | editPlayer() throws NOT_FOUND if updated teamId does not exist | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-10 | editPlayer() throws DUPLICATE if updated name already exists in team | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-11 | deletePlayer() removes player from players list | Unit | EP | Jest | ✅ |
| PLAYER-UNIT-12 | deletePlayer() throws NOT_FOUND if player id does not exist | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-13 | deletePlayer() throws HAS_GOALS if player has scored | Unit | Error Guessing | Jest | ✅ |
| PLAYER-UNIT-14 | deletePlayer() throws MIN_SQUAD_SIZE if team at minimum | Unit | BVA | Jest | ✅ |
| PLAYER-UNIT-15 | deletePlayer() does not affect other players | Unit | Error Guessing | Jest | ✅ |

---

### 2.8 Create New League (League Archiving)
**Risk:** High — complex dialog state machine, triggers Supabase edge function

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| LEAGUE-01 | Cannot start with fewer than 4 matches — error toast | Negative | BVA | Cypress | ✅ |
| LEAGUE-02 | Cannot start with unsaved changes — warning dialog shown | Functional | State Transition | Cypress | ✅ |
| LEAGUE-03 | Dismiss unsaved changes dialog — remain on admin with changes intact | Functional | State Transition | Cypress | ✅ |
| LEAGUE-04 | Save & continue from unsaved changes — changes saved, proceed | Functional | State Transition | Cypress | ✅ |
| LEAGUE-05 | Save & continue with incomplete league — league incomplete dialog shown | Functional | State Transition | Cypress | ✅ |
| LEAGUE-06 | Warned when league has not reached target matches | Functional | State Transition | Cypress | ✅ |
| LEAGUE-07 | Played vs target match count displayed in incomplete warning | Functional | EP | Cypress | ✅ |
| LEAGUE-08 | Target adjustment value displayed in incomplete warning | Functional | EP | Cypress | ✅ |
| LEAGUE-09 | Cancel league incomplete warning — remain on admin, no changes | Functional | State Transition | Cypress | ✅ |
| LEAGUE-10 | Proceed past league incomplete warning — config dialog opens | Functional | State Transition | Cypress | ✅ |
| LEAGUE-11 | Config dialog opens directly when target is reached and no unsaved changes | Functional | EP | Cypress | ✅ |
| LEAGUE-12 | Next button disabled when league name is empty | Negative | BVA | Cypress | ✅ |
| LEAGUE-13 | Next button disabled when league name is whitespace only | Negative | Error Guessing | Cypress | ✅ |
| LEAGUE-14 | Select "Without Scorers" league type — button highlighted as active | Functional | EP | Cypress | ✅ |
| LEAGUE-15 | Image selection is optional — can proceed without one | Functional | EP | Cypress | ✅ |
| LEAGUE-16 | Cancel config dialog — dialog closes | Functional | EP | Cypress | ✅ |
| LEAGUE-17 | Proceed to confirmation with valid config | Functional | EP | Cypress | ✅ |
| LEAGUE-18 | Go back from confirmation to config | Functional | State Transition | Cypress | ✅ |
| LEAGUE-19 | Archiving spinner shown while processing | Functional | EP | Cypress | ✅ |
| LEAGUE-20 | App navigates to home after archive success | Functional | EP | Cypress | ✅ |

---

### 2.9 GitHub API Integration — Unit Tests
**Risk:** High — data persistence depends on it

| ID | Scenario | Type | Technique | Tool | Status |
|----|----------|------|-----------|------|--------|
| GITHUB-UNIT-01 | fetchData() fetches and returns parsed LeagueData on success | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-02 | fetchData() retries on 500 and succeeds on second attempt | Unit | Error Guessing | Jest | ✅ |
| GITHUB-UNIT-03 | fetchData() returns null and toasts on 404 | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-04 | fetchData() returns null and toasts on 401/403 | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-05 | fetchData() returns null after 3 retries on 500 | Unit | BVA | Jest | ✅ |
| GITHUB-UNIT-06 | fetchData() returns null after 3 retries on network error | Unit | Error Guessing | Jest | ✅ |
| GITHUB-UNIT-07 | updateData() returns success and toasts on valid data | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-08 | updateData() returns INVALID_DATA on null, missing fields, wrong types | Unit | Decision Table | Jest | ✅ |
| GITHUB-UNIT-09 | updateData() returns INVOKE_ERROR when supabase returns error | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-10 | updateData() returns NETWORK_ERROR when invoke throws TypeError | Unit | Error Guessing | Jest | ✅ |
| GITHUB-UNIT-11 | updateData() retries and succeeds on second attempt | Unit | Error Guessing | Jest | ✅ |
| GITHUB-UNIT-12 | uploadImage() returns image path on success without sha | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-13 | uploadImage() returns image path on success with sha (file exists) | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-14 | uploadImage() returns null and toasts when PUT fails | Unit | EP | Jest | ✅ |
| GITHUB-UNIT-15 | uploadImage() returns null and toasts when fetch throws | Unit | Error Guessing | Jest | ✅ |

---

### 2.10 Component Tests
**Risk:** Medium — UI regression coverage

| ID | Component | Scenarios | Tool | Status |
|----|-----------|-----------|------|--------|
| COMP-01 | NavBar | Rendering, active state, admin access, login dialog, mobile menu | Jest + RTL | ✅ |
| COMP-02 | NavLink | Rendering, active state, className merging, forwardRef | Jest + RTL | ✅ |
| COMP-03 | ProtectedRoute | Renders children when authenticated, redirects when not | Jest + RTL | ✅ |
| COMP-04 | LeagueHeader | Rendering, progress bar, logo interactions, lightbox | Jest + RTL | ✅ |
| COMP-05 | StandingsTable | Rendering, numbers display | Jest + RTL | ✅ |
| COMP-06 | TopScorers | Rendering, sorting & filtering, edit/delete buttons | Jest + RTL | ✅ |
| COMP-07 | MatchHistory | Rendering, pagination, match detail popup | Jest + RTL | ✅ |
| COMP-08 | MatchForm | Rendering, scorer management, form submission | Jest + RTL | ✅ |
| COMP-09 | PlayerForm | Rendering, form behavior, add/edit actions | Jest + RTL | ✅ |
| COMP-10 | UnsavedChanges | Rendering, save button, mobile expand | Jest + RTL | ✅ |
| COMP-11 | ImageLightbox | Rendering, close behavior, upload | Jest + RTL | ✅ |

---

### 2.11 Utility Unit Tests

| ID | Module | Scenarios | Tool | Status |
|----|--------|-----------|------|--------|
| UTIL-01 | standingsUtils | calculatePoints, calculateGoalDifference, sortTeams (4 tiebreaker criteria) | Jest | ✅ |
| UTIL-02 | matchHistoryUtils | reverseMatches, getMatchListTitle, getScorersForTeam, getDisplayedMatches, hasMoreThanDefaultMatches | Jest | ✅ |
| UTIL-03 | matchFormUtils | calculateEffectiveGoals, populateEditForm, resetForm | Jest | ✅ |
| UTIL-04 | playerFormUtils | generateImageFilename, populatePlayerForm, resetPlayerForm | Jest | ✅ |
| UTIL-05 | scorersUtils | sortPlayers (4 tiebreaker criteria), getScorers, getNonScorers, getVisiblePlayers, canDeletePlayer, getTeam | Jest | ✅ |
| UTIL-06 | leagueHeaderUtils | calculateMatchProgress, getLeagueStatus | Jest | ✅ |

---

## 3. Test Data

### GitHub API
All E2E tests intercept GitHub API calls using `cy.intercept()`. The base fixture is `cypress/fixtures/leagueData.json`. The `LeagueData` POM class provides helpers to manipulate fixture data at runtime without hitting the real API.

### Auth
- Valid password: `0217`
- Invalid passwords: `wrongpassword`, `""`, `" "`

### Player Names (from fixture)
- Home team: Antoine Griezmann, Kylian Mbappé, and others
- Away team: Ruud Gullit, Didier Drogba, Ramy Bensebaini, and others

---

## 4. Page Object Model Structure

| POM Class | Responsibility |
|-----------|---------------|
| `AdminPage` | Admin page actions + dialog state machine navigation |
| `ConfigDialog` | League name, league type, target matches, image, next/cancel |
| `ConfirmationDialog` | Back button, archive button, spinner, success assertion |
| `LeagueData` | Fixture manipulation and `cy.intercept()` setup |
| `MatchForm` | Score input, scorer rows, own goal, submit, close, date |
| `MatchHistory` | Match history assertions and match selection for edit/delete |
| `PlayerForm` | Add, edit, delete player interactions and error assertions |
| `TopScorers` | Top scorers list assertions |