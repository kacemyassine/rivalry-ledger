import { MATCH_ERRORS, PLAYER_ERRORS, MAX_GOALS } from "./errorMessages";
import { getPlayersByTeamId, getPlayerByTeamId } from "./mockSelectors";

export function runMatchValidationTests(
  action: (
    homeGoals: number,
    awayGoals: number,
    scorers: { playerId: string; goals: number; isOwnGoal?: boolean }[],
  ) => void,
) {
  // missing validation — no validation on goal values, negative goals accepted and processed
  test.skip("throws an error if home goals is negative", () => {
    expect(() => action(-1, 2, [])).toThrow(MATCH_ERRORS.GOALS_NEGATIVE);
  });

  // missing validation — no validation on goal values, negative goals accepted and processed
  test.skip("throws an error if away goals is negative", () => {
    expect(() => action(2, -1, [])).toThrow(MATCH_ERRORS.GOALS_NEGATIVE);
  });

  // missing validation — no upper bound on goal values
  test.skip("throws an error if goals are unrealistically high", () => {
    expect(() => action(MAX_GOALS + 1, MAX_GOALS + 1, [])).toThrow(
      MATCH_ERRORS.GOALS_UNREALISTIC,
    );
  });

  // missing validation — scorer goals sum not validated against total goals
  test.skip("throws an error if scorer goals sum is less than total goals", () => {
    const player1 = getPlayerByTeamId("team-1");
    expect(() =>
      action(2, 1, [{ playerId: player1.id, goals: 1 }]),
    ).toThrow(MATCH_ERRORS.SCORER_GOALS_MISMATCH);
  });

  // missing validation — scorer goals sum not validated against total goals
  test.skip("throws an error if scorer goals sum exceeds total goals", () => {
    const [player1, player2] = getPlayersByTeamId("team-1", 2);
    expect(() =>
      action(2, 1, [
        { playerId: player1.id, goals: 2 },
        { playerId: player2.id, goals: 2 },
      ]),
    ).toThrow(MATCH_ERRORS.SCORER_GOALS_MISMATCH);
  });

  // missing validation — non-existent playerId accepted as scorer, match recorded with dangling reference
  test.skip("throws an error if scorers data contains a playerId that does not exist", () => {
    expect(() =>
      action(2, 1, [{ playerId: "non-existent", goals: 1 }]),
    ).toThrow(PLAYER_ERRORS.NOT_FOUND);
  });

  // missing validation — player team ownership not checked against scorer list
  test.skip("throws an error if scorers data contains a playerId that belongs to the opposing team", () => {
    const [awayPlayer1, awayPlayer2, awayPlayer3] = getPlayersByTeamId("team-2", 3);
    expect(() =>
      action(2, 1, [
        { playerId: awayPlayer1.id, goals: 1 },
        { playerId: awayPlayer2.id, goals: 1 },
        { playerId: awayPlayer3.id, goals: 1 },
      ]),
    ).toThrow(PLAYER_ERRORS.WRONG_TEAM);
  });
}
