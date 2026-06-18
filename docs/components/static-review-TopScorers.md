# Static Code Review — TopScorers.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/TopScorers.tsx`
**Status:** MEDIUM RISK

---

## Summary

| Severity | Count | Category                        |
|----------|-------|---------------------------------|
| Major    | 1     | Error Handling                  |
| Minor    | 4     | Code Quality / Architecture     |
| **Total**| **5** |                                 |

---

## Findings

### FIND-01 — Implicit `any` Throughout Component
- **Severity:** Minor
- **Location:** `sortedPlayers`, `getTeam`, `scorers`, `nonScorers`, `visiblePlayers`, `.map()` callbacks
- **Status:** ❌ Not fixed
- **Description:** `Player` and `Team` types are available in the store but `any` is used everywhere, disabling TypeScript checks.
- **Recommendation:** Import and use `Player` and `Team` interfaces throughout the component.

---

### FIND-02 — Logic Not Extracted
- **Severity:** Minor
- **Location:** `sortedPlayers`, `scorers`, `nonScorers`, `visiblePlayers`, `canDelete`
- **Status:** ❌ Not fixed
- **Description:** All logic is inlined in the component making it impossible to test in isolation without rendering.
- **Recommendation:** Extract to `src/lib/scorersUtils.ts`.

---

### FIND-03 — Silent Failure on Store Errors
- **Severity:** Major
- **Location:** `const { players = [], teams = [], deletePlayer } = useLeagueStore()`
- **Status:** ❌ Not fixed
- **Description:** If `players` or `teams` fail to load, they silently default to empty arrays. The user sees an empty list with no indication something went wrong and may think the league has no data.
- **Recommendation:** Add an error state to the store and display an explicit error message in the component when data fails to load.

---

### FIND-04 — Silent Null on Missing Player Image
- **Severity:** Minor
- **Location:** `{player.image ? <img .../> : <User icon />}`
- **Status:** ❌ Not fixed
- **Description:** When a player has no image, it silently falls back to a generic user icon with no communication to the user. If `fullImage` is also missing, clicking does nothing — no feedback at all.
- **Recommendation:** Show a placeholder with a tooltip or label saying "Photo coming soon" instead of a silent generic icon.

---

### FIND-05 — Hardcoded Theme Values and isRamadan Spread Throughout JSX
- **Severity:** Minor
- **Location:** `TopScorersProps` interface and throughout JSX
- **Status:** ❌ Not fixed
- **Description:** Theme is a hardcoded string union `'default' | 'ramadan'` and `isRamadan` boolean is checked on every single element. Adding a third theme requires touching every conditional.
- **Recommendation:** Centralize `Theme` type in `src/lib/types.ts` and extract theme class maps into an object at the top of the component.

---

## Overall Assessment
`TopScorers` is a medium-risk component. The most critical finding is FIND-03 — silent failure on store errors could mislead users into thinking their league data is empty. Remaining findings are code quality and maintainability concerns to be addressed in future refactor and component testing layers.