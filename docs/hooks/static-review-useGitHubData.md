# Static Code Review — useGitHubData.ts

**Reviewer:** Yassine Kacem  
**Date:** May 2026  
**File:** `src/hooks/useGitHubData.ts`  
**Status:** MODERATE RISK  

---

## Summary

| Severity   | Count | Category                                      |
|------------|-------|-----------------------------------------------|
| Critical   | 1     | Bug / Wrong Configuration                     |
| Major      | 4     | Risk / API Abuse / Reliability / Memory Leak  |
| Minor      | 2     | Security / Type Safety                        |
| Trivial    | 1     | Offline Detection                             |
| **Total**  | **8** |                                               |

---

## Findings

---

### FIND-01 — Hardcoded Wrong Repo Name
- **Severity:** Critical  
- **Location:** `GITHUB_CONFIG.repo = 'atlantis-showdown'`  
- **Description:** The repository name is hardcoded to the old value `atlantis-showdown`. The project was renamed to `rivalry-ledger` but this constant was never updated.  
- **Impact:** All API calls — fetch, update, archive, upload — are hitting the wrong repository. Data reads and writes will fail silently or return stale data.  
- **Recommendation:** Update to `repo: 'rivalry-ledger'` and consider moving `GITHUB_CONFIG` to an environment variable to avoid similar issues in the future.

---

### FIND-02 — No Rate Limiting on Write Operations
- **Severity:** Major  
- **Location:** `_updateData`, `_archiveLeague`, `_uploadImage`, `_updateCups`  
- **Description:** All write operations are exposed as plain callbacks with no throttle, debounce, or request deduplication. A component re-render or rapid user interaction can trigger multiple consecutive write calls.  
- **Impact:** GitHub API has a rate limit of 5000 requests/hour. Rapid writes can exhaust the limit, causing all subsequent API calls to fail for the rest of the hour.  
- **Recommendation:** Add debounce or a loading state guard on all write operations to prevent duplicate calls.

---

### FIND-03 — GitHub Token Exposed in Client Bundle
- **Severity:** Minor  
- **Location:** `const TOKEN = import.meta.env.VITE_GITHUB_TOKEN`  
- **Description:** The GitHub token is read from a `VITE_` prefixed environment variable, which means it is embedded in the client-side JavaScript bundle at build time and visible to anyone who inspects the source.  
- **Impact:** Anyone with access to the deployed app can extract the token and use it to read or write to the repository directly.  
- **Recommendation:** Move all GitHub API calls to a backend function or Supabase Edge Function so the token never reaches the client.

---

### FIND-04 — No Retry Mechanism on Transient Failures
- **Severity:** Major  
- **Location:** `fetchData`, `fetchCups`, `fetchArchiveIndex`  
- **Description:** All fetch operations fail immediately on network errors or `5xx` responses with no retry logic. Transient failures — network blips, temporary server unavailability — are treated the same as permanent failures.  
- **Impact:** A single failed request results in a broken UI state with no recovery attempt, even when the issue is temporary.  
- **Recommendation:** Implement exponential backoff retry (max 3 attempts) for `500+` status codes and network throws. Do not retry `404`, `401`, or `403` as these are permanent failures.

---

### FIND-05 — No Request Timeout
- **Severity:** Major  
- **Location:** All `fetch` calls in `githubUtils.ts`  
- **Description:** No timeout is set on any fetch request. If GitHub's servers are slow or unresponsive, the request hangs indefinitely with no resolution.  
- **Impact:** The UI freezes in a loading state permanently with no feedback to the user and no way to recover without a page refresh.  
- **Recommendation:** Use `AbortController` with a timeout (e.g. 10s) on all fetch calls. On timeout, treat it as a network failure and apply the same retry/error handling logic.

---

### FIND-06 — No Request Cancellation on Component Unmount
- **Severity:** Major  
- **Location:** All fetch callbacks in `useGitHubData.ts`  
- **Description:** If a component unmounts while a fetch is in flight, the callback still resolves and attempts to update state on an unmounted component.  
- **Impact:** Memory leak and React warning — "Can't perform a React state update on an unmounted component."  
- **Recommendation:** Use `AbortController` and cancel in-flight requests in a `useEffect` cleanup function.

---

### FIND-07 — No Offline Detection
- **Severity:** Trivial  
- **Location:** All fetch callbacks in `useGitHubData.ts`  
- **Description:** No check for `navigator.onLine` before firing any requests. Requests are dispatched even when the user has no internet connection.  
- **Impact:** Unnecessary failed requests and misleading error messages when the user is simply offline.  
- **Recommendation:** Check `navigator.onLine` before dispatching any request and show a specific "You are offline" message if false.

---

### FIND-08 — `any` Type on `fetchCups` and `updateCups`
- **Severity:** Minor  
- **Location:** `fetchCups`, `updateCups` in `githubUtils.ts`  
- **Description:** Both functions use `any` as the return/parameter type, bypassing TypeScript's type system entirely.  
- **Impact:** Runtime errors from unexpected data shapes will not be caught at compile time. Masks potential bugs silently.  
- **Recommendation:** Define a `CupsData` interface and replace all `any` usages with it.

---

## Overall Assessment

The hook is a clean and well-structured abstraction over `githubUtils.ts`. However it lacks defensive programming across the board — no timeout, no retry, no cancellation, no offline awareness, and no rate limiting on write paths.

**Conclusion:** FIND-01 must be fixed immediately before any further testing or deployment. FIND-02, FIND-04, FIND-05, and FIND-06 must be addressed before production release to ensure stability, resilience, and API quota protection. FIND-03 is a longer-term architectural concern requiring server-side migration. FIND-07 and FIND-08 are lower priority but should be resolved before v1.0.