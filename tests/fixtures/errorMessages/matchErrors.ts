export const MAX_GOALS = 20;

export const MATCH_ERRORS = {
  GOALS_NEGATIVE: "Goals cannot be negative",
  GOALS_UNREALISTIC: `Goals cannot exceed ${MAX_GOALS}`,
  SCORER_GOALS_MISMATCH: /Goals don't add up/,
  SAME_TEAM: "Home and away teams cannot be the same",
  NOT_FOUND: "Match not found — either deleted or never existed",
};