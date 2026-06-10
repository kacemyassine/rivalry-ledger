export const AUTH_ERRORS = {
  LOCKED_OUT: 'Too many failed attempts. Try again in 30 seconds.',
  RATE_LIMITED: 'Too many attempts. Please slow down.',
  INCORRECT_PASSWORD: "Incorrect password",
} as const;