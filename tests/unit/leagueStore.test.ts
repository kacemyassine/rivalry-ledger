import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueData } from "./fixtures/mockLeagueData";

beforeEach(() => {
  localStorage.clear();
  useLeagueStore.setState({
    teams: mockLeagueData.teams,
    players: mockLeagueData.players,
    matches: mockLeagueData.matches,
  });
});

// =================================================================
// Tests for addMatch function
// =================================================================

describe("addMatch", () => {
  describe("when adding a match with valid data", () => {
    describe("points calculation", () => {
      test("home win -> home team gains 3 points, away team gains 0 points", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].points).toBe(3);
        expect(teams[1].points).toBe(0);
      });

      test("away win -> away team gains 3 points, home team gains 0 points", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(1, 2, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].points).toBe(0);
        expect(teams[1].points).toBe(3);
      });

      test("draw -> both teams gain 1 point", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(0, 0, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].points).toBe(1);
        expect(teams[1].points).toBe(1);
      });

      test("multiple matches -> points are accumulated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, []);
        addMatch(1, 2, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].points).toBe(3);
        expect(teams[1].points).toBe(3);
      });
    });

    describe("goals calculation", () => {
      test("home goals and away goals are updated correctly when home team wins", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(3, 2, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].goalsFor).toBe(3);
        expect(teams[0].goalsAgainst).toBe(2);
        expect(teams[1].goalsFor).toBe(2);
        expect(teams[1].goalsAgainst).toBe(3);
      });

      test("home goals and away goals are updated correctly when away team wins", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 3, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].goalsFor).toBe(2);
        expect(teams[0].goalsAgainst).toBe(3);
        expect(teams[1].goalsFor).toBe(3);
        expect(teams[1].goalsAgainst).toBe(2);
      });

      test("home goals and away goals are updated correctly when it is a draw", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 2, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].goalsFor).toBe(2);
        expect(teams[0].goalsAgainst).toBe(2);
        expect(teams[1].goalsFor).toBe(2);
        expect(teams[1].goalsAgainst).toBe(2);
      });
    });

    describe("matches played calculation", () => {
      test("matches played is updated correctly for both teams", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(1, 0, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].played).toBe(1);
        expect(teams[1].played).toBe(1);
      });

      test("matches played is accumulated correctly over multiple matches", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 2, []);
        addMatch(1, 1, []);

        const { teams } = useLeagueStore.getState();
        expect(teams[0].played).toBe(2);
        expect(teams[1].played).toBe(2);
      });
    });

    describe("scorers and players goals", () => {
      test("sum of goals scored by players matches total goals for the team", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(3, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 2 },
          { playerId: mockLeagueData.players[1].id, goals: 1 },
        ]);
        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(2);
        expect(players[1].goals).toBe(1);
      });

      test("players' goals are updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 1 },
          { playerId: mockLeagueData.players[1].id, goals: 1 },
          { playerId: mockLeagueData.players[2].id, goals: 1 },
        ]);

        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(1);
        expect(players[1].goals).toBe(1);
        expect(players[2].goals).toBe(1);
      });

      test("player scoring more than once in a match has their goals updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(3, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 2 },
          { playerId: mockLeagueData.players[1].id, goals: 1 },
        ]);
        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(2);
        expect(players[1].goals).toBe(1);
      });

      test("own goals are handled correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 1 },
          {
            playerId: mockLeagueData.players[1].id,
            goals: 1,
            isOwnGoal: true,
          },
        ]);
        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(1);
        expect(players[1].goals).toBe(0);
      });

      test("a player scroing an own goal and a regular goal in the same match has their goals updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 1 },
          {
            playerId: mockLeagueData.players[0].id,
            goals: 1,
            isOwnGoal: true,
          },
        ]);
        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(1);
      });

      test.skip("player with multiple goals listed more than once)", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(3, 0, [
          { playerId: mockLeagueData.players[0].id, goals: 1 },
          { playerId: mockLeagueData.players[0].id, goals: 2 },
        ]);
        const { players } = useLeagueStore.getState();
        expect(players[0].goals).toBe(3);
      });
    });
  });
  describe("when adding a match with invalid data", () => {
    test.skip("throws an error if home goals is negative", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() => addMatch(-1, 2, [])).toThrow("Goals cannot be negative");
      });

    test.skip("throws an error if away goals is negative", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() => addMatch(2, -1, [])).toThrow("Goals cannot be negative");
      });

    test.skip("throws an error if scorers data contains a playerId that does not exist", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() =>
          addMatch(2, 1, [{ playerId: "non-existent", goals: 1 }]),
        ).toThrow("Player not found");
      });

    test.skip("throws an error if scorers data contains a playerId that belongs to the opposing team", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() =>
          addMatch(2, 1, [
            { playerId: mockLeagueData.players[3].id, goals: 1 },
          ]),
        ).toThrow("Player does not belong to the scoring team");
      });
    test.skip("throws an error if any paramater has a wrong type", () => {
        const { addMatch } = useLeagueStore.getState();
        // @ts-expect-error : testing runtime type validation
        expect(() => addMatch("two", 1, [])).toThrow();
        // @ts-expect-error : testing runtime type validation
        expect(() => addMatch(2, "one", [])).toThrow();
        // @ts-expect-error : testing runtime type validation
        expect(() => addMatch(2, 1, "not an array")).toThrow();
      });
    test.skip("unrealiscally high number of goals throws an error", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() => addMatch(999, 999, [])).toThrow(
          "Unrealistic number of goals",
        );
      });

    test.skip("Scorer goals sum doesn't match total goals throws an error", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() =>
          addMatch(2, 1, [
            { playerId: mockLeagueData.players[0].id, goals: 1 },
            { playerId: mockLeagueData.players[1].id, goals: 1 },
            // Total goals is 3 but scorers only account for 2
          ]),
        ).toThrow("Scorer goals do not match total goals");
      });

    test.skip("Scorer goals sum exceeds total goals throws an error", () => {
        const { addMatch } = useLeagueStore.getState();
        expect(() =>
          addMatch(2, 1, [
            { playerId: mockLeagueData.players[0].id, goals: 2 },
            { playerId: mockLeagueData.players[1].id, goals: 1 },
            // Total goals is 3 but scorers account for 4
          ]),
        ).toThrow("Scorer goals do not match total goals");
      });
    });
  });
