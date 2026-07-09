// Accepts letters (including accented), spaces, hyphens, and apostrophes.
// Must start and end with a letter. Digits and special characters are rejected.
export const PLAYER_NAME_RULES = {
  minLength: 3,
  maxLength: 40,
  validPattern: /^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'-]*[a-zA-ZÀ-ÿ]$/,
} as const;

export const SQUAD_RULES = {
  minSize: 23,
  defaultMinSize: 11,
};

export const MAX_GOALS = 20;