import { Match } from "@/store/leagueStore";
import { LeagueDataShape } from "@/store/leagueStore";
export class LeagueData {
  private generateNextMatch(lastMatch: string, lastDate: string): Match {
    const lastId = parseInt(lastMatch.split("-")[1]);
    return {
      id: `match-${lastId + 1}`,
      homeTeamId: "team1",
      awayTeamId: "team2",
      homeTeamName: "Harbor United",
      awayTeamName: "Ocean Dragon",
      homeGoals: 0,
      awayGoals: 0,
      scorers: [],
      date: new Date(new Date(lastDate).getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    };
  }

  private interceptWith(data: any, alias: string) {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    cy.intercept("GET", "https://api.github.com/**", {
      body: { content: encoded, sha: "abc123" },
    }).as(alias);
  }

  setTargetMatches(numberOfMatchesToBePlayed: number) {
    cy.fixture("leagueData.json").then((data) => {
      data.targetMatches = numberOfMatchesToBePlayed;
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      this.interceptWith(
        { content: encoded, sha: "abc123" },
        `getLeagueData_targetMatches_${numberOfMatchesToBePlayed}`,
      );
    });
  }

  setMatchCount(numberOfPlayedMatches: number) {
    cy.fixture("leagueData.json").then((data) => {
      if (data.matches.length >= numberOfPlayedMatches) {
        data.matches = data.matches.slice(0, numberOfPlayedMatches);
      } else {
        let lastMatchId = data.matches[data.matches.length - 1].id;
        let lastDate = data.matches[data.matches.length - 1].date;
        while (data.matches.length < numberOfPlayedMatches) {
          const nextMatch = this.generateNextMatch(lastMatchId, lastDate);
          data.matches.push(nextMatch);
          lastMatchId = nextMatch.id;
          lastDate = nextMatch.date;
        }
      }
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      this.interceptWith(
        { content: encoded, sha: "abc123" },
        `getLeagueData_matchCount_${numberOfPlayedMatches}`,
      );
    });
  }

  getMatchCount(): Cypress.Chainable<number> {
    return cy.fixture("leagueData.json").then((data) => {
      return data.matches.length;
    });
  }

  getTargetMatches(): Cypress.Chainable<number> {
    return cy.fixture("leagueData.json").then((data) => {
      return data.targetMatches;
    });
  }

  setLeagueType(leagueType: "with-scorers" | "without-scorers") {
    cy.fixture("leagueData.json").then((data) => {
      data.leagueConfig.leagueType = leagueType;

      this.interceptWith(data, `getLeagueData_leagueType_${leagueType}`);
    });
  }
}
