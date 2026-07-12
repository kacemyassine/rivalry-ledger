import { TopScorers } from "../components/TopScorers";
import { getTeamName } from "../matchHelpers";
const topScorers = new TopScorers();
export class PlayerForm {
  addPlayer(playerName: string, team: 'home' | 'away') {
    const teamId = team === 'home' ? "team-1" : "team-2";
    cy.get(`[data-testid="add-player-btn"]`).click();
    cy.get('[data-testid="image-upload-input"]').selectFile(
      "cypress/fixtures/mohamed-salah.webp",
      { force: true },
    );
    if (!playerName) {
      cy.get("#name").clear()
    } else {
      cy.get("#name").clear().type(playerName);
    }
    cy.get('[role="combobox"]').click();
    cy.get(`option[value="${teamId}"]`).click({ force: true});
    cy.get('[role="listbox"]').should("not.exist");
    cy.get('[data-testid="save-button"]').click();
  }

  editPlayerName(playerId: string, newPlayerName: string) {
    topScorers.clickEditPlayerButton(playerId);
    cy.get("#name").clear().type(newPlayerName);
      cy.get('[data-testid="save-button"]').click();
  }

  editPlayerTeam(playerId: string, newTeam: "home" | "away") {
  const teamId = newTeam === "home" ? "team-1" : "team-2";
  cy.fixture("leagueData.json").then((data) => {
    const teamName = getTeamName(teamId, data);
    topScorers.clickEditPlayerButton(playerId);
    cy.get('[role="combobox"]').click();
    cy.get('[role="option"]').contains(teamName!).click({ force: true });
    cy.get('[role="listbox"]').should("not.exist");
    cy.get('[data-testid="save-button"]').click();
  });
}
}