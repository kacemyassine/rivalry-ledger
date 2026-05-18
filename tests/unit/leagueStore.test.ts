import { useLeagueStore } from "@/store/leagueStore";
import { mockLeagueData } from "../fixtures/mockLeagueData";
import { SQUAD_RULES } from "@/lib/rules";
import {
  MATCH_ERRORS,
  PLAYER_ERRORS,
  TEAM_ERRORS,
} from "@/lib/errors";
import { runMatchValidationTests } from "../fixtures/matchValidationSuite";
import { runNameValidationTests } from "../fixtures/playerValidationSuite";
import {
  getTeamById,
  getPlayerById,
  getPlayerByTeamId,
  getPlayersByTeamId,
  getPlayerByName,
  getMatchById,
} from "../fixtures/mockSelectors";

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
//  unit tests for editMatch function
// =================================================================

describe("editMatch", () => {
  let matchId: string;

  beforeEach(() => {
    const { addMatch } = useLeagueStore.getState();
    addMatch(2, 1, []);
    matchId = "match-1";
  });

  describe("when editing a match with valid data", () => {
    test("updates home goals correctly", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      editMatch(matchId, 3, match.awayGoals, match.scorers, match.date);

      expect(getMatchById(matchId).homeGoals).toBe(3);
      expect(getMatchById(matchId).awayGoals).toBe(1); // away goals should remain unchanged
    });

    test("updates away goals correctly", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      editMatch(matchId, match.homeGoals, 3, match.scorers, match.date);

      expect(getMatchById(matchId).awayGoals).toBe(3);
      expect(getMatchById(matchId).homeGoals).toBe(2); // home goals should remain unchanged
    });

    test("updates scorers correctly", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      const [player1, player2] = getPlayersByTeamId("team-1", 2);

      editMatch(
        matchId,
        2,
        0,
        [
          { playerId: player1.id, goals: 1 },
          { playerId: player2.id, goals: 1 },
        ],
        match.date,
      );

      expect(getMatchById(matchId).scorers).toHaveLength(2);
    });

    test("updates date correctly", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      const newDate = "2026-01-01";
      editMatch(
        matchId,
        match.homeGoals,
        match.awayGoals,
        match.scorers,
        newDate,
      );

      expect(getMatchById(matchId).date).toBe(newDate);
    });

    test("updates multiple fields at once correctly", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      editMatch(matchId, 3, 2, match.scorers, match.date);

      const updated = getMatchById(matchId);
      expect(updated.homeGoals).toBe(3);
      expect(updated.awayGoals).toBe(2);
    });

    test("recalculates points correctly after edit", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      // original was 2-1 home win — team-1 has 3 points, team-2 has 0
      // edit to a draw — both should have 1 point
      editMatch(matchId, 1, 1, match.scorers, match.date);

      expect(getTeamById("team-1").points).toBe(1);
      expect(getTeamById("team-2").points).toBe(1);
    });

    test("recalculates goals for and against correctly after edit", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      editMatch(matchId, 3, 2, match.scorers, match.date);

      const homeTeam = getTeamById("team-1");
      const awayTeam = getTeamById("team-2");

      expect(homeTeam.goalsFor).toBe(3);
      expect(homeTeam.goalsAgainst).toBe(2);
      expect(awayTeam.goalsFor).toBe(2);
      expect(awayTeam.goalsAgainst).toBe(3);
    });

    test("recalculates win, draw, loss correctly after edit", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      // original was 2-1 home win — edit to away win
      editMatch(matchId, 1, 2, match.scorers, match.date);

      const homeTeam = getTeamById("team-1");
      const awayTeam = getTeamById("team-2");

      expect(homeTeam.won).toBe(0);
      expect(homeTeam.lost).toBe(1);
      expect(awayTeam.won).toBe(1);
      expect(awayTeam.lost).toBe(0);
    });

    test("recalculates player goals correctly after edit", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      const player = getPlayerByTeamId("team-1");

      editMatch(matchId, 1, 0, [{ playerId: player.id, goals: 1 }], match.date);

      expect(getPlayerById(player.id).goals).toBe(1);
    });

    test("editing a match does not affect other matches", () => {
      const { addMatch, editMatch } = useLeagueStore.getState();
      addMatch(1, 0, []);
      const secondMatchId = "match-2";

      const match = getMatchById(matchId);
      editMatch(matchId, 3, 2, match.scorers, match.date);

      const secondMatch = getMatchById(secondMatchId);
      expect(secondMatch.homeGoals).toBe(1);
      expect(secondMatch.awayGoals).toBe(0);
    });
  });

  describe("when editing a match with invalid data", () => {
    test("throws an error if match id does not exist", () => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      expect(() =>
        editMatch("non-existent-id", 2, 1, match.scorers, match.date),
      ).toThrow(MATCH_ERRORS.NOT_FOUND);
    });

    runMatchValidationTests((homeGoals, awayGoals, scorers) => {
      const { editMatch } = useLeagueStore.getState();
      const match = getMatchById(matchId);
      editMatch(matchId, homeGoals, awayGoals, scorers, match.date);
    });
  });
});

// =================================================================
// Unit Tests for deleteMatch function
// =================================================================

describe("deleteMatch", () => {
  describe("deleteMatch", () => {
    let matchId: string;

    beforeEach(() => {
      const { addMatch } = useLeagueStore.getState();
      addMatch(2, 1, []);
      matchId = "match-1";
    });

    test("removes the match from the matches list", () => {
      const { deleteMatch } = useLeagueStore.getState();
      deleteMatch(matchId);

      const { matches } = useLeagueStore.getState();
      // not using getMatchById selector since the selector promises always a valid return
      expect(matches.find((m) => m.id === matchId)).toBeUndefined();
    });

    test("recalculates points correctly after deletion", () => {
      const { deleteMatch } = useLeagueStore.getState();
      deleteMatch(matchId);

      expect(getTeamById("team-1").points).toBe(0);
      expect(getTeamById("team-2").points).toBe(0);
    });

    test("recalculates goals for and against correctly after deletion", () => {
      const { deleteMatch } = useLeagueStore.getState();
      deleteMatch(matchId);

      const homeTeam = getTeamById("team-1");
      const awayTeam = getTeamById("team-2");

      expect(homeTeam.goalsFor).toBe(0);
      expect(homeTeam.goalsAgainst).toBe(0);
      expect(awayTeam.goalsFor).toBe(0);
      expect(awayTeam.goalsAgainst).toBe(0);
    });

    test("recalculates win, draw, loss correctly after deletion", () => {
      const { deleteMatch } = useLeagueStore.getState();
      deleteMatch(matchId);

      const homeTeam = getTeamById("team-1");
      const awayTeam = getTeamById("team-2");

      expect(homeTeam.won).toBe(0);
      expect(homeTeam.lost).toBe(0);
      expect(awayTeam.won).toBe(0);
      expect(awayTeam.lost).toBe(0);
    });

    test("recalculates player goals correctly after deletion", () => {
      const { addMatch, deleteMatch } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      addMatch(1, 0, [{ playerId: player.id, goals: 1 }]);
      const scoredMatchId = "match-2";

      deleteMatch(scoredMatchId);

      expect(getPlayerById(player.id).goals).toBe(0);
    });

    test("recalculates player goals correctly when match with multiple scorers is deleted", () => {
      const { addMatch, deleteMatch } = useLeagueStore.getState();
      const [player1, player2] = getPlayersByTeamId("team-1", 2);
      addMatch(2, 0, [
        { playerId: player1.id, goals: 1 },
        { playerId: player2.id, goals: 1 },
      ]);
      const scoredMatchId = "match-2";
      deleteMatch(scoredMatchId);

      expect(getPlayerById(player1.id).goals).toBe(0);
      expect(getPlayerById(player2.id).goals).toBe(0);
    });

    test("recalculates player goals correctly when a single player is listed multiple times as scorer and the match is deleted", () => {
      const { addMatch, deleteMatch } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");
      addMatch(3, 0, [
        { playerId: player.id, goals: 1 },
        { playerId: player.id, goals: 2 },
      ]);
      const scoredMatchId = "match-2";
      deleteMatch(scoredMatchId);

      expect(getPlayerById(player.id).goals).toBe(0);
    });

    test("deleting a match does not affect other matches", () => {
      const { addMatch, deleteMatch } = useLeagueStore.getState();
      addMatch(1, 0, []);
      const secondMatchId = "match-2";

      deleteMatch(matchId);

      const secondMatch = getMatchById(secondMatchId);
      expect(secondMatch.homeGoals).toBe(1);
      expect(secondMatch.awayGoals).toBe(0);
    });

    test("throws an error if match id does not exist", () => {
      const { deleteMatch } = useLeagueStore.getState();
      expect(() => deleteMatch("non-existent-id")).toThrow(
        MATCH_ERRORS.NOT_FOUND,
      );
    });
  });
});

// =================================================================
// Unit Tests for addPlayer function
// =================================================================

describe("addPlayer", () => {
  test("adds a new player with all required properties to the league with correct data", () => {
    const { addPlayer } = useLeagueStore.getState();
    const team = getTeamById("team-1");
    const player = {
      name: "Neymar Jr",
      teamId: team.id,
      goals: 0,
      image: "",
      fullImage: "",
    };
    addPlayer(player);

    const addedPlayer = getPlayerByName(player.name);
    expect(addedPlayer).toBeDefined();
    expect(addedPlayer).toMatchObject(player);
  });

  // FIND-05: no teamId validation — addPlayer accepts any teamId including non-existent ones
  test("throws an error if teamId does not exist", () => {
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
  test("throws an error if a player with the same name already exists in the same team", () => {
    const { addPlayer } = useLeagueStore.getState();
    const team = getTeamById("team-2");
    const existingPlayer = getPlayerByTeamId("team-2");

    expect(() =>
      addPlayer({
        name: existingPlayer.name,
        teamId: team.id,
        goals: 0,
        image: "",
        fullImage: "",
      }),
    ).toThrow(PLAYER_ERRORS.DUPLICATE);
  });

  runNameValidationTests((name) => {
    const { addPlayer } = useLeagueStore.getState();
    const team = getTeamById("team-1");
    addPlayer({ name, teamId: team.id, goals: 0, image: "", fullImage: "" });
  });
});

// =================================================================
//  unit tests for editPlayer function
// =================================================================

describe("editPlayer", () => {
  describe("when editing a player with valid data", () => {
    test("updates player name correctly", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      editPlayer(player.id, { name: "Neymar Jr" });

      expect(getPlayerById(player.id).name).toBe("Neymar Jr");
    });

    test("updates player teamId correctly", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      editPlayer(player.id, { teamId: "team-2" });

      expect(getPlayerById(player.id).teamId).toBe("team-2");
    });

    test("updates multiple fields at once correctly", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      editPlayer(player.id, { name: "Neymar Jr", teamId: "team-2" });

      const updated = getPlayerById(player.id);
      expect(updated.name).toBe("Neymar Jr");
      expect(updated.teamId).toBe("team-2");
    });

    test("partial update does not overwrite unchanged fields", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      editPlayer(player.id, { name: "Neymar Jr" });

      const updated = getPlayerById(player.id);
      expect(updated.teamId).toBe(player.teamId);
      expect(updated.goals).toBe(player.goals);
    });

    test("editing a player with no changes does not corrupt state", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      editPlayer(player.id, {});

      const updated = getPlayerById(player.id);
      expect(updated.name).toBe(player.name);
      expect(updated.teamId).toBe(player.teamId);
      expect(updated.goals).toBe(player.goals);
    });

    test("editing a player does not affect other players", () => {
      const { editPlayer } = useLeagueStore.getState();
      const [player1, player2] = getPlayersByTeamId("team-1", 2);

      editPlayer(player1.id, { name: "Neymar Jr" });

      expect(getPlayerById(player2.id).name).toBe(player2.name);
    });

    // missing validation — store allows editing goals directly
    test("does not allow editing goals directly — goals are managed by match operations only", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      expect(() => editPlayer(player.id, { goals: 99 })).toThrow(
        PLAYER_ERRORS.GOALS_READONLY,
      );
    });
  });

  describe("when editing a player with invalid data", () => {
    // FIND-05: no id validation
    test("throws an error if player id does not exist", () => {
      const { editPlayer } = useLeagueStore.getState();
      expect(() =>
        editPlayer("non-existent-id", { name: "Neymar Jr" }),
      ).toThrow(PLAYER_ERRORS.NOT_FOUND);
    });

    // FIND-05: no teamId validation
    test("throws an error if updated teamId does not exist", () => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");

      expect(() =>
        editPlayer(player.id, { teamId: "non-existent-team-id" }),
      ).toThrow(TEAM_ERRORS.NOT_FOUND);
    });

    // FIND-05: no duplicate validation
    test("throws an error if updated name already exists in the same team", () => {
      const { editPlayer } = useLeagueStore.getState();
      const [player1, player2] = getPlayersByTeamId("team-1", 2);

      expect(() => editPlayer(player1.id, { name: player2.name })).toThrow(
        PLAYER_ERRORS.DUPLICATE,
      );
    });

    runNameValidationTests((name) => {
      const { editPlayer } = useLeagueStore.getState();
      const player = getPlayerByTeamId("team-1");
      editPlayer(player.id, { name });
    });
  });
});

// =================================================================
// Unit Tests for deletePlayer function
// =================================================================


describe("deletePlayer", () => {
  beforeAll(() => {
    SQUAD_RULES.minSize = 4;
  });

  afterAll(() => {
    SQUAD_RULES.minSize = 23;
  });

  test("removes the player from the players list", () => {
    const { deletePlayer } = useLeagueStore.getState();
    const player = getPlayerByTeamId("team-1");

    deletePlayer(player.id);

    const { players } = useLeagueStore.getState();

    expect(players.find((p) => p.id === player.id)).toBeUndefined();
  });

  test("throws an error if player id does not exist", () => {
    const { deletePlayer } = useLeagueStore.getState();
    expect(() => deletePlayer("non-existent-id")).toThrow(
      PLAYER_ERRORS.NOT_FOUND,
    );
  });

  test("throws an error if player has scored goals", () => {
    const { addMatch, deletePlayer } = useLeagueStore.getState();
    const player = getPlayerByTeamId("team-1");

    addMatch(1, 0, [{ playerId: player.id, goals: 1 }]);

    expect(() => deletePlayer(player.id)).toThrow(PLAYER_ERRORS.HAS_GOALS);
  });

  test("throws an error if deleting the player would leave the team with minimum or fewer players", () => {
    const { deletePlayer } = useLeagueStore.getState();
    const [player1, player2] = getPlayersByTeamId("team-1", 2);

    deletePlayer(player1.id);

    expect(() => deletePlayer(player2.id)).toThrow(
      PLAYER_ERRORS.MIN_SQUAD_SIZE,
    );
  });

  test("deleting a player does not affect other players", () => {
    const { deletePlayer } = useLeagueStore.getState();
    const [player1, player2] = getPlayersByTeamId("team-1", 2);

    deletePlayer(player1.id);

    const { players } = useLeagueStore.getState();
    expect(players.find((p) => p.id === player2.id)).toBeDefined();
    expect(getPlayerById(player2.id).name).toBe(player2.name);
  });

  test("handles deleting multiple players sequentially", () => {
    const { addPlayer, deletePlayer } = useLeagueStore.getState();
    const team = getTeamById("team-1");

    addPlayer({
      name: "aaa",
      teamId: team.id,
      goals: 0,
      image: "",
      fullImage: "",
    });
    addPlayer({
      name: "bbb",
      teamId: team.id,
      goals: 0,
      image: "",
      fullImage: "",
    });

    const player1 = getPlayerByName("aaa");
    const player2 = getPlayerByName("bbb");

    deletePlayer(player1.id);
    deletePlayer(player2.id);

    const { players } = useLeagueStore.getState();
    expect(players.find((p) => p.id === player1.id)).toBeUndefined();
    expect(players.find((p) => p.id === player2.id)).toBeUndefined();
  });
});

// =================================================================
// Unit Tests for updateTeamLogo function
// =================================================================

describe("updateTeamLogo", () => {
  test("updates the logo for the correct team", () => {
    const { updateTeamLogo } = useLeagueStore.getState();
    const newLogo = "https://cdn.rivalryledger.com/logo1.png";
    
    updateTeamLogo("team-1", newLogo);

    expect(getTeamById("team-1").logo).toBe(newLogo);
  });

  test("throws an error if teamId does not exist", () => {
    const { updateTeamLogo } = useLeagueStore.getState();
    
    expect(() => 
      updateTeamLogo("fake-id", "logo.png")
    ).toThrow(TEAM_ERRORS.NOT_FOUND);
  });

  test("allows clearing the logo with an empty string", () => {
    const { updateTeamLogo } = useLeagueStore.getState();
    
    updateTeamLogo("team-1", "");

    expect(getTeamById("team-1").logo).toBe("");
  });
});
