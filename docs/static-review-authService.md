# Static Code Review — AuthService.ts

**Reviewer:** Yassine Kacem  
**Date:** May 2026  
**File:** `src/services/authService.ts`  
**Status:** CRITICAL RISK  

---

## Summary

| Severity   | Count | Category                        |
|------------|-------|---------------------------------|
| Critical   | 2     | Security / Authentication       |
| Major      | 2     | Vulnerability / Brute Force     |
| Minor      | 1     | Code Quality                    |
| Trivial    | 1     | Naming / Standards              |
| **Total**  | **6** |                                 |

---

## Findings

### FIND-01 — Hardcoded Credentials in Client Bundle
- **Severity:** Critical  
- **Location:** `const ADMIN_PASSWORD = '0217';`  
- **Description:** The administrative password is stored as a plain-text constant within the frontend source code.  
- **Impact:** Anyone can open the browser's "Sources" or "Network" tab and search for the string. The security of the entire admin panel is non-existent as the "key" is taped to the front door.  
- **Recommendation:** Move authentication to a backend service. If a backend is unavailable, use an environment variable (`VITE_ADMIN_HASH`) and store a SHA-256 hash of the password instead of the raw string.  

---

### FIND-02 — Vulnerable to Brute Force Attacks
- **Severity:** Critical  
- **Location:** `authenticate()` function  
- **Description:** The authentication check is synchronous and lacks rate-limiting, cooldown, or account lockout logic.  
- **Impact:** A simple script can attempt all 10,000 combinations (`0000–9999`) in under a second. Since the logic runs locally in the browser, there is zero latency to slow down an attacker.  
- **Recommendation:** Implement Exponential Backoff (e.g., wait 1s, then 5s, then 30s) after failed attempts and lock the interface after 5 consecutive failures.  

---

### FIND-03 — Weak Session Token Integrity
- **Severity:** Major  
- **Location:** `isAuthenticated()` function  
- **Description:** The check for a valid session only verifies the existence of a key in `sessionStorage`. It does not validate the content or format of the token.  
```ts
return !!token; // Returns true if any string exists
# Static Code Review — AuthService.ts

**Reviewer:** Yassine Kacem  
**Date:** May 2026  
**File:** `src/services/authService.ts`  
**Status:** CRITICAL RISK  

---

## Summary

| Severity   | Count | Category                        |
|------------|-------|---------------------------------|
| Critical   | 2     | Security / Authentication       |
| Major      | 2     | Vulnerability / Brute Force     |
| Minor      | 1     | Code Quality                    |
| Trivial    | 1     | Naming / Standards              |
| **Total**  | **6** |                                 |

---

## Findings

### FIND-01 — Hardcoded Credentials in Client Bundle
- **Severity:** Critical  
- **Location:** `const ADMIN_PASSWORD = '0217';`  
- **Description:** The administrative password is stored as a plain-text constant within the frontend source code.  
- **Impact:** Anyone can open the browser's "Sources" or "Network" tab and search for the string. The security of the entire admin panel is non-existent as the "key" is taped to the front door.  
- **Recommendation:** Move authentication to a backend service. If a backend is unavailable, use an environment variable (`VITE_ADMIN_HASH`) and store a SHA-256 hash of the password instead of the raw string.  

---

### FIND-02 — Vulnerable to Brute Force Attacks
- **Severity:** Critical  
- **Location:** `authenticate()` function  
- **Description:** The authentication check is synchronous and lacks rate-limiting, cooldown, or account lockout logic.  
- **Impact:** A simple script can attempt all 10,000 combinations (`0000–9999`) in under a second. Since the logic runs locally in the browser, there is zero latency to slow down an attacker.  
- **Recommendation:** Implement Exponential Backoff (e.g., wait 1s, then 5s, then 30s) after failed attempts and lock the interface after 5 consecutive failures.  

---

### FIND-03 — Weak Session Token Integrity
- **Severity:** Major  
- **Location:** `isAuthenticated()` function  
- **Description:** The check for a valid session only verifies the existence of a key in `sessionStorage`. It does not validate the content or format of the token.  
```ts
return !!token; // Returns true if any string exists
### FIND-03 — Weak Session Token Integrity
- **Severity:** Major  
- **Location:** `isAuthenticated()` function  
- **Description:** The check for a valid session only verifies the existence of a key in `sessionStorage`. It does not validate the content or format of the token.  
- **Impact:** A user can manually create a key named `atlantis_admin_token` in the Application console and set it to any value (e.g., `"123"`) to gain full administrative access.  
- **Recommendation:** Update `isAuthenticated` to validate the token's prefix (`admin_`) and timestamp format, or use a signed JWT if moving to a backend.  

---

### FIND-04 — Use of Math.random() for Security Tokens
- **Severity:** Major  
- **Location:** `generateToken()` function  
- **Description:** `Math.random()` is not cryptographically secure. The resulting tokens are predictable.  
- **Impact:** Allows for session hijacking patterns if an attacker can predict the next generated token.  
- **Recommendation:** Use `window.crypto.getRandomValues()` or `crypto.randomUUID()` for token generation.  

---

### FIND-05 — Manual Listener Management (Potential Memory Leaks)
- **Severity:** Minor  
- **Location:** `addListener` / `removeListener`  
- **Description:** The service relies on a manual array of listeners. If a component is unmounted without calling `removeListener`, the callback stays in memory.  
- **Impact:** Potential memory leaks and "ghost" UI updates where a deleted component still reacts to auth changes.  
- **Recommendation:** Consider using a standard `EventTarget` or a state management store (like Zustand) to handle auth state subscriptions.  

---

### FIND-06 — Inconsistent use of sessionStorage vs localStorage
- **Severity:** Trivial  
- **Location:** `AuthService`  
- **Description:** The current use of `sessionStorage` is safer as it clears on tab close, but it may conflict with user expectations of "Remember Me."  
- **Recommendation:** This is functionally fine, but ensure the UI reflects that the session will end when the tab is closed.  

---

## Overall Assessment
The current `AuthService` provides **Security through Obscurity** only. It is vulnerable to trivial manual bypasses (Token Injection) and automated attacks (Brute Force).


