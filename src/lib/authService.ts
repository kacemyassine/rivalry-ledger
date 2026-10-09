import { AUTH_ERRORS } from "./authErrors";

const AUTH_TOKEN_KEY = "atlantis_admin_token";
const AUTH_LOCKOUT_KEY = "atlantis_admin_lockout";
const ADMIN_PASSWORD = "0217";
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_ATTEMPTS = 3;
const INITIAL_LOCKOUT_DURATION = 30_000;
const MAX_LOCKOUT_DURATION = 86_400_000;

type Listener = (isAuthenticated: boolean) => void;

interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number | null;
  nextLockoutDuration: number;
}

const initialLockoutState = (): LockoutState => ({
  failedAttempts: 0,
  lockoutUntil: null,
  nextLockoutDuration: INITIAL_LOCKOUT_DURATION,
});

const readLockoutState = (): LockoutState => {
  const storedState = localStorage.getItem(AUTH_LOCKOUT_KEY);
  if (storedState === null) return initialLockoutState();

  const state: unknown = JSON.parse(storedState);
  if (
    typeof state !== "object" ||
    state === null ||
    !("failedAttempts" in state) ||
    !Number.isInteger(state.failedAttempts) ||
    state.failedAttempts < 0 ||
    state.failedAttempts > MAX_ATTEMPTS ||
    !("lockoutUntil" in state) ||
    (state.lockoutUntil !== null &&
      (typeof state.lockoutUntil !== "number" ||
        !Number.isFinite(state.lockoutUntil))) ||
    !("nextLockoutDuration" in state) ||
    typeof state.nextLockoutDuration !== "number" ||
    !Number.isFinite(state.nextLockoutDuration) ||
    state.nextLockoutDuration < INITIAL_LOCKOUT_DURATION ||
    state.nextLockoutDuration > MAX_LOCKOUT_DURATION
  ) {
    throw new Error("Stored authentication lockout state is invalid.");
  }

  return state as LockoutState;
};

const writeLockoutState = (state: LockoutState): void => {
  localStorage.setItem(AUTH_LOCKOUT_KEY, JSON.stringify(state));
};

export const AuthService = {
  listeners: [] as Listener[],

  generateToken: (): string => {
    return `admin_${Date.now()}_${crypto.randomUUID()}`;
  },

  authenticate: (password: string): boolean => {
    const state = readLockoutState();
    if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
      throw new Error(AUTH_ERRORS.LOCKED_OUT);
    }

    if (password !== ADMIN_PASSWORD) {
      state.failedAttempts = Math.min(state.failedAttempts + 1, MAX_ATTEMPTS);
      if (state.failedAttempts >= MAX_ATTEMPTS) {
        state.lockoutUntil = Date.now() + state.nextLockoutDuration;
        state.nextLockoutDuration = Math.min(
          state.nextLockoutDuration * 2,
          MAX_LOCKOUT_DURATION,
        );
        writeLockoutState(state);
        throw new Error(AUTH_ERRORS.LOCKED_OUT);
      }
      writeLockoutState(state);
      if (state.failedAttempts >= RATE_LIMIT_ATTEMPTS) {
        throw new Error(AUTH_ERRORS.RATE_LIMITED);
      }
      return false;
    }

    writeLockoutState(initialLockoutState());
    const token = AuthService.generateToken();
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    AuthService.notifyListeners(true);
    return true;
  },

  getRemainingLockout: (): number => {
    const { lockoutUntil } = readLockoutState();
    if (!lockoutUntil) return 0;
    return Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
  },

  isAuthenticated: (): boolean => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    return /^admin_\d+_[0-9a-f-]{36}$/.test(token);
  },

  logout: (): void => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    AuthService.notifyListeners(false);
  },

  // Exposed for tests only — resets brute-force state
  resetAttempts: (): void => {
    localStorage.removeItem(AUTH_LOCKOUT_KEY);
  },

  addListener: (callback: Listener) => {
    if (AuthService.listeners.includes(callback)) {
      console.warn(
        "AuthService: listener already registered — did you forget to call removeListener on unmount?",
      );
    }
    AuthService.listeners.push(callback);
  },

  removeListener: (callback: Listener) => {
    AuthService.listeners = AuthService.listeners.filter(
      (cb) => cb !== callback,
    );
  },

  notifyListeners: (state: boolean) => {
    AuthService.listeners.forEach((cb) => cb(state));
  },
};
