import {
  calculateEffectiveGoals,
  populateEditForm,
  resetForm,
} from "../../src/lib/matchFormUtils";
import {
  getMockLeagueData,
  getMockMatchById,
  getMockPlayerByTeamId,
  getMockPlayersByTeamId,
} from "../fixtures/mockSelectors";

const dataWithScorers = getMockLeagueData({
  withMatches: true,
  withScorers: true,
});

describe("matchFormUtils", () => {
  describe("calculateEffectiveGoals()", () => {
    test("calculates regular goals correctly for a team", () => {
      const [player1, player2] = getMockPlayersByTeamId(
        dataWithScorers,
        "team-1",
        2,
      );
      const player3 = getMockPlayerByTeamId(dataWithScorers, "team-2");
      const scorers = [
        { playerId: player1.id, goals: 2, isOwnGoal: false }, // team-1
        { playerId: player2.id, goals: 1, isOwnGoal: false }, // team-1
        { playerId: player3.id, goals: 1, isOwnGoal: false }, // team-2 — should not count
      ];
      const result = calculateEffectiveGoals(
        scorers,
        dataWithScorers.players,
        "team-1",
      );
      expect(result).toBe(3);
    });

    test("counts own goals from opposing team", () => {
      const player1 = getMockPlayerByTeamId(dataWithScorers, "team-1");
      const player2 = getMockPlayerByTeamId(dataWithScorers, "team-2");
      const scorers = [
        { playerId: player2.id, goals: 1, isOwnGoal: true }, // team-2 OG — counts for team-1
        { playerId: player1.id, goals: 1, isOwnGoal: true }, // team-1 OG — does not count for team-1
      ];
      const result = calculateEffectiveGoals(
        scorers,
        dataWithScorers.players,
        "team-1",
      );
      expect(result).toBe(1);
    });

    test("returns 0 for empty scorers", () => {
      expect(
        calculateEffectiveGoals([], dataWithScorers.players, "team-1"),
      ).toBe(0);
    });
  });

  describe("populateEditForm()", () => {
    test("populates form state correctly from a match", () => {
      const match = getMockMatchById(dataWithScorers, "match-1");
      const result = populateEditForm(match);
      expect(result.homeGoals).toBe(match.homeGoals);
      expect(result.awayGoals).toBe(match.awayGoals);
      expect(result.scorers).toEqual(match.scorers);
      expect(result.date).toBe(
        new Date(match.date).toISOString().split("T")[0],
      );
    });

    test("falls back to today when match has no date", () => {
      jest.useFakeTimers().setSystemTime(new Date("2026-05-20"));
      const match = {
        ...getMockMatchById(dataWithScorers, "match-1"),
        date: "",
      };
      const result = populateEditForm(match);
      expect(result.date).toBe("2026-05-20");
      jest.useRealTimers();
    });
  });

  describe('resetForm()', () => {
  test('returns default form state', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-20'));
    const result = resetForm();
    expect(result.homeGoals).toBe(0);
    expect(result.awayGoals).toBe(0);
    expect(result.scorers).toEqual([]);
    expect(result.date).toBe('2026-05-20');
    jest.useRealTimers();
  });
});
});
