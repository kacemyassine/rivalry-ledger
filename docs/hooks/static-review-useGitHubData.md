# Static Code Review — useGitHubData.ts

**Reviewer:** Yassine Kacem  
**Date:** May 2026  
**File:** `src/hooks/useGitHubData.ts`  
**Status:** MODERATE RISK  

---

## Summary

| Severity   | Count | Category                        |
|------------|-------|---------------------------------|
| Critical   | 1     | Bug / Wrong Configuration       |
| Major      | 1     | Risk / API Abuse                |
| Minor      | 1     | Security / Token Exposure       |
| **Total**  | **3** |                                 |

---

## Findings

---

### FIND-01 — Hardcoded Wrong or Obsolete Repo Name
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

## Overall Assessment

The hook is a clean and well-structured abstraction over `githubUtils.ts`. The main concerns are operational — wrong repo name causing immediate failures, and no protection against API abuse on write paths.

**Conclusion:** FIND-01 must be fixed before any further testing or deployment. FIND-02 and FIND-03 should be addressed before production release.