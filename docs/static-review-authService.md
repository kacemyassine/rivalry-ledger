# Static Code Review — AuthService.ts

**Reviewer:** Yassine Kacem  
**Date:** May 2026  
**File:** `src/services/authService.ts`  
**Status:** CRITICAL RISK  

---

## Summary

| Severity   | Count | Category                    |
|------------|-------|-----------------------------|
| Critical   | 2     | Security / Authentication   |
| Major      | 2     | Vulnerability / Brute Force |
| Minor      | 1     | Code Quality                |
| Trivial    | 1     | Naming / Standards          |
| **Total**  | **6** |                             |

---

## Findings

---

### FIND-01 — Hardcoded Credentials in Client Bundle
- **Severity:** Critical  
- **Location:** `const ADMIN_PASSWORD = '0217';`  
- **Description:** The administrative password is stored as a plain-text constant within the frontend source code.  
- **Impact:** Anyone can inspect the browser source and extract the password. This fully compromises admin security.  
- **Recommendation:** Move authentication to a backend service. If not possible, store a hashed value (e.g. SHA-256) using an environment variable such as `VITE_ADMIN_HASH`.

---

### FIND-02 — Vulnerable to Brute Force Attacks
- **Severity:** Critical  
- **Location:** `authenticate()` function  
- **Description:** No rate limiting, lockout, or cooldown mechanism exists.  
- **Impact:** Attackers can brute-force all combinations extremely quickly due to client-side execution.  
- **Recommendation:** Add exponential backoff, attempt limits (e.g. 5 tries), and temporary lockout.

---

### FIND-03 — Weak Session Token Integrity
- **Severity:** Major  
- **Location:** `isAuthenticated()` function  
- **Description:** Authentication is based only on token existence in `sessionStorage`.  
- **Impact:** Any manually inserted value grants admin access.  
- **Recommendation:** Validate token structure, use signed tokens (JWT), or backend verification.

---

### FIND-04 — Use of Math.random() for Security Tokens
- **Severity:** Major  
- **Location:** `generateToken()` function  
- **Description:** `Math.random()` is not cryptographically secure.  
- **Impact:** Predictable session tokens may allow session hijacking.  
- **Recommendation:** Use `crypto.randomUUID()` or `window.crypto.getRandomValues()`.

---

### FIND-05 — Manual Listener Management (Potential Memory Leaks)
- **Severity:** Minor  
- **Location:** Auth event listener system  
- **Description:** Listeners are manually stored and removed. Missing cleanup can cause memory leaks.  
- **Impact:** Ghost updates and unnecessary memory usage.  
- **Recommendation:** Use `EventTarget`, RxJS, or a proper state management library.

---

### FIND-06 — Inconsistent Storage Strategy
- **Severity:** Trivial  
- **Location:** `sessionStorage` usage  
- **Description:** Session-based storage may confuse users expecting persistent login.  
- **Recommendation:** Clarify UX behavior or implement optional persistent login.

---

## Overall Assessment

The current `AuthService` relies heavily on client-side logic, which makes it unsuitable for real security.

Key issue categories:
- No backend validation
- Weak authentication model
- Fully bypassable session logic

**Conclusion:** This implementation is acceptable only for prototypes, not production systems.