import { PLAYER_NAME_RULES } from "../playerNameRules";

export const PLAYER_ERRORS = {
  NAME_REQUIRED: "Player name is required",
  NAME_INVALID: `Player name must be between ${PLAYER_NAME_RULES.minLength} and ${PLAYER_NAME_RULES.maxLength} characters`,
  NAME_INVALID_CHARS:
    "Player name must contain only letters, spaces, hyphens, and apostrophes",
  DUPLICATE: "Player with the same name already exists in the team",
  NOT_FOUND: "Player not found",
  WRONG_TEAM: "Player does not belong to the scoring team",
  NAME_INVALID_BOUNDARIES: "Player name must start and end with a letter",
};
