export class AdminPage {
  clickRecordMatch() {
    cy.get('[data-testid="record-match-btn"]').click();
  }

  clickAddPlayer() {
    cy.get('[data-testid="add-player-btn"]').click();
  }

  clickSaveToGitHub() {
    cy.get('[data-testid="save-btn"]').click();
  }

  clickStartNewLeague() {
    cy.get('[data-testid="start-new-league-btn"]').click();
  }
}