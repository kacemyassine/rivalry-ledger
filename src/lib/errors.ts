import { PLAYER_NAME_RULES, SQUAD_RULES, MAX_GOALS } from '@/lib/rules';

export const MATCH_ERRORS = {
  GOALS_NEGATIVE: 'Goals cannot be negative',
  GOALS_UNREALISTIC: `Goals cannot exceed ${MAX_GOALS}`,
  SCORER_GOALS_MISMATCH: /Goals don't add up/,
  SAME_TEAM: 'Home and away teams cannot be the same',
  NOT_FOUND: 'Match not found — either deleted or never existed',
};

export const PLAYER_ERRORS = {
  NAME_REQUIRED: 'Player name is required',
  NAME_INVALID: `Player name must be between ${PLAYER_NAME_RULES.minLength} and ${PLAYER_NAME_RULES.maxLength} characters`,
  NAME_INVALID_CHARS: 'Player name must contain only letters, spaces, hyphens, and apostrophes',
  DUPLICATE: 'Player with the same name already exists in the team',
  NOT_FOUND: 'Player not found',
  WRONG_TEAM: 'Player does not belong to the scoring team',
  NAME_INVALID_BOUNDARIES: 'Player name must start and end with a letter',
  GOALS_READONLY: 'Goals cannot be edited directly — they are managed by match operations only',
  HAS_GOALS: 'Cannot delete a player with goals',
  MIN_SQUAD_SIZE: `Squad must have more than ${SQUAD_RULES.minSize} players`,
};

export const TEAM_ERRORS = {
  NOT_FOUND: 'Team not found',
};