# Static Code Review — MatchForm.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/MatchForm.tsx`
**Status:** LOW RISK

---

## Summary

| Severity | Count | Category                    |
|----------|-------|-----------------------------|
| Minor    | 3     | Code Quality / Architecture |
| **Total**| **3** |                             |

---

## Findings

### FIND-01 — useEffect Logic Not Extracted
- **Severity:** Minor
- **Location:** Both `useEffect` blocks
- **Status:** ❌ Not fixed
- **Description:** Team initialization and edit mode pre-population logic are inlined in `useEffect` callbacks making them impossible to test in isolation.
- **Recommendation:** Extract to pure functions — `populateEditForm(match)` returning form state `{ homeGoals, awayGoals, scorers, date }` and `resetForm()` returning default form state.

---

### FIND-02 — Scorer Validation Logic Not Extracted
- **Severity:** Minor
- **Location:** `handleSubmit` — `effectiveHomeGoals` and `effectiveAwayGoals` reduce blocks
- **Status:** ❌ Not fixed
- **Description:** Goal calculation from scorers is inlined inside the submit handler. It's pure logic that can be extracted and unit tested in isolation.
- **Recommendation:** Extract to `calculateEffectiveGoals(scorers, players, teamId)` in `src/lib/matchFormUtils.ts`.

---

### FIND-03 — Implicit `any` Throughout Component
- **Severity:** Minor
- **Location:** `MatchFormProps`, scorer map callbacks, player/team find callbacks
- **Status:** ❌ Not fixed
- **Description:** `editingMatch`, `onSave`, and multiple callbacks use `any` instead of proper types.
- **Recommendation:** Type `editingMatch` as `Match`, `onSave` as `(updatedData: LeagueData) => void`, import `Player` and `Team` for all callbacks.

---

## Overall Assessment
`MatchForm` is a low-risk component. It is functionality heavy but well structured. The main actionable finding is FIND-02 — extracting scorer validation logic enables proper unit testing of the most critical business logic in the form.