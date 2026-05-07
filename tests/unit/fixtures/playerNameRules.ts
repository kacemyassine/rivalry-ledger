export const PLAYER_NAME_RULES = {
  minLength: 3,
  maxLength: 40,
  validPattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
} as const;