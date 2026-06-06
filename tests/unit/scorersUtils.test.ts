import {
  sortPlayers,
  getScorers,
  getNonScorers,
  getVisiblePlayers,
  canDeletePlayer,
  getTeam,
} from "../../src/lib/scorersUtils";
import {
  getMockPlayerById,
  getMockPlayersByTeamId,
  getMockLeagueData,
  getMockTeamById,
} from "../fixtures/mockSelectors";
import { SQUAD_RULES } from "../../src/lib/rules";

const data = getMockLeagueData();

const player = (id: string, overrides = {}) => ({
  ...getMockPlayerById(data, id),
  ...overrides,
});
const team = (id: string, overrides = {}) => ({
  ...getMockTeamById(data, id),
  ...overrides,
});
describe("scorersUtils", () => {
  describe("sortPlayers()", () => {
    test("sorts players by goals descending", () => {
      const players = [
        player("player-1", { goals: 2 }),
        player("player-2", { goals: 5 }),
        player("player-3", { goals: 1 }),
      ];
      const result = sortPlayers(players);
      expect(result[0].id).toBe("player-2");
      expect(result[1].id).toBe("player-1");
      expect(result[2].id).toBe("player-3");
    });

    test("sorts players by team points when goals are equal", () => {
      const teams = [
        team("team-1", { won: 3, drawn: 0 }),
        team("team-2", { won: 2, drawn: 1 }),
      ];
      const players = [
        player("player-1", { goals: 3, teamId: "team-1" }),
        player("player-2", { goals: 3, teamId: "team-2" }),
      ];
      const result = sortPlayers(players, teams);
      expect(result[0].id).toBe("player-1");
      expect(result[1].id).toBe("player-2");
    });

    test("sorts players by team goal difference when players have same goals and team points", () => {
      const teams = [
        team("team-1", { won: 2, drawn: 1, goalsFor: 10, goalsAgainst: 5 }),
        team("team-2", { won: 2, drawn: 1, goalsFor: 8, goalsAgainst: 6 }),
      ];
      const players = [
        player("player-1", { goals: 3, teamId: "team-1" }),
        player("player-2", { goals: 3, teamId: "team-2" }),
      ];
      const result = sortPlayers(players, teams);
      expect(result[0].id).toBe("player-1");
      expect(result[1].id).toBe("player-2");
    });

    test("sorts players alphabetically when goals, team points, and goal difference are all equal", () => {
      const teams = [
        team("team-1", { won: 2, drawn: 1, goalsFor: 10, goalsAgainst: 5 }),
        team("team-2", { won: 2, drawn: 1, goalsFor: 10, goalsAgainst: 5 }),
      ];
      const players = [
        player("player-1", { goals: 3, teamId: "team-1", name: "Mbappe" }),
        player("player-2", { goals: 3, teamId: "team-1", name: "Zidan" }),
      ];
      const result = sortPlayers(players, teams);
      expect(result[0].id).toBe("player-1");
      expect(result[1].id).toBe("player-2");
    });
  });
  describe("sortPlayers()  - edge cases", () => {
    test("treats undefined goals as 0", () => {
      const players = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        player("player-1", { goals: undefined } as any),
        player("player-2", { goals: 5 }),
      ];
      const result = sortPlayers(players);
      expect(result[0].id).toBe("player-2");
    });

    test("does not mutate the original array", () => {
      const players = [
        player("player-1", { goals: 0 }),
        player("player-2", { goals: 5 }),
      ];
      sortPlayers(players);
      expect(players[0].id).toBe("player-1"); // player-2 should be first if mutated
    });
  });

  describe("getScorers()", () => {
    test("returns only players with goals > 0", () => {
      const players = [
        player("player-1", { goals: 3 }),
        player("player-2", { goals: 0 }),
        player("player-3", { goals: 1 }),
      ];
      const result = getScorers(players);
      expect(result).toHaveLength(2);
      expect(result.every((p) => p.goals > 0)).toBe(true);
    });

    test("returns empty array when no players have goals", () => {
      const players = [
        player("player-1", { goals: 0 }),
        player("player-2", { goals: 0 }),
      ];
      expect(getScorers(players)).toHaveLength(0);
    });
  });

  describe("getNonScorers()", () => {
    test("returns only players with 0 goals", () => {
      const players = [
        player("player-1", { goals: 3 }),
        player("player-2", { goals: 0 }),
      ];
      const result = getNonScorers(players);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("player-2");
    });

    test("returns all players when none have scored", () => {
      const players = [
        player("player-1", { goals: 0 }),
        player("player-2", { goals: 0 }),
      ];
      expect(getNonScorers(players)).toHaveLength(2);
    });
    test("returns empty array when all players have scored", () => {
      const players = [
        player("player-1", { goals: 1 }),
        player("player-2", { goals: 2 }),
      ];
      expect(getNonScorers(players)).toHaveLength(0);
    });
  });

  describe("getVisiblePlayers()", () => {
    test("returns only scorers when showAll is false", () => {
      const players = [
        player("player-1", { goals: 3 }),
        player("player-2", { goals: 0 }),
      ];
      const result = getVisiblePlayers(players, data.teams, false);
      expect(result).toHaveLength(1);
      expect(result[0].goals).toBeGreaterThan(0);
    });

    test("returns all players sorted when showAll is true", () => {
      const players = [
        player("player-1", { goals: 3 }),
        player("player-2", { goals: 0 }),
      ];
      const result = getVisiblePlayers(players, data.teams, true);
      expect(result).toHaveLength(2);
      expect(result[0].goals).toBe(3);
    });
    test("returns empty array when no players are provided", () => {
      const result = getVisiblePlayers([], data.teams, false);
      expect(result).toHaveLength(0);
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
      const Player = player("player-1", { goals: 0 });
      const teamPlayers = getMockPlayersByTeamId(
        data,
        "team-1",
        SQUAD_RULES.minSize + 1,
      );
      expect(canDeletePlayer(Player, teamPlayers)).toBe(true);
    });

    test("returns false when player has goals", () => {
      const Player = player("player-1", { goals: 3 });
      const teamPlayers = getMockPlayersByTeamId(
        data,
        "team-1",
        SQUAD_RULES.minSize + 1,
      );
      expect(canDeletePlayer(Player, teamPlayers)).toBe(false);
    });

    test("returns false when squad is at min size", () => {
      const Player = player("player-1", { goals: 0 });
      const teamPlayers = getMockPlayersByTeamId(
        data,
        "team-1",
        SQUAD_RULES.minSize,
      );
      expect(canDeletePlayer(Player, teamPlayers)).toBe(false);
    });

    test("returns false when squad is below min size", () => {
      const Player = player("player-1", { goals: 0 });
      const teamPlayers = getMockPlayersByTeamId(data, "team-1", 0);
      expect(canDeletePlayer(Player, teamPlayers)).toBe(false);
    });
  });

  describe("getTeam()", () => {
  test("returns the correct team by id", () => {
    const result = getTeam("team-1", data.teams);
    expect(result?.id).toBe("team-1");
  });

  test("returns undefined when team is not found", () => {
    const result = getTeam("non-existent", data.teams);
    expect(result).toBeUndefined();
  });

  test("returns undefined when teams array is empty", () => {
    const result = getTeam("team-1", []);
    expect(result).toBeUndefined();
  });
});
});
