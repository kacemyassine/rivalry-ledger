import { AuthService } from "../../src/lib/authService";
import { AUTH_ERRORS } from "../../src/lib/authErrors";


/* 
  Note: since we are working on testEnvironment: "jsdom", 
  we have access to sessionStorage in our tests without needing to mock it.
  It is manually cleared in beforeEach to ensure a clean state between tests.
*/


describe("AuthService", () => {
  beforeEach(() => {
    AuthService.listeners = [];
    sessionStorage.clear();
    AuthService.resetAttempts();
  });

  // ================================================================
  // unit tests for authenticate()
  // ================================================================

  describe("authenticate()", () => {
    test("returns true and creates a session on correct password", () => {
      expect(AuthService.authenticate("0217")).toBe(true);
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    test("returns false and creates no session on wrong password", () => {
      expect(AuthService.authenticate("wrong")).toBe(false);
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    test("returns false for empty string", () => {
      expect(AuthService.authenticate("")).toBe(false);
    });

    test("is case-sensitive", () => {
      expect(AuthService.authenticate("0217 ")).toBe(false);
    });
  });

  // ================================================================
  //  unit tests forisAuthenticated()
  // ================================================================

  describe("isAuthenticated()", () => {
    test("returns false when no session exists", () => {
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    test("returns true after successful authentication", () => {
      AuthService.authenticate("0217");
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    test("returns false after logout", () => {
      AuthService.authenticate("0217");
      AuthService.logout();
      expect(AuthService.isAuthenticated()).toBe(false);
    });

    test("returns false if token is removed from sessionStorage externally", () => {
      AuthService.authenticate("0217");
      sessionStorage.clear();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  // ================================================================
  //  unit tests for logout()
  // ================================================================

  describe("logout()", () => {
    test("clears the session token from sessionStorage", () => {
      AuthService.authenticate("0217");
      AuthService.logout();
      expect(sessionStorage.getItem("atlantis_admin_token")).toBeNull();
    });

    test("is a no-op when called without an active session", () => {
      expect(() => AuthService.logout()).not.toThrow();
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });

  // ================================================================
  // unit tests for generateToken()
  // ================================================================

  describe("generateToken()", () => {
    test("returns a non-empty string", () => {
      expect(AuthService.generateToken()).toBeTruthy();
    });

    test("returns a unique value on each call", () => {
      const a = AuthService.generateToken();
      const b = AuthService.generateToken();
      expect(a).not.toBe(b);
    });

    test("token starts with admin_ prefix", () => {
      expect(AuthService.generateToken().startsWith("admin_")).toBe(true);
    });
  });

  // ================================================================
  // Listeners
  // ================================================================

  describe("addListener() / removeListener() / notifyListeners()", () => {
    test("listener is called with true on successful authentication", () => {
      const cb = jest.fn();
      AuthService.addListener(cb);
      AuthService.authenticate("0217");
      expect(cb).toHaveBeenCalledWith(true);
    });

    test("listener is called with false on logout", () => {
      const cb = jest.fn();
      AuthService.authenticate("0217");
      AuthService.addListener(cb);
      AuthService.logout();
      expect(cb).toHaveBeenCalledWith(false);
    });

    test("listener is NOT called on failed authentication", () => {
      const cb = jest.fn();
      AuthService.addListener(cb);
      AuthService.authenticate("wrong");
      expect(cb).not.toHaveBeenCalled();
    });

    test("removed listener is not called after removal", () => {
      const cb = jest.fn();
      AuthService.addListener(cb);
      AuthService.removeListener(cb);
      AuthService.authenticate("0217");
      expect(cb).not.toHaveBeenCalled();
    });

    test("multiple listeners are all notified", () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      AuthService.addListener(cb1);
      AuthService.addListener(cb2);
      AuthService.authenticate("0217");
      expect(cb1).toHaveBeenCalledWith(true);
      expect(cb2).toHaveBeenCalledWith(true);
    });

    test("removing one listener does not affect others", () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      AuthService.addListener(cb1);
      AuthService.addListener(cb2);
      AuthService.removeListener(cb1);
      AuthService.authenticate("0217");
      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalledWith(true);
    });
  });

  // ================================================================
  // Brute-force protection
  // ================================================================

  describe('brute-force protection', () => {
  test('throws RATE_LIMITED after 3 failed attempts', () => {
    AuthService.authenticate('wrong'); // 1 → false
    AuthService.authenticate('wrong'); // 2 → false
    expect(() => AuthService.authenticate('wrong')).toThrow(AUTH_ERRORS.RATE_LIMITED); // 3 → throws
  });

  test('throws RATE_LIMITED even with correct password after 3 failed attempts', () => {
    AuthService.authenticate('wrong'); // 1 → false
    AuthService.authenticate('wrong'); // 2 → false
    expect(() => AuthService.authenticate('0217')).toBeTruthy(); // 3 → passes without throwing
  });

  test('throws LOCKED_OUT after 5 failed attempts', () => {
    AuthService.authenticate('wrong');                                                  // 1 → false
    AuthService.authenticate('wrong');                                                  // 2 → false
    expect(() => AuthService.authenticate('wrong')).toThrow(AUTH_ERRORS.RATE_LIMITED); // 3 → throws
    expect(() => AuthService.authenticate('wrong')).toThrow(AUTH_ERRORS.RATE_LIMITED); // 4 → throws
    expect(() => AuthService.authenticate('wrong')).toThrow(AUTH_ERRORS.LOCKED_OUT);   // 5 → locked
    expect(() => AuthService.authenticate('0217')).toThrow(AUTH_ERRORS.LOCKED_OUT);
  });

  test('resetAttempts allows authentication again after failed attempts', () => {
    AuthService.authenticate('wrong');                                                  // 1 → false
    AuthService.authenticate('wrong');                                                  // 2 → false
    expect(() => AuthService.authenticate('wrong')).toThrow(AUTH_ERRORS.RATE_LIMITED); // 3 → throws
    AuthService.resetAttempts();
    expect(AuthService.authenticate('0217')).toBe(true);
  });
});
});
