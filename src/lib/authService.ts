import { AUTH_ERRORS } from './authErrors';

const AUTH_TOKEN_KEY = 'atlantis_admin_token';
const ADMIN_PASSWORD = '0217';
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30_000; // 30 seconds

type Listener = (isAuthenticated: boolean) => void;

// Module-level state — intentionally outside the object so it
// cannot be reset by callers directly
let failedAttempts = 0;
let lockoutUntil: number | null = null;

export const AuthService = {
  listeners: [] as Listener[],

  generateToken: (): string => {
    return `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  authenticate: (password: string): boolean => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      throw new Error(AUTH_ERRORS.LOCKED_OUT);
    }

    if (failedAttempts >= RATE_LIMIT_ATTEMPTS) {
      throw new Error(AUTH_ERRORS.RATE_LIMITED);
    }

    if (password === ADMIN_PASSWORD) {
      failedAttempts = 0;
      lockoutUntil = null;
      const token = AuthService.generateToken();
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      AuthService.notifyListeners(true);
      return true;
    }

    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_DURATION;
    }
    return false;
  },

  isAuthenticated: (): boolean => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  logout: (): void => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    AuthService.notifyListeners(false);
  },

  // Exposed for tests only — resets brute-force state
  resetAttempts: (): void => {
    failedAttempts = 0;
    lockoutUntil = null;
  },

  addListener: (callback: Listener) => {
    AuthService.listeners.push(callback);
  },

  removeListener: (callback: Listener) => {
    AuthService.listeners = AuthService.listeners.filter((cb) => cb !== callback);
  },

  notifyListeners: (state: boolean) => {
    AuthService.listeners.forEach((cb) => cb(state));
  },
};
