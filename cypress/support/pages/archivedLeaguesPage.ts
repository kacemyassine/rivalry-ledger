export class ArchivedLeaguesPage {
  private getArchivedLeaguesPage = () =>
    cy.get('[data-testid="archived-leagues-page"]');

  private ArchivedLeaguesList: { name: string }[] = [];

  getArchivedLeaguesList() {
    return this.ArchivedLeaguesList;
  }

  setArchivedLeaguesList(archivedLeagues: { name: string }[]) {
    this.ArchivedLeaguesList = archivedLeagues;
  }

  assertLoaderIs(state: "visible" | "not.exist") {
    this.getArchivedLeaguesPage().within(() => {
      cy.get('[data-testid="archived-leagues-loader"]').should(state);
    });
  }

  assertCardForArchivedLeagueIsVisible(leagueName: string) {
    this.getArchivedLeaguesPage().within(() => {
      cy.get(`[data-testid="archived-league-card-${leagueName}"]`)
        .scrollIntoView()
        .should("be.visible");
    });
  }

  clickOnArchivedLeagueCard(leagueName: string) {
    this.getArchivedLeaguesPage().within(() => {
      cy.get(`[data-testid="archived-league-card-${leagueName}"]`).click();
    });
  }

  assertNoArchivedLeaguesMessageIsVisible() {
    this.getArchivedLeaguesPage().within(() => {
      cy.get('[data-testid="no-archived-leagues-message"]').should("be.visible");
    });
  }

  assertLeagueNotFoundSpinnerIsNotVisible() {
    cy.get('[data-testid="league-not-found-spinner"]').should("not.exist");
  }

  assertLeagueNotFoundMessageIsVisible() {
    cy.get('[data-testid="league-not-found-message"]').should("be.visible");
  }
}
