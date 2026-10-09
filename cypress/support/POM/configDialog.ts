export class ConfigDialog {
  private get configDialog() {
    return cy.get('[data-testid="config-dialog"]');
  }
  checkNameField(state: "empty" | "contains", text?: string) {
  this.configDialog.within(() => {
    const assertion = cy.get('input[data-testid="new-league-name-input"]');
    if (state === "empty") {
      assertion.should("have.value", "");
    } else {
      assertion.should("have.value", text);
    }
  });
}

  enterNewLeagueName(LeagueName: string) {
    this.configDialog.within(() => {
      cy.get('[data-testid="new-league-name-input"]').clear().type(LeagueName);
    });
  }
  
  
  clearNewLeagueName() {
    this.configDialog.within(() => {
      cy.get('[data-testid="new-league-name-input"]').clear();
    });
  }

  setLeagueType(leagueType: "With Scorers" | "Without Scorers") {
    this.configDialog.within(() => {
      cy.contains("button", leagueType).click();
    });
  }

  assertLeagueTypeActive(leagueType: "With Scorers" | "Without Scorers") {
    this.configDialog.within(() => {
      cy.contains("button", leagueType).should(
        "have.attr",
        "data-state",
        "active",
      );
    });
  }

  assertNoImageHasBeenSelected() {
    this.configDialog.within(() => {
      cy.get('[data-testid="archive-image-preview"]').should("not.exist");
      cy.get('[data-testid="remove-archive-image-btn"]').should("not.exist");
      cy.contains("Select Image").should("be.visible");
    });
  }

  clickNextButton() {
    this.configDialog.within(() => {
      cy.get("button").contains("Next").should("not.be.disabled").click();
    });
  }

  setTargetMatches(targetMatches: number ) {
    this.configDialog.within(() => {
      cy.get('input[data-testid="target-matches-input"]')
      .should('not.be.disabled')
      .type('{selectall}')
      .type(targetMatches.toString());
    })
  }

  assertNextButtonIsDisabled() {
    this.configDialog.within(() => {
      cy.get("button").contains("Next").should("be.disabled");
    });
  }
}
