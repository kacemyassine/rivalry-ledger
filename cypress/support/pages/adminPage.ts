import { API_SUCCESS } from "@/lib/errors";
export class AdminPage {
  private partialMessages = {
    "Unsaved Changes Warning": "unsaved-changes-dialog",
    Config: "config-dialog",
    Confirmation: "confirm-dialog",
    "League Incomplete": "league-incomplete-dialog",
  };
  private OpenedDialogIs(): Cypress.Chainable<string> {
    return cy.get("body").then(($body) => {
      const found = $body.find("[starting-new-league-dialog='true']").first();
      if (found.length) {
        console.log("found dialog: " + found.attr("data-testid"));
        return found.attr("data-testid")!;
      }
      console.log("no dialog found");
      return "no dialog found";
    });
  }

  clickRecordMatch() {
    // button disabled if targetMatches is reached .
    cy.get('[data-testid="record-match-btn"]')
      .should("not.be.disabled")
      .click();
    // making sure the dialog opens correctly.
    cy.get('[role="dialog"]').should("be.visible");
  }

  clickAddPlayer() {
    cy.get('[data-testid="add-player-btn"]').click();
    cy.get('[role="dialog"]').should("be.visible");
  }

  clickSaveToGitHub() {
    // disabled by default if no action done by admin.
    cy.get('[data-testid="save-btn"]').should("not.be.disabled").click();
  }

  clickStartNewLeague() {
    cy.get('[data-testid="start-new-league-btn"]').click();
  }

  assertUsavedChangesIs(
    state: "be.visible" | "not.be.visible" | "not.exist" | "exist",
  ) {
    cy.get('[data-testid="desctop-unsavedChanges-component"]').should(state);
  }

  getDialog(
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) {
    return cy
      .get(`[data-testid="${this.partialMessages[dialogType]}"]`)
      .should("be.visible");
  }

  openDialog(
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) {
    this.OpenedDialogIs().then((foundDialog) => {
      if (foundDialog === this.partialMessages[dialogType]) {
        return;
      }

      const state_list = [
        "no dialog found",
        this.partialMessages["Unsaved Changes Warning"],
        this.partialMessages["League Incomplete"],
        this.partialMessages["Config"],
        this.partialMessages["Confirmation"],
      ];

      const dialogTypeIndex: number = state_list.indexOf(this.partialMessages[dialogType]);
      const foundDialogIndex: number = state_list.indexOf(foundDialog);

      if (foundDialogIndex > dialogTypeIndex && foundDialog !== this.partialMessages["Confirmation"]) {
        throw new Error(`Wrong scenario detected : transition from ${foundDialog} to ${dialogType} is impossible .`)
      }

      
      if (foundDialog === "no dialog found") {
        this.clickStartNewLeague();
        this.openDialog(dialogType);
        return;
      }
      if (foundDialog === this.partialMessages["Unsaved Changes Warning"]) {
        cy.get('[data-testid="unsaved-changes-dialog"]').within(() => {
          cy.contains("button", "Save & Continue").click();
        });

        cy.get("[data-sonner-toast]")
          .should("be.visible")
          .and("contain.text", API_SUCCESS.SAVE_SUCCESS);

        cy.get('[data-testid="unsaved-changes-dialog"]').should("not.exist");
        this.openDialog(dialogType);
      }
      if (foundDialog === this.partialMessages["League Incomplete"]) {
        cy.get('[data-testid="league-incomplete-dialog"]').within(() => {
          cy.get("button").contains("Proceed").click();
        });
        cy.get('[data-testid="league-incomplete-dialog"]').should("not.exist");
        this.openDialog(dialogType);
      }
      if (foundDialog === this.partialMessages["Config"]) {
        cy.get('[data-testid="config-dialog"]').within(() => {
          cy.get('[data-testid="new-league-name-input"]')
            .clear()
            .type("Test New League");
          cy.get("button").contains("Next").click();
        });
        cy.get('[data-testid="config-dialog"]').should("not.exist");
        this.openDialog(dialogType);
      }
    });
  }
}
