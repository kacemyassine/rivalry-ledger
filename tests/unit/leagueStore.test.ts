import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueData } from "./fixtures/mockLeagueData";
import { MATCH_ERRORS, PLAYER_ERRORS, TEAM_ERRORS} from "./fixtures/errorMessages";

beforeEach(() => {
  localStorage.clear();
  useLeagueStore.setState({
    teams: mockLeagueData.teams,
    players: mockLeagueData.players,
    matches: mockLeagueData.matches,
  });
});

// =================================================================
// Unit Tests for addMatch function
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

      test("a player scoring an own goal and a regular goal in the same match has their goals updated correctly", () => {
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

      // FIND-15: duplicate player entries not summed — store only counts last entry via Array.find()
      test.skip("player listed twice in scorers has their goals summed correctly", () => {
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
    // FIND-13: no validation on goal values — negative goals accepted and processed
    test.skip("throws an error if home goals is negative", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() => addMatch(-1, 2, [])).toThrow(MATCH_ERRORS.GOALS_NEGATIVE);
    });

    // FIND-13: no validation on goal values — negative goals accepted and processed
    test.skip("throws an error if away goals is negative", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() => addMatch(2, -1, [])).toThrow(MATCH_ERRORS.GOALS_NEGATIVE);
    });

    // FIND-14: non-existent playerId accepted as scorer — match recorded with dangling reference
    test.skip("throws an error if scorers data contains a playerId that does not exist", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() =>
        addMatch(2, 1, [{ playerId: "non-existent", goals: 1 }]),
      ).toThrow(PLAYER_ERRORS.NOT_FOUND);
    });

    // missing validation — player team ownership not checked against scorer list
    test.skip("throws an error if scorers data contains a playerId that belongs to the opposing team", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() =>
        addMatch(2, 1, [{ playerId: mockLeagueData.players[3].id, goals: 1 }]),
      ).toThrow(PLAYER_ERRORS.WRONG_TEAM);
    });

    // missing runtime type validation — TypeScript types not enforced at runtime
    test.skip("throws an error if any parameter has a wrong type", () => {
      const { addMatch } = useLeagueStore.getState();
      // @ts-expect-error : testing runtime type validation
      expect(() => addMatch("two", 1, [])).toThrow();
      // @ts-expect-error : testing runtime type validation
      expect(() => addMatch(2, "one", [])).toThrow();
      // @ts-expect-error : testing runtime type validation
      expect(() => addMatch(2, 1, "not an array")).toThrow();
    });

    // missing validation — no upper bound on goal values
    test.skip("unrealistically high number of goals throws an error", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() => addMatch(999, 999, [])).toThrow(MATCH_ERRORS.GOALS_UNREALISTIC);
    });

    // missing validation — scorer goals sum not validated against total goals
    test.skip("scorer goals sum less than total goals throws an error", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() =>
        addMatch(2, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 1 },
          { playerId: mockLeagueData.players[1].id, goals: 1 },
          // Total goals is 3 but scorers only account for 2
        ]),
      ).toThrow(MATCH_ERRORS.SCORER_GOALS_MISMATCH);
    });

    // missing validation — scorer goals sum not validated against total goals
    test.skip("scorer goals sum exceeds total goals throws an error", () => {
      const { addMatch } = useLeagueStore.getState();
      expect(() =>
        addMatch(2, 1, [
          { playerId: mockLeagueData.players[0].id, goals: 2 },
          { playerId: mockLeagueData.players[1].id, goals: 1 },
          // Total goals is 3 but scorers account for 4
        ]),
      ).toThrow(MATCH_ERRORS.SCORER_GOALS_MISMATCH);
    });
  });
});

// =================================================================
// Unit Tests for addPlayer function
// =================================================================

describe("addPlayer", () => {
  test("adds a new player with all required properties to the league with correct data", () => {
    const { addPlayer } = useLeagueStore.getState();

    addPlayer({
      name: "Neymar Jr",
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    });

    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find((p) => p.name === "Neymar Jr");
    expect(addedPlayer).toBeDefined();
  });

  // FIND-05: no teamId validation — addPlayer accepts any teamId including non-existent ones
  test.skip("throws an error if teamId does not exist", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "Zinedine Zidane",
        teamId: "non-existent-team-id",
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(TEAM_ERRORS.NOT_FOUND);
  });

  // FIND-05: no duplicate player validation — same name in same team is accepted silently
  test.skip("throws an error if a player with the same name already exists in the same team", () => {
    // didier drogba is in the mock data and belongs to team-2, so adding another player with the same name to team-2 should throw an error
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "didier drogba",
        teamId: mockLeagueData.teams[1].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.DUPLICATE);
  });

  // FIND-18: no empty name validation in store — UI silently blocks but store accepts empty string
  test.skip("throws an error if player name is empty", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "",
        teamId: mockLeagueData.teams[0].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.NAME_REQUIRED);
  });

  // FIND-18: no whitespace validation in store — UI silently blocks but store accepts whitespace-only strings
  test.skip("throws an error if player name is whitespace only", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "     ",
        teamId: mockLeagueData.teams[0].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.NAME_REQUIRED);
  });

  // missing validation — no character type validation in store, digits and symbols accepted
  test.skip.each([
    ["cr7", "contains a digit"],
    ["Player!", "contains a symbol"],
    ["Player@name", "contains @ symbol"],
    ["Player#1", "contains # and digit"],
  ])(
    "throws an error if player name contains invalid characters: %s (%s)",
    (name) => {
      const { addPlayer } = useLeagueStore.getState();
      expect(() =>
        addPlayer({
          name,
          teamId: mockLeagueData.teams[0].id,
          goals: 0,
          image: "",
          fullImage: "",
        }),
      ).toThrow(PLAYER_ERRORS.NAME_INVALID);
    },
  );

  // missing validation — no minimum length check in store
  test.skip("throws an error if player name below 3 characters", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "cr", // 2 characters c: cristiano r: ronaldo -- should be at least 3 characters
        teamId: mockLeagueData.teams[0].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.NAME_INVALID);
  });

  // missing validation — no minimum letter count check, separators count toward length
  test.skip.each([
    ["c r", "space between two single letters"],
    ["c-r", "hyphen between two single letters"],
  ])(
    "name with 3 characters but not 3 valid letters is not allowed: %s (%s)",
    (name) => {
      const { addPlayer } = useLeagueStore.getState();
      expect(() =>
        addPlayer({
          name,
          teamId: mockLeagueData.teams[0].id,
          goals: 0,
          image: "",
          fullImage: "",
        }),
      ).toThrow(PLAYER_ERRORS.NAME_INVALID);
    },
  );

  // missing validation — no leading/trailing whitespace trimming in store
  test.skip("name with 3 characters space at the beginning and end is not allowed", () => {
    // the function should read this as a single character name
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: " c ", // c stands for cristiano
        teamId: mockLeagueData.teams[0].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.NAME_INVALID);
  });

  // BVA: minimum valid boundary — exactly 3 characters
  test.skip("player name with exactly 3 characters and no invalid characters is allowed, no spaces", () => {
    const { addPlayer } = useLeagueStore.getState();
    addPlayer({
      name: "abc", // 3 characters -- should be allowed
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    });
    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find((p) => p.name === "abc");
    expect(addedPlayer).toBeDefined();
  });

  // BVA: maximum valid boundary — exactly 40 characters
  test.skip("player name with exactly 40 characters is allowed", () => {
    const { addPlayer } = useLeagueStore.getState();
    addPlayer({
      name: "cristiano ronaldo do santo aveiro gullit", // 40 characters -- should be allowed
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    });
    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find(
      (p) => p.name === "cristiano ronaldo do santo aveiro gullit",
    );
    expect(addedPlayer).toBeDefined();
  });

  // BVA: above maximum boundary — 41 characters should be rejected
  // missing validation — no maximum length check in store
  test.skip("throws an error if player name exceeds 40 characters", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "cristiano ronaldo dos santo aveiro gullit", // 41 characters -- should be at most 40 characters
        teamId: mockLeagueData.teams[0].id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.NAME_INVALID);
  });
});

// =================================================================
//  unit tests for editPlayer function
// =================================================================

describe("editPlayer", () => {
  
  test.todo("updates player name correctly");   
    
  test.todo("updates player teamID correctly");

  test.todo("updates multiple fields at once correctly");

  test.todo("partial update does not overwrite unchanged fields");

  test.todo("throws an error if player id does not exist");

  test.todo("throws an error if updated name is empty");

  test.todo("throws an error if updated name is whitespace only")

  test.todo("throws an error if updated name contains invalid characters");

  test.todo("throws an error if updated name is below 3 characters");

  test.todo("throws an error if updated name exceeds 40 characters");

  test.todo("throws an error if updated name already exists in the same team");

  test.todo("throws an error if updated teamId does not exist");

  test.todo("does not allow editing goals directly — goals are managed by match operations only");

  test.todo("editing a player with no changes does not corrupt state");

  test.todo("editing a player does not affect other players");
});