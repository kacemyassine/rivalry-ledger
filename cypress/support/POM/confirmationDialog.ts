import { API_SUCCESS } from "@/lib/errors";
export class ConfirmationDialog {
  private get confirmationDialog() {
    return cy.get('[data-testid="confirm-dialog"]');
  }

  clickTheButton(buttonName: 'Back' | 'Archive & Start New') {
    this.confirmationDialog.within(() => {
      cy.contains("button", buttonName).should("be.enabled").click();
    });
  }
  assertSpinnerIsVisible() {
  this.confirmationDialog.within(() => {
    cy.get('[data-testid="archiving-spinner"]').should('be.visible');
    cy.contains("Archiving league and preparing new season...").should('be.visible');
  });
}

assertArchivingSuccess() {
  this.confirmationDialog.within(() => {
    cy.get('[data-testid="archiving-spinner"]', { timeout: 6000 }).should('not.exist');
  });
  cy.get('[data-sonner-toast]')
    .should('be.visible')
    .and('contain.text', API_SUCCESS.ARCHIVE_SUCCESS);
}

  
}
