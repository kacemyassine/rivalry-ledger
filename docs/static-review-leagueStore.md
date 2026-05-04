# Static Code Review — leagueStore.ts

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/store/leagueStore.ts`
**Lines Reviewed:** 363
**Branch:** feature/RLQ-48-jest-leaguestore-unit-tests

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| Major | 4 |
| Minor | 5 |
| Trivial | 1 |
| **Total** | **12** |

---

## Findings

---

### FIND-01 — No validation on localStorage data (loadState)
**Severity:** Critical
**Location:** `loadState()` function
**Description:**
`loadState` parses localStorage data and spreads it directly into the store with no schema validation. If the data is corrupted, malformed, or from an outdated schema version, the entire store initializes with bad data silently. The only error handling is a `console.error` which is invisible to the user.
**Impact:** The entire application state depends on `loadState`. Corrupted data propagates into every action, every calculation, and every component that reads state.
**Recommendation:** Validate parsed data against the expected schema before applying it to state. Fall back to `defaultLeagueData` on validation failure and surface the error to the user.

---

### FIND-02 — Corrupted localStorage can propagate to GitHub remote data
**Severity:** Critical
**Location:** `loadState()` → `saveState()` → GitHub push flow
**Description:**
localStorage is user-accessible via browser DevTools. The app reads from localStorage with no validation and saves state to GitHub. A user can modify localStorage directly, causing the app to load corrupt data and push it to the remote GitHub data source, corrupting data for all users.
**Impact:** Data integrity risk for all users. Attack vector is trivial — open DevTools, edit localStorage, trigger a save.
**Note:** The `saveToGitHub` function was not fully reviewed — it may have additional safeguards. Risk to be verified.
**Recommendation:** Validate state before any GitHub push operation. Consider a checksum or schema version field.

---

### FIND-03 — `resetLeague` does not reset all state fields
**Severity:** Major
**Location:** `resetLeague()` function
**Description:**
`resetLeague` resets teams, players, matches, and league metadata but does not reset `selectedHomeTeam`, `selectedAwayTeam`, `hasChanges`, or `changeLog`. After a reset, the store is in an inconsistent state.
**Impact:** Stale UI state after league reset. Could cause unexpected behavior in components reading those fields.
**Recommendation:** Reset all state fields in `resetLeague`, including UI state fields.

---

### FIND-04 — `editMatch` function signature has 5 inline parameters
**Severity:** Major
**Location:** `LeagueState` interface — `editMatch` signature
**Description:**
`editMatch` accepts 5 positional parameters including an inline scorer type definition. Positional parameters increase the risk of passing arguments in the wrong order. The scorer type is duplicated inline instead of using a named type.
**Recommendation:** Refactor to accept a named `MatchUpdate` interface as the second parameter.

---

### FIND-05 — No duplicate player validation in `addPlayer`
**Severity:** Major
**Location:** `addPlayer()` function
**Description:**
A player with the same name can be added multiple times. Each entry receives a unique ID via `Date.now()`. The app accepts both entries without any uniqueness check.
**Impact:** Goals get split across duplicate player entries. Top scorers and standings display incorrect data.
**Recommendation:** Check for existing player by name before inserting. Return early or throw an error if duplicate found.

---

### FIND-06 — Silent failure on match guard check in `addMatch`
**Severity:** Major
**Location:** `addMatch()` — guard clause
**Description:**
```ts
if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) {
  return;
}
```
If the guard triggers, the function exits silently with no error, no log, and no user feedback. The admin clicks record and nothing happens with no explanation.
**Recommendation:** Surface a meaningful error to the user when the guard condition is met.

---

### FIND-07 — `LeagueState` interface is monolithic
**Severity:** Minor
**Location:** `LeagueState` interface
**Description:**
The interface mixes data state, UI state, and actions in a single 25+ member interface. This violates separation of concerns and makes the interface hard to read and maintain.
**Recommendation:** Split into at least 3 interfaces — `LeagueData`, `UIState`, `LeagueActions` — and compose them into `LeagueStore = LeagueData & UIState & LeagueActions`.

---

### FIND-08 — `selectedHomeTeam` and `selectedAwayTeam` are dead state
**Severity:** Minor
**Location:** `LeagueState` interface, `addMatch()`, `resetLeague()`
**Description:**
The app only supports two fixed teams that are auto-assigned. `selectedHomeTeam` and `selectedAwayTeam` are never meaningfully set by the user — `addMatch` immediately falls back to `teams[0]` and `teams[1]`. These fields add complexity with no purpose.
**Recommendation:** Remove these fields and reference teams by index directly, or introduce a proper team selection mechanism if needed in the future.

---

### FIND-09 — `Scorer` type is not extracted — DRY violation
**Severity:** Minor
**Location:** `LeagueState` interface — `addMatch` and `editMatch` signatures
**Description:**
The scorer shape `{ playerId: string; goals: number; isOwnGoal?: boolean }` is defined inline in both `addMatch` and `editMatch`. If the shape ever changes, it must be updated in multiple places.
**Recommendation:** Extract as a named `Scorer` type and reuse across the interface and `Match` definition.

---

### FIND-10 — Stat calculation logic duplicated across actions
**Severity:** Minor
**Location:** `addMatch()`, `deleteMatch()`, `editMatch()`
**Description:**
Win/draw/loss detection, points calculation, and goals tally logic is duplicated across three functions. Three places to maintain the same logic.
**Recommendation:** Extract into a pure utility function `calculateTeamStats(team, goals, result, operation)`. Easier to maintain and easier to unit test in isolation.

---

### FIND-11 — `loadState` return type is implicit `any`
**Severity:** Minor
**Location:** `loadState()` function
**Description:**
`loadState` has no explicit return type annotation. TypeScript infers `any`, losing all type safety at the entry point of state hydration.
**Recommendation:** Annotate return type as `Partial<LeagueState>` or a dedicated `PersistedState` interface.

---

### FIND-12 — Single-letter variable names used in `.map()` callbacks
**Severity:** Trivial
**Location:** `addMatch()`, `deleteMatch()`, `editMatch()` — `.map()` callbacks
**Description:**
Variable `t` is used instead of `team` and `s` instead of `scorer` inside `.map()` callbacks. Reduces readability and forces the reader to infer what the variable represents from context.
**Recommendation:** Use `team` and `scorer` for clarity and consistency. Alternatively, inline comments can serve as a lightweight solution if the developer prefers shorter variable names for speed.

---

## Overall Assessment

The core logic of `addMatch`, `deleteMatch`, and `editMatch` appears functionally correct. The main risks are concentrated in state initialization (`loadState`) and data persistence — both lack validation and error handling. The duplicate player bug (FIND-05) is a confirmed functional defect. The architectural issues (FIND-07, FIND-09, FIND-10) are maintainability concerns that will cause pain as the codebase grows.

These findings will directly inform the unit test suite — particularly the edge cases around corrupted state, duplicate players, and stat reversal logic.