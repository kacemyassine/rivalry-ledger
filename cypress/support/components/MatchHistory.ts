export class MatchHistory {
  private getMatchCard(matchId: string) {
    return cy.get(`[data-testid="${matchId}"]`);
  }
  private openMatchCard(matchId: string) {
    this.getMatchCard(matchId).click();
  }
  assertMatchExists(matchId: string) {
    this.getMatchCard(matchId).should("be.visible");
  }
  assertScore(matchId: string, homeGoals: number, awayGoals: number) {
    this.getMatchCard(matchId).within(() => {
      cy.get('[data-testid="home-goals"]').contains(homeGoals);
      cy.get('[data-testid="away-goals"]').contains(awayGoals);
    });
  }

  assertNoScorers(matchId: string) {
    this.openMatchCard(matchId);
    cy.get(`[data-testid="${matchId}-popup"]`).within(() => {
      cy.get('[data-testid="home-scorers"]')
        .children()
        .should("have.length", 0);
      cy.get('[data-testid="away-scorers"]')
        .children()
        .should("have.length", 0);
    });
  }

  assertScorers(
  matchId: string,
  scorers: { team: "home" | "away"; playerName: string; goals: number; isOwnGoal: boolean }[],
) {
  const displayTeam = (s: { team: "home" | "away"; isOwnGoal: boolean }) =>
    s.isOwnGoal ? (s.team === "home" ? "away" : "home") : s.team;

  const sumByTeamAndPlayer = (list: typeof scorers) => {
    const map = new Map<string, { name: string; goals: number; isOwnGoal: boolean }>();
    list.forEach((s) => {
      const name = s.playerName.replace("-", " ");
      const key = `${name}-${s.isOwnGoal ? "og" : "goal"}`;
      const existing = map.get(key);
      map.set(key, {
        name,
        goals: (existing?.goals ?? 0) + s.goals,
        isOwnGoal: s.isOwnGoal,
      });
    });
    return map;
  };

  const homeTotals = sumByTeamAndPlayer(
    scorers.filter((s) => displayTeam(s) === "home"),
  );
  const awayTotals = sumByTeamAndPlayer(
    scorers.filter((s) => displayTeam(s) === "away"),
  );

  this.openMatchCard(matchId);
  cy.get(`[data-testid="${matchId}-popup"]`).within(() => {
    cy.get('[data-testid="home-scorers"]').within(() => {
      homeTotals.forEach(({ name, goals, isOwnGoal }) => {
        cy.contains(name)
          .parent()
          .should("contain.text", String(goals))
          .and(isOwnGoal ? "contain.text" : "not.contain.text", "OG");
      });
    });
    cy.get('[data-testid="away-scorers"]').within(() => {
      awayTotals.forEach(({ name, goals, isOwnGoal }) => {
        cy.contains(name)
          .parent()
          .should("contain.text", String(goals))
          .and(isOwnGoal ? "contain.text" : "not.contain.text", "OG");
      });
    });
  });
}
}
