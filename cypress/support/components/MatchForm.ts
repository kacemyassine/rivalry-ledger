import { MATCH_ERRORS } from "@/lib/errors";
export class MatchForm {
  enterHomeScore(goals: number) {
    cy.get('[data-testid="home-score-input"]')
      .type("{selectall}")
      .type(String(goals));
  }
  enterAwayScore(goals: number) {
    cy.get('[data-testid="away-score-input"]')
      .type("{selectall}")
      .type(String(goals));
  }
  addScorer(
    playerId: string,
    playerName: string,
    goals: number,
    isOwnGoal?: boolean,
  ) {
    cy.get('[data-testid="add-scorer-btn"]').click();

    cy.get('[data-testid^="scorer-row-"]').last().as("newScorerRow");

    cy.get("@newScorerRow").within(() => {
      cy.get('[role="combobox"]').click();
    });

    cy.get('[role="option"]').contains(playerName).click();

    cy.get('[data-testid^="scorer-row-"]')
      .last()
      .as("newScorerRow")
      .within(() => {
        cy.get('input[type="number"]').type("{selectall}").type(String(goals));
        cy.get('input[type="number"]').should("have.value", String(goals));

        if (isOwnGoal) {
          cy.get('input[type="checkbox"]').should("not.be.checked").click();
        }
      });
  }

  updateScorer(playerId: string, goals: number, isOwnGoal?: boolean) {
    cy.get(`[data-testid^="scorer-row-${playerId}-"]`).then(($rows) => {
      const count = $rows.length;

      // remove all but one duplicate row for this player
      for (let i = count - 1; i > 0; i--) {
        cy.get(`[data-testid^="scorer-row-${playerId}-"]`)
          .eq(i)
          .find("button.text-destructive")
          .click();
      }

      // set the final remaining row to the new total
      cy.get(`[data-testid^="scorer-row-${playerId}-"]`).within(() => {
        cy.get('input[type="number"]').type("{selectall}").type(String(goals));
        cy.get('input[type="number"]').should("have.value", String(goals));

        if (isOwnGoal !== undefined) {
          cy.get('input[type="checkbox"]')
            .should(isOwnGoal ? "not.be.checked" : "be.checked")
            .click();
        }
      });
    });
  }
  submit(action: "record" | "update") {
    const label = action === "update" ? /Update Match/i : /Record Match/i;
    cy.get('button[type="submit"]')
      .should(($btn) => {
        expect($btn.text()).to.match(label);
      })
      .click();
  }
  closeTheForm() {
    cy.get('[data-testid="close-dialog-btn"]').click();
    cy.get('[role="dialog"]').should("not.exist");
  }
  changeDateTo(newDate: string) {
    cy.get('input[type="date"]').clear().type(newDate);
  }

  assertDateErrorMessage() {
    cy.contains(MATCH_ERRORS.BAD_DATE).should("be.visible");
    this.closeTheForm();
  }
}
