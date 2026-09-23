export class AdminPage {
  clickRecordMatch() {
    // button disabled if targetMatches is reached .
    cy.get('[data-testid="record-match-btn"]').should('not.be.disabled').click();
    // making sure the dialog opens correctly.
    cy.get('[role="dialog"]').should('be.visible');
  }

  clickAddPlayer() {
  cy.get('[data-testid="add-player-btn"]').click();
  cy.get('[role="dialog"]').should("be.visible");
}

  clickSaveToGitHub() {
    // disabled by default if no action done by admin.
    cy.get('[data-testid="save-btn"]').should('not.be.disabled').click();
  }

  clickStartNewLeague() {
    cy.get('[data-testid="start-new-league-btn"]').click();
  }

  assertUsavedChangesIs(state: 'be.visible' | 'not.be.visible') {
    cy.get('[data-testid="desctop-unsavedChanges-component"]').should(state);
  }

  getDialog(dialogType: 'Unsaved Changes Warning' | 'Config' | 'Confirmation' | 'League Incomplete') {
    const partialMessages = {
      'Unsaved Changes Warning': /Unsaved Changes/i,
      'Config': /START NEW LEAGUE/i,
      'Confirmation': /Please review/i,
      'League Incomplete': /league not complete/i
    }
    cy.get('[role="dialog"]').contains(partialMessages[dialogType]).should('be.visible');
  }
}