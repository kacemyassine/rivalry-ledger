# Static Code Review — PlayerForm.tsx

**Reviewer:** Yassine Kacem
**Date:** May 2026
**File:** `src/components/PlayerForm.tsx`
**Status:** LOW RISK

---

## Summary

| Severity | Count | Category                    |
|----------|-------|-----------------------------|
| Minor    | 3     | Code Quality / Architecture |
| **Total**| **3** |                             |

---

## Findings

### FIND-01 — Implicit `any` Throughout Component
- **Severity:** Minor
- **Location:** `PlayerFormProps`, `players?.find()`, `teams?.map()` callbacks
- **Status:** ❌ Not fixed
- **Description:** `onSave`, player find callback, and team map callback all use `any` instead of proper types.
- **Recommendation:** Type `onSave` as `(updatedData: LeagueData) => void`, import and use `Player` and `Team` interfaces for all callbacks.

---

### FIND-02 — Hardcoded Fallback Team ID
- **Severity:** Minor
- **Location:** `useState<string>(teams?.[0]?.id || 'team1')`
- **Status:** ❌ Not fixed
- **Description:** `'team1'` is hardcoded as a fallback when no teams are available. If team IDs ever change this silently defaults to a non-existent team.
- **Recommendation:** Use `''` as fallback and handle the empty state explicitly in the form validation.

---

### FIND-03 — Filename Generation Logic Not Extracted
- **Severity:** Minor
- **Location:** `handleSubmit` — filename generation inside the async block
- **Status:** ❌ Not fixed
- **Description:** `name.trim().replace(/\s+/g, '-').toLowerCase()` is inlined inside the submit handler. It's a pure function that could be extracted and tested in isolation.
- **Recommendation:** Extract to `generateImageFilename(name: string, file: File): string` in `src/lib/playerFormUtils.ts`.

---

## Overall Assessment
`PlayerForm` is a low-risk component. Most of its logic is async and React-state dependent making it unsuitable for unit testing at this layer. The only extractable pure logic is the filename generation in FIND-03. Remaining findings are code quality concerns to be addressed in a future refactor.