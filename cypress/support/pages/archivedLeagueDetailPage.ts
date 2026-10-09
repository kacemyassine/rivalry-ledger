export class ArchivedLeaguesDetailPage {
    assertStandingsSectionIsVisible() {
        cy.get('[data-testid="standings-section"]').should("be.visible");
    }

    assertMatchHistorySectionIsVisible() {
        cy.get('[data-testid="match-history-section"]').should("be.visible");
    }

    assertTopScorersSectionIsVisible() {
        cy.get('[data-testid="top-scorers-section"]').should("be.visible");
    }
}