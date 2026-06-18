# Static Code Review — StandingsTable.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/StandingsTable.tsx`
**Status:** LOW RISK

---

## Summary

| Severity | Count | Category                        |
|----------|-------|---------------------------------|
| Minor    | 5     | Code Quality / Architecture     |
| Trivial  | 2     | Style / Maintainability         |
| **Total**| **7** |                                 |

---

## Findings

### FIND-01 — Hardcoded Theme Values
- **Severity:** Minor
- **Location:** `StandingsTableProps` interface
- **Status:** ❌ Not fixed
- **Description:** Theme is defined as a hardcoded string union `'default' | 'ramadan'`. Adding a new theme requires modifying the component directly.
- **Recommendation:** Extract a shared `Theme` type into `src/lib/types.ts` and import it across all components that share the same theme prop.

---

### FIND-02 — Sort Logic Not Extracted
- **Severity:** Minor
- **Location:** `sortedTeams` inside component body
- **Status:** ✅ Fixed — extracted to `src/lib/standingsUtils.ts`
- **Description:** Sorting logic was inlined directly in the component, making it impossible to test in isolation without rendering.
- **Recommendation:** Extracted to `sortTeams()` in `src/lib/standingsUtils.ts`.

---

### FIND-03 — Implicit `any` in Sort Comparator
- **Severity:** Minor
- **Location:** `sortedTeams` sort callback
- **Status:** ✅ Fixed — typed as `Team`
- **Description:** `a` and `b` were typed as `any`, disabling TypeScript checks inside the comparator.
- **Recommendation:** Resolved by exporting and importing the `Team` interface from `leagueStore.ts`.

---

### FIND-04 — Team Interface Not Exported
- **Severity:** Minor
- **Location:** `src/store/leagueStore.ts`
- **Status:** ✅ Fixed — `Team` is now exported
- **Description:** `Team` interface was defined but not exported, forcing components to use `any` when referencing team objects.
- **Recommendation:** Ideally all shared interfaces (`Team`, `Player`, `Match`) should be moved to `src/lib/types.ts`.

---

### FIND-05 — Incomplete Tie-breaking
- **Severity:** Minor
- **Location:** `sortTeams()` in `src/lib/standingsUtils.ts`
- **Status:** ✅ Fixed — added goals scored and alphabetical fallback
- **Description:** Original sort only went to goal difference. If two teams had equal points and equal goal difference, order was undefined.
- **Recommendation:** Added tie-breakers in order — goals scored, then alphabetical by name as last resort.

---

### FIND-06 — Inline Style Usage
- **Severity:** Trivial
- **Location:** `<div style={{ animationDelay: '0.1s' }}>`
- **Status:** ❌ Not fixed
- **Description:** Inline style used for animation delay. Violates the no-inline-styles ESLint rule.
- **Recommendation:** Move to a CSS class in `src/index.css`.

---

### FIND-07 — isRamadan Boolean Spread Throughout JSX
- **Severity:** Trivial
- **Location:** Throughout JSX return
- **Status:** ❌ Not fixed
- **Description:** `isRamadan` boolean is checked repeatedly across every element. Adding a third theme would require touching every conditional.
- **Recommendation:** Extract theme-specific class maps into a object at the top of the component to centralize theme logic.

---

## Overall Assessment
`StandingsTable` is a low-risk component. All logic findings have been resolved through the refactor. Remaining findings are cosmetic and maintainability concerns that can be addressed in a future theming refactor.