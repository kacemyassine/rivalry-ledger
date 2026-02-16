// Auth utility for managing admin sessions
const AUTH_TOKEN_KEY = 'atlantis_admin_token';
const ADMIN_PASSWORD = '0217';

type Listener = (isAuthenticated: boolean) => void;

export const AuthService = {
  listeners: [] as Listener[],

  // Generate a simple token
  generateToken: (): string => {
    return `admin_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  // Authenticate with password and create session
  authenticate: (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const token = AuthService.generateToken();
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      AuthService.notifyListeners(true);
      return true;
    }
    return false;
  },

  // Check if user has valid session
  isAuthenticated: (): boolean => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  // Logout and clear session
  logout: (): void => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    AuthService.notifyListeners(false);
  },

  // Listener management
  addListener: (callback: Listener) => {
    AuthService.listeners.push(callback);
  },

  removeListener: (callback: Listener) => {
    AuthService.listeners = AuthService.listeners.filter((cb) => cb !== callback);
  },

  // Notify all listeners about auth state change
  notifyListeners: (state: boolean) => {
    AuthService.listeners.forEach((cb) => cb(state));
  },
};
