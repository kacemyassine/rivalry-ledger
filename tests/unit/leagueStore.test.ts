import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueData } from "../fixtures/mockLeagueData";
import {
  PLAYER_ERRORS,
  TEAM_ERRORS,
} from "../fixtures/errorMessages";
import { runMatchValidationTests } from "../fixtures/matchValidationSuite";
import {
  getTeamById,
  getPlayerById,
  getPlayerByTeamId,
  getPlayersByTeamId,
} from "../fixtures/mockSelectors";

import { PLAYER_NAME_RULES } from "../fixtures/playerNameRules";

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

        expect(getTeamById("team-1").points).toBe(3);
        expect(getTeamById("team-2").points).toBe(0);
      });

      test("away win -> away team gains 3 points, home team gains 0 points", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(1, 2, []);

        expect(getTeamById("team-1").points).toBe(0);
        expect(getTeamById("team-2").points).toBe(3);
      });

      test("draw -> both teams gain 1 point", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(0, 0, []);

        expect(getTeamById("team-1").points).toBe(1);
        expect(getTeamById("team-2").points).toBe(1);
      });

      test("multiple matches -> points are accumulated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 1, []);
        addMatch(1, 2, []);

        expect(getTeamById("team-1").points).toBe(3);
        expect(getTeamById("team-2").points).toBe(3);
      });
    });

    describe("goals calculation", () => {
      test("home goals and away goals are updated correctly when home team wins", () => {
        const { addMatch } = useLeagueStore.getState();

        addMatch(3, 2, []);

        const homeTeam = getTeamById("team-1");
        const awayTeam = getTeamById("team-2");

        expect(homeTeam.goalsFor).toBe(3);
        expect(homeTeam.goalsAgainst).toBe(2);
        expect(awayTeam.goalsFor).toBe(2);
        expect(awayTeam.goalsAgainst).toBe(3);
      });

      test("home goals and away goals are updated correctly when away team wins", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 3, []);

        const homeTeam = getTeamById("team-1");
        const awayTeam = getTeamById("team-2");

        expect(homeTeam.goalsFor).toBe(2);
        expect(homeTeam.goalsAgainst).toBe(3);
        expect(awayTeam.goalsFor).toBe(3);
        expect(awayTeam.goalsAgainst).toBe(2);
      });

      test("home goals and away goals are updated correctly when it is a draw", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 2, []);

        const homeTeam = getTeamById("team-1");
        const awayTeam = getTeamById("team-2");

        expect(homeTeam.goalsFor).toBe(2);
        expect(homeTeam.goalsAgainst).toBe(2);
        expect(awayTeam.goalsFor).toBe(2);
        expect(awayTeam.goalsAgainst).toBe(2);
      });
    });

    describe("matches played calculation", () => {
      test("matches played is updated correctly for both teams", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(1, 0, []);

        expect(getTeamById("team-1").played).toBe(1);
        expect(getTeamById("team-2").played).toBe(1);
      });

      test("matches played is accumulated correctly over multiple matches", () => {
        const { addMatch } = useLeagueStore.getState();
        addMatch(2, 2, []);
        addMatch(1, 1, []);

        expect(getTeamById("team-1").played).toBe(2);
        expect(getTeamById("team-2").played).toBe(2);
      });
    });

    describe("scorers and players goals", () => {
      test("players goals are updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        const [player1, player2] = getPlayersByTeamId("team-1", 2);
        const [player3] = getPlayersByTeamId("team-2", 1);

        addMatch(2, 1, [
          { playerId: player1.id, goals: 1 },
          { playerId: player2.id, goals: 1 },
          { playerId: player3.id, goals: 1 },
        ]);

        expect(getPlayerById(player1.id).goals).toBe(1);
        expect(getPlayerById(player2.id).goals).toBe(1);
        expect(getPlayerById(player3.id).goals).toBe(1);
      });

      test("player scoring more than once in a match has their goals updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        const [player1, player2] = getPlayersByTeamId("team-1", 2);
        const player3 = getPlayerByTeamId("team-2");
        addMatch(3, 1, [
          { playerId: player1.id, goals: 2 },
          { playerId: player2.id, goals: 1 },
          { playerId: player3.id, goals: 1 },
        ]);

        expect(getPlayerById(player1.id).goals).toBe(2);
        expect(getPlayerById(player2.id).goals).toBe(1);
        expect(getPlayerById(player3.id).goals).toBe(1);
      });

      test("own goals are handled correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        const [player1, player2, player3] = getPlayersByTeamId("team-1", 3);
        
        addMatch(2, 1, [
          { playerId: player1.id, goals: 1 },
          { playerId: player2.id, goals: 1, isOwnGoal: true },
          { playerId: player3.id, goals: 1 },
        ]);

        expect(getPlayerById(player1.id).goals).toBe(1);
        expect(getPlayerById(player2.id).goals).toBe(0); // own goal should not count towards player's goals tally
        expect(getPlayerById(player3.id).goals).toBe(1);
      });

      test("a player scoring an own goal and a regular goal in the same match has their goals updated correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        const [player1, player2] = getPlayersByTeamId("team-1", 2);
        addMatch(2, 1, [
          { playerId: player1.id, goals: 1 },
          { playerId: player1.id, goals: 1, isOwnGoal: true },
          { playerId: player2.id, goals: 1 },
        ]);

        expect(getPlayerById(player1.id).goals).toBe(1);
        expect(getPlayerById(player2.id).goals).toBe(1);
      });

      // FIND-15: duplicate player entries not summed — store only counts last entry via Array.find()
      test("player listed twice in scorers has their goals summed correctly", () => {
        const { addMatch } = useLeagueStore.getState();
        const player1 = getPlayerByTeamId("team-1");
        addMatch(3, 0, [
          { playerId: player1.id, goals: 1 },
          { playerId: player1.id, goals: 2 },
        ]);

        expect(getPlayerById(player1.id).goals).toBe(3);
      });
    });
  });
});

  describe("when adding a match with invalid data", () => {
  runMatchValidationTests((homeGoals, awayGoals, scorers) => {
    const { addMatch } = useLeagueStore.getState();
    addMatch(homeGoals, awayGoals, scorers);
  });
});


// =================================================================
// Unit Tests for addPlayer function
// =================================================================

describe("addPlayer", () => {
  test("adds a new player with all required properties to the league with correct data", () => {
    const { addPlayer } = useLeagueStore.getState();
    const player = {
      name: "Neymar Jr",
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    };
    addPlayer(player);

    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find((p) => p.name === "Neymar Jr");
    expect(addedPlayer).toBeDefined();
    expect(addedPlayer).toMatchObject(player);
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
      name: "a".repeat(PLAYER_NAME_RULES.minLength), // 3 characters -- should be allowed
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    });
    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find(
      (p) => p.name === "a".repeat(PLAYER_NAME_RULES.minLength),
    );
    expect(addedPlayer).toBeDefined();
  });

  // BVA: maximum valid boundary — exactly 40 characters
  test.skip("player name with exactly 40 characters is allowed", () => {
    const { addPlayer } = useLeagueStore.getState();
    addPlayer({
      name: "a".repeat(PLAYER_NAME_RULES.maxLength), // 40 characters -- should be allowed
      teamId: mockLeagueData.teams[0].id,
      goals: 0,
      image: "",
      fullImage: "",
    });
    const { players } = useLeagueStore.getState();
    const addedPlayer = players.find(
      (p) => p.name === "a".repeat(PLAYER_NAME_RULES.maxLength),
    );
    expect(addedPlayer).toBeDefined();
  });

  // BVA: above maximum boundary — 41 characters should be rejected
  // missing validation — no maximum length check in store
  test.skip("throws an error if player name exceeds 40 characters", () => {
    const { addPlayer } = useLeagueStore.getState();
    expect(() =>
      addPlayer({
        name: "a".repeat(PLAYER_NAME_RULES.maxLength + 1), // 41 characters -- should be at most 40 characters
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

  test.todo("throws an error if updated name is whitespace only");

  test.todo("throws an error if updated name contains invalid characters");

  test.todo("throws an error if updated name is below 3 characters");

  test.todo("throws an error if updated name exceeds 40 characters");

  test.todo("throws an error if updated name already exists in the same team");

  test.todo("throws an error if updated teamId does not exist");

  test.todo(
    "does not allow editing goals directly — goals are managed by match operations only",
  );

  test.todo("editing a player with no changes does not corrupt state");

  test.todo("editing a player does not affect other players");
});

// =================================================================
//  unit tests for editMatch function
// =================================================================

describe("editMatch", () => {
  test.todo("updates home goals correctly");
  test.todo("updates away goals correctly");
  test.todo("updates scorers correctly");
  test.todo("updates date correctly");
  test.todo("updates multiple fields at once correctly");

  test.todo("recalculates points correctly after edit");
  test.todo("recalculates goals for and against correctly after edit");
  test.todo("recalculates win, draw, loss correctly after edit");
  test.todo("recalculates player goals correctly after edit");

  test.todo("throws an error if match id does not exist");
  test.todo("throws an error if home goals is negative");
  test.todo("throws an error if away goals is negative");
  test.todo("throws an error if goals are unrealistically high");
  test.todo("throws an error if scorer goals sum is less than total goals");
  test.todo("throws an error if scorer goals sum exceeds total goals");
  test.todo(
    "throws an error if scorers data contains a playerId that does not exist",
  );
  test.todo(
    "throws an error if scorers data contains a playerId that belongs to the opposing team",
  );
  test.todo("editing a match does not affect other matches");
});
