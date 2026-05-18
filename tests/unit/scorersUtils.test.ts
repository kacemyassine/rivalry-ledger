import {
  sortPlayers,
  getScorers,
  getNonScorers,
  getVisiblePlayers,
  canDeletePlayer,
} from "../../src/lib/scorersUtils";
import {
  getMockPlayerById,
  getMockPlayersByTeamId,
  getMockPlayerByTeamId,
} from "../fixtures/mockSelectors";
import { SQUAD_RULES } from "../../src/lib/rules";

describe("scorersUtils", () => {
  describe("sortPlayers()", () => {
    test("sorts players by goals descending", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 2 },
        { ...getMockPlayerById("player-2"), goals: 5 },
        { ...getMockPlayerById("player-3"), goals: 1 },
      ];
      const result = sortPlayers(players);
      expect(result[0].id).toBe("player-2");
    });

    test("treats undefined goals as 0", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: undefined as any },
        { ...getMockPlayerById("player-2"), goals: 3 },
      ];
      const result = sortPlayers(players);
      expect(result[0].id).toBe("player-2");
    });

    test("does not mutate the original array", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 0 },
        { ...getMockPlayerById("player-2"), goals: 5 },
      ];
      sortPlayers(players);
      expect(players[0].id).toBe("player-1"); // player-2 should be first if mutated
    });
  });

  describe("getScorers()", () => {
    test("returns only players with goals > 0", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 3 },
        { ...getMockPlayerById("player-2"), goals: 0 },
        { ...getMockPlayerById("player-3"), goals: 1 },
      ];
      const result = getScorers(players);
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.goals > 0)).toBe(true);
    });

    test("returns empty array when no players have goals", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 0 },
        { ...getMockPlayerById("player-2"), goals: 0 },
      ];
      expect(getScorers(players)).toHaveLength(0);
    });
  });

  describe("getNonScorers()", () => {
    test("returns only players with 0 goals", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 3 },
        { ...getMockPlayerById("player-2"), goals: 0 },
      ];
      const result = getNonScorers(players);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("player-2");
    });

    test("returns all players when none have scored", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 0 },
        { ...getMockPlayerById("player-2"), goals: 0 },
      ];
      expect(getNonScorers(players)).toHaveLength(2);
    });
  });

  describe("getVisiblePlayers()", () => {
    test("returns only scorers when showAll is false", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 3 },
        { ...getMockPlayerById("player-2"), goals: 0 },
      ];
      const result = getVisiblePlayers(players, false);
      expect(result).toHaveLength(1);
      expect(result[0].goals).toBeGreaterThan(0);
    });

    test("returns all players sorted when showAll is true", () => {
      const players = [
        { ...getMockPlayerById("player-1"), goals: 3 },
        { ...getMockPlayerById("player-2"), goals: 0 },
      ];
      const result = getVisiblePlayers(players, true);
      expect(result).toHaveLength(2);
      expect(result[0].goals).toBe(3);
    });
  });

  describe("canDeletePlayer()", () => {
    const originalMinSize = SQUAD_RULES.minSize;

    beforeAll(() => {
      (SQUAD_RULES as { minSize: number }).minSize = 1;
    });

    afterAll(() => {
      (SQUAD_RULES as { minSize: number }).minSize = originalMinSize;
    });

    test("returns true when player has 0 goals and squad exceeds min size", () => {
      const player = { ...getMockPlayerByTeamId("team-1"), goals: 0 };
      const teamPlayers = getMockPlayersByTeamId(
        "team-1",
        SQUAD_RULES.minSize + 1,
      );
      expect(canDeletePlayer(player, teamPlayers)).toBe(true);
    });

    test("returns false when player has goals", () => {
      const player = { ...getMockPlayerByTeamId("team-1"), goals: 3 };
      const teamPlayers = getMockPlayersByTeamId(
        "team-1",
        SQUAD_RULES.minSize + 1,
      );
      expect(canDeletePlayer(player, teamPlayers)).toBe(false);
    });

    test("returns false when squad is at min size", () => {
      const player = { ...getMockPlayerByTeamId("team-1"), goals: 0 };
      const teamPlayers = getMockPlayersByTeamId("team-1", SQUAD_RULES.minSize);
      expect(canDeletePlayer(player, teamPlayers)).toBe(false);
    });

    test("returns false when squad is below min size", () => {
      const player = { ...getMockPlayerByTeamId("team-1"), goals: 0 };
      const teamPlayers = getMockPlayersByTeamId("team-1", 0);
      expect(canDeletePlayer(player, teamPlayers)).toBe(false);
    });
  });
});
