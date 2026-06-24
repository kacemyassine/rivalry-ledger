export class MatchHistory {
  private getMatchCard(matchId: string) {
  return cy.get(`[data-testid="${matchId}"]`);
}
  assertMatchExists(matchId: string) {
    this.getMatchCard(matchId).should('be.visible');
  }
  assertScore(matchId: string, homeGoals: number, awayGoals: number) {
    this.getMatchCard(matchId).within(() => {
      cy.get('[data-testid="home-goals"]').contains(homeGoals);
      cy.get('[data-testid="away-goals"]').contains(awayGoals);
    })
  }
}