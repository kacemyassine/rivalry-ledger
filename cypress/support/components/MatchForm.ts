export class MatchForm {
  enterHomeScore(goals: number) {
    cy.get('[data-testid="home-score-input"]').type('{selectall}').type(String(goals));
  }
  enterAwayScore(goals: number) {
    cy.get('[data-testid="away-score-input"]').type('{selectall}').type(String(goals));
  }
  addScorer(playerId: string, playerName: string, goals: number, isOwnGoal?: boolean) {
  cy.get('[data-testid="add-scorer-btn"]').click();

  cy.get('[data-testid^="scorer-row-"]').last().as('newScorerRow');

  cy.get('@newScorerRow').within(() => {
    cy.get('[role="combobox"]').click();
  });

  cy.get('[role="option"]').contains(playerName).click();

  cy.get('[data-testid^="scorer-row-"]').last().as('newScorerRow').within(() => {
    cy.get('input[type="number"]').type('{selectall}').type(String(goals));
    cy.get('input[type="number"]').should('have.value', String(goals));

    if (isOwnGoal) {
      cy.get('input[type="checkbox"]').should('not.be.checked').click();
    }
  });
}
  submit() {
    cy.get('button[type="submit"]').click();
  }
}
