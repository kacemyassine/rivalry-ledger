import {
  reverseMatches,
  getDisplayedMatches,
  getMatchListTitle,
  getScorersForTeam,
  hasMoreThanDefaultMatches,
} from "../../src/lib/matchHistoryUtils";
import {
  getMockLeagueData,
  getMockMatchById,
  getMockPlayerById,
} from "../fixtures/mockSelectors";
import { Match } from "@/store/leagueStore";

const data = getMockLeagueData({ withMatches: true });
const dataWithScorers = getMockLeagueData({
  withMatches: true,
  withScorers: true,
});

describe("matchHistoryUtils", () => {
  describe("reverseMatches()", () => {
    test("should reverse the order of matches", () => {
      const matches = data.matches;
      const reversed = reverseMatches(matches);
      expect(reversed[0].id).toBe(matches[matches.length - 1].id);
      expect(reversed[reversed.length - 1].id).toBe(matches[0].id);
    });
    test("does not mutate the original array", () => {
      const matches = data.matches;
      reverseMatches(matches);
      expect(matches[0].id).toBe("match-1");
    });
  });

  describe("getMatchListTitle()", () => {
    it('returns "All Matches" when showAll is true', () => {
      expect(getMatchListTitle(true)).toBe("All Matches");
    });

    it('returns "Recent Matches" when showAll is false', () => {
      expect(getMatchListTitle(false)).toBe("Recent Matches");
    });
  });

  describe("getScorersForTeam()", () => {
    test("returns scorers for the specified team correctly", () => {
      const match = getMockMatchById(dataWithScorers, "match-1");
      const result = getScorersForTeam(
        match,
        dataWithScorers.players,
        "team-1",
      );
      expect(
        result.every(
          (s) =>
            getMockPlayerById(dataWithScorers, s.playerId).teamId === "team-1",
        ),
      ).toBe(true);
    });

    test("includes own goals from opposing team", () => {
      const match: Match = {
        id: "match-og",
        homeTeamId: "team-1",
        awayTeamId: "team-2",
        homeTeamName: "Harbor United",
        awayTeamName: "Ocean Dragon",
        homeGoals: 1,
        awayGoals: 0,
        scorers: [{ playerId: "player-6", goals: 1, isOwnGoal: true }],
        date: "2026-01-01",
      };
      const result = getScorersForTeam(
        match,
        dataWithScorers.players,
        "team-1",
      );
      expect(result).toHaveLength(1);
      expect(result[0].playerId).toBe("player-6");
    });

    test("returns empty array when no scorers", () => {
      const match = getMockMatchById(data, "match-1");
      const result = getScorersForTeam(match, data.players, "team-1");
      expect(result).toHaveLength(0);
    });

    test("does not include opposing team regular goals", () => {
      const match = getMockMatchById(dataWithScorers, "match-1");
      const result = getScorersForTeam(
        match,
        dataWithScorers.players,
        "team-1",
      );
      expect(
        result.every(
          (s) =>
            getMockPlayerById(dataWithScorers, s.playerId).teamId !== "team-2",
        ),
      ).toBe(true);
    });

    test("works correctly for away team as well", () => {
      const match = getMockMatchById(dataWithScorers, "match-1");
      const result = getScorersForTeam(
        match,
        dataWithScorers.players,
        "team-2",
      );
      expect(
        result.every(
          (s) =>
            getMockPlayerById(dataWithScorers, s.playerId).teamId === "team-2",
        ),
      ).toBe(true);
    });
  });
  describe("getDisplayedMatches()", () => {
  test("returns all 9 matches when total is below threshold and showAll is false", () => {
    const matches = data.matches.slice(0, 9);
    const result = getDisplayedMatches(matches, false);
    expect(result).toHaveLength(9);
  });

  test("returns all 10 matches when total equals threshold and showAll is false", () => {
    const matches = data.matches.slice(0, 10);
    const result = getDisplayedMatches(matches, false);
    expect(result).toHaveLength(10);
  });

  test("returns only 10 matches when total exceeds threshold and showAll is false", () => {
    const result = getDisplayedMatches(data.matches, false); // 11 matches
    expect(result).toHaveLength(10);
  });

  test("returns all 11 matches when showAll is true", () => {
    const result = getDisplayedMatches(data.matches, true);
    expect(result).toHaveLength(11);
  });

  test("returns matches in reversed order", () => {
    const result = getDisplayedMatches(data.matches, true);
    expect(result[0].id).toBe(data.matches[data.matches.length - 1].id);
  });
});

  describe("hasMoreThanDefaultMatches()", () => {
  test("returns false when matches are below threshold", () => {
    expect(hasMoreThanDefaultMatches(data.matches.slice(0, 9))).toBe(false);
  });

  test("returns false when matches equal threshold", () => {
    expect(hasMoreThanDefaultMatches(data.matches.slice(0, 10))).toBe(false);
  });

  test("returns true when matches exceed threshold", () => {
    expect(hasMoreThanDefaultMatches(data.matches)).toBe(true); // 11 matches
  });
});
});
