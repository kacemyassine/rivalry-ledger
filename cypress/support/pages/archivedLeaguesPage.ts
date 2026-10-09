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
}
