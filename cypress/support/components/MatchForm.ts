export class MatchForm {
  enterHomeScore(goals: number) {
    cy.get('[data-testid="home-score-input"]').clear().type(String(goals));
  }
  enterAwayScore(goals: number) {
    cy.get('[data-testid="away-score-input"]').clear().type(String(goals));
  }
  addScorer(playerId: string, goals: number, isOwnGoal?: boolean) {
    cy.get('[data-testid="add-scorer-btn"]').click();
    cy.get(`[data-testid="scorer-row-${playerId}"]`).within(() => {
      cy.get('[role="combobox"]').click();
    });
    cy.get('[role="option"]').contains(playerId).click();
    cy.get(`[data-testid="scorer-row-${playerId}"]`).within(() => {
      cy.get('input[type="number"]').clear().type(String(goals));
      if (isOwnGoal) {
        cy.get('input[type="checkbox"]').should("not.be.checked").click();
      }
    });
  }
  submit() {
    cy.get('button[type="submit"]').click();
  }
}
