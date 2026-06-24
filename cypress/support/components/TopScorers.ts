export class TopScorers {
  private getPlayerRow(playerId: string) {
    return cy.get(`[data-testid="player-row-${playerId}"]`);
  }

  getPlayerGoals(playerId: string) {
    return this.getPlayerRow(playerId)
      .find('[data-testid="player-goals"]')
      .invoke("text")
      .then((text: string) => Number(text.trim()));
  }

  assertPlayerGoals(playerId: string, expectedGoals: number) {
    this.getPlayerGoals(playerId).then((goals: number) => {
      expect(goals).to.eq(expectedGoals);
    });
  }
}
