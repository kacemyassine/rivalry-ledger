# Static Code Review — LeagueHeader.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/LeagueHeader.tsx`
**Status:** MEDIUM RISK

---

## Summary

| Severity | Count | Category                    |
|----------|-------|-----------------------------|
| Critical | 1     | Bug                         |
| Minor    | 4     | Code Quality / Architecture |
| Trivial  | 1     | Style / Maintainability     |
| **Total**| **6** |                             |

---

## Findings

### FIND-01 — updateTeamLogo Called Twice (Bug)
- **Severity:** Critical
- **Location:** `handleLogoUpload` — end of function
- **Status:** ❌ Not fixed
- **Description:** `updateTeamLogo(teamId, path)` is called twice in a row. The second call is a duplicate that was likely left in accidentally. If `path` is `null` the second call overwrites the valid logo with `null`.
- **Recommendation:** Remove the duplicate call.

---

### FIND-02 — Hardcoded Team IDs
- **Severity:** Minor
- **Location:** `teams.find(t => t.id === 'team1')` and `teams.find(t => t.id === 'team2')`
- **Status:** ❌ Not fixed
- **Description:** `'team1'` and `'team2'` are hardcoded string literals. If team IDs change this silently breaks.
- **Recommendation:** Use `teams[0]` and `teams[1]` directly instead of finding by hardcoded ID.

---

### FIND-03 — Progress Calculation Logic Not Extracted
- **Severity:** Minor
- **Location:** `matchProgress` and `overallProgress` calculations
- **Status:** ❌ Not fixed
- **Description:** Progress calculation is inlined in the component making it impossible to test in isolation.
- **Recommendation:** Extract to `calculateMatchProgress(matches, targetMatches)` in `src/lib/leagueHeaderUtils.ts`.

---

### FIND-04 — League Status Logic Not Extracted
- **Severity:** Minor
- **Location:** Ternary inside JSX — `matches.length === 0 ? '⏳ Beginning Soon' : matches.length >= targetMatches ? '🏆 Finished' : '⚽ In Progress'`
- **Status:** ❌ Not fixed
- **Description:** League status logic is buried inside JSX making it untestable.
- **Recommendation:** Extract to `getLeagueStatus(matches, targetMatches)` in `src/lib/leagueHeaderUtils.ts`.

---

### FIND-05 — Hardcoded Theme Values and isRamadan Spread Throughout JSX
- **Severity:** Minor
- **Location:** `LeagueHeaderProps` interface and throughout JSX
- **Status:** ❌ Not fixed
- **Description:** Same issue as all other components — hardcoded theme string union and `isRamadan` boolean checked on every element.
- **Recommendation:** Centralize `Theme` type in `src/lib/types.ts`.

---

### FIND-06 — Inline Style Usage
- **Severity:** Trivial
- **Location:** Bubble decorative elements `style={{ animationDelay: '...' }}`
- **Status:** ❌ Not fixed
- **Description:** Animation delays defined as inline styles. ESLint no-inline-styles warning.
- **Recommendation:** Move to CSS classes in `src/index.css`.

---

## Overall Assessment
`LeagueHeader` is a medium-risk component. FIND-01 is a real bug — the duplicate `updateTeamLogo` call can silently overwrite a valid logo with `null`. Should be fixed immediately. FIND-02 through FIND-05 are consistent with patterns documented across other components.