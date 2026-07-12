import { LeagueData } from "@/lib/githubUtils";
import { getTeamName } from "../matchHelpers";

export class TopScorers {
  getPlayerRow(playerId: string) {
    return cy.get(`[data-testid="player-row-${playerId}"]`);
  }

  getPlayerGoals(playerId: string) {
    return this.getPlayerRow(playerId)
      .find('[data-testid="player-goals"]')
      .invoke("text")
      .then((text: string) => Number(text.trim()));
  }

  assertPlayerGoals(playerId: string, expectedGoals: number) {
    this.getPlayerGoals(playerId).then((goals: number) => {
      expect(goals).to.eq(expectedGoals);
    });
  }

  clickEditPlayerButton(playerId: string) {
    this.getPlayerRow(playerId).within(() => {
      cy.get('[data-testid="edit-player-btn"]').should("be.enabled").click();
    });
  }

  getDeletePlayerButton(playerId: string) {
    return this.getPlayerRow(playerId).find(
      '[data-testid="delete-player-btn"]',
    );
  }

  clickShowAllLessPlayersButton(action: "all" | "less" = "all") {
    cy.get('[data-testid="show-all/less-players-btn"]').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn)
          .should("be.visible")
          .and("be.enabled")
          .and("not.contain.text", new RegExp(`show ${action}`, "i"))
          .click();
      }
    });
  }

  assertPlayerExists(playerId: string, playerName?: string) {
    cy.get("body").then(($body) => {
      const $btn = $body.find('[data-testid="show-all/less-players-btn"]');
      const $player = $body.find(`[data-testid="player-row-${playerId}"]`);

      if ($btn.length > 0 && $player.length === 0) {
        this.clickShowAllLessPlayersButton("all");
      } else if ($btn.length === 0 && $player.length === 0) {
        // button not found yet, wait for it and click
        cy.get('[data-testid="show-all/less-players-btn"]').click();
      }
    });
    if (playerName)
      this.getPlayerRow(playerId).should("include.text", playerName);
    this.getPlayerRow(playerId).should("exist");
  }
  assertPLayerBelongsToTeam(playerId: string, teamId: "team-1" | "team-2") {
    cy.fixture("leagueData.json").then((data: LeagueData) => {
      const teamName = getTeamName(teamId, data);
      cy.get("body").then(($body) => {
        const $btn = $body.find('[data-testid="show-all/less-players-btn"]');
        const $player = $body.find(`[data-testid="player-row-${playerId}"]`);

        if ($btn.length > 0 && $player.length === 0) {
          this.clickShowAllLessPlayersButton("all");
        }
      });
      this.getPlayerRow(playerId)
        .should("exist")
        .should("contain.text", teamName);
    });
  }

  assertPlayerDoesNotExist(playerId: string) {
    cy.get("body").then(($body) => {
      const $btn = $body.find('[data-testid="show-all/less-players-btn"]');
      if ($btn.length > 0 && $btn.text().toLowerCase().includes("show all")) {
        this.clickShowAllLessPlayersButton("all");
      }
    });
    this.getPlayerRow(playerId).should("not.exist");
  }
}
