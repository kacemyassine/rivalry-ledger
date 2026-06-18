# Static Code Review — MatchHistory.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/MatchHistory.tsx`
**Status:** MEDIUM RISK

---

## Summary

| Severity | Count | Category                        |
|----------|-------|---------------------------------|
| Major    | 1     | Accessibility                   |
| Minor    | 3     | Code Quality / Architecture     |
| Trivial  | 1     | Style / Maintainability         |
| **Total**| **5** |                                 |

---

## Findings

### FIND-01 — Buttons Missing Accessible Title
- **Severity:** Major
- **Location:** Multiple `<button>` elements throughout the component
- **Status:** ❌ Not fixed
- **Description:** Buttons with only icon children have no discernible text — screen readers cannot identify them. Violates ESLint a11y rule.
- **Recommendation:** Add `aria-label` to all icon-only buttons e.g. `<button aria-label="Close match details">`, `<button aria-label="Match options">`.

---

### FIND-02 — Implicit `any` Throughout Component
- **Severity:** Minor
- **Location:** `selectedMatch`, `contextMenu`, `matchToDelete` state, all `.map()` callbacks
- **Status:** ❌ Not fixed
- **Description:** `Match`, `Team`, and `Player` types exist in the store but `any` is used everywhere, disabling TypeScript checks.
- **Recommendation:** Export `Match` and `Player` from `leagueStore.ts` and type all state and callbacks properly.

---

### FIND-03 — Inline Style Usage
- **Severity:** Trivial
- **Location:** `style={{ animationDelay: '0.3s' }}` and context menu position styles
- **Status:** ❌ Not fixed
- **Description:** ESLint no-inline-styles warning. Static animation delay should move to a CSS class. Context menu dynamic positioning is an acceptable exception and should be documented.
- **Recommendation:** Move `animationDelay` to `src/index.css`. Keep dynamic context menu positioning but add a comment explaining why inline style is necessary there.

---

### FIND-04 — Hardcoded Team IDs in teamColor Helper
- **Severity:** Minor
- **Location:** `teamColor()` function
- **Status:** ❌ Not fixed
- **Description:** `'team1'` is hardcoded as a string literal. If team IDs ever change this silently breaks with no TypeScript warning.
- **Recommendation:** Compare against `teams[0].id` / `teams[1].id` dynamically instead of hardcoding the string.

---

### FIND-05 — Hardcoded Theme Values and isRamadan Spread Throughout JSX
- **Severity:** Minor
- **Location:** `MatchHistoryProps` interface and throughout JSX
- **Status:** ❌ Not fixed
- **Description:** Same issue as `StandingsTable` and `TopScorers` — theme is a hardcoded string union and `isRamadan` boolean is checked on every element. Adding a third theme requires touching every conditional.
- **Recommendation:** Centralize `Theme` type in `src/lib/types.ts` and extract theme class maps into an object at the top of the component.

---

## Overall Assessment
`MatchHistory` is a medium-risk component. The most critical finding is FIND-01 — icon-only buttons with no accessible text violate accessibility standards. FIND-02 and FIND-04 are the most impactful code quality issues. Remaining findings are consistent with patterns already documented across other components and should be addressed in a future theming and accessibility refactor.