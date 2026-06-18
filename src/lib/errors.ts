import { PLAYER_NAME_RULES, SQUAD_RULES, MAX_GOALS } from "@/lib/rules";

export const MATCH_ERRORS = {
  GOALS_NEGATIVE: "Goals cannot be negative",
  GOALS_UNREALISTIC: `Goals cannot exceed ${MAX_GOALS}`,
  SCORER_GOALS_MISMATCH: /Goals don't add up/,
  SAME_TEAM: "Home and away teams cannot be the same",
  NOT_FOUND: "Match not found — either deleted or never existed",
  TARGET_REACHED: "League is complete — no more matches can be recorded",
};

export const PLAYER_ERRORS = {
  NAME_REQUIRED: "Player name is required",
  NAME_INVALID: `Player name must be between ${PLAYER_NAME_RULES.minLength} and ${PLAYER_NAME_RULES.maxLength} characters`,
  NAME_INVALID_CHARS:
    "Player name must contain only letters, spaces, hyphens, and apostrophes",
  DUPLICATE: "Player with the same name already exists in the team",
  NOT_FOUND: "Player not found",
  WRONG_TEAM: "Player does not belong to the scoring team",
  NAME_INVALID_BOUNDARIES: "Player name must start and end with a letter",
  GOALS_READONLY:
    "Goals cannot be edited directly — they are managed by match operations only",
  HAS_GOALS: "Cannot delete a player with goals",
  MIN_SQUAD_SIZE: `Squad must have more than ${SQUAD_RULES.minSize} players`,
};

export const TEAM_ERRORS = {
  NOT_FOUND: "Team not found",
};

export const API_ERRORS = {
  LEAGUE_NOT_FOUND: "League data not found",
  ACCESS_DENIED: "Access denied",
  GENERIC_ERROR: "Something went wrong, try again later",
  CONNECTION_ERROR: "Could not connect, check your internet connection",

  SAVE_DATA_INTEGRITY: "Failed to save — data integrity check failed",

  UPDATE_GITHUB_FAILED: "Failed to update data on GitHub",

  ARCHIVE_FAILED: "Failed to archive league",

  IMAGE_UPLOAD_FAILED: "Failed to upload image",

  CUPS_FETCH_FAILED: "Failed to fetch cups",

  ARCHIVE_INDEX_FETCH_FAILED: "Failed to fetch archive index",
} as const;

export const API_SUCCESS = {
  SAVE_SUCCESS: "Data saved to GitHub successfully!",
  ARCHIVE_SUCCESS: "League archived and new league started!",
  CUP_SAVE_SUCCESS: "Cup saved successfully!",
} as const;
