import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { PlayerForm } from "../components/PlayerForm";
import { TopScorers } from "../components/TopScorers";
import { getPlayerId, getTeamName } from "../matchHelpers";
import { Player } from "@/store/leagueStore";

const playerForm = new PlayerForm();
const topScorers = new TopScorers();

let currentPlayerId: string | null = null;

beforeEach(() => {
  currentPlayerId = null;
});

When(
  "I add a new player with name {string} to the {string} team",
  (playerName: string, team: "home" | "away") => {
    playerForm.addPlayer(playerName, team);
  },
);

Then(
  "The new {string} team player {string} should appear in the players list",
  (team: "home" | "away", playerName: string) => {
    const teamId = team === "home" ? "team-1" : "team-2";
    cy.fixture("leagueData.json").then((data) => {
      const playerId = `player-${data.players.length + 1}`;
      topScorers.assertPlayerExists(playerId, playerName);
      topScorers.assertPLayerBelongsToTeam(playerId, teamId);
    });
  },
);

Then("I should see the form error {string}", (errorMessage: string) => {
  cy.get('[data-testid="form-error"]').should("contain.text", errorMessage);
});

Given(
  "I am editing the {string} team player {string}",
  (team: "home" | "away", oldPlayerName: string) => {
    cy.fixture("leagueData.json").then((data) => {
      const playerId = getPlayerId(oldPlayerName, team, data);

      topScorers.getPlayerRow(playerId);
      currentPlayerId = playerId;
    });
  },
);

When("I edit the Player name to {string}", (newPlayerName: string) => {
  if (currentPlayerId) {
    playerForm.editPlayerName(currentPlayerId, newPlayerName);
  }
});

Then("{string} should appear in the players list", (newPlayerName: string) => {
  if (currentPlayerId) {
    topScorers
      .getPlayerRow(currentPlayerId)
      .should("contain.text", newPlayerName);
  }
});

When("I edit the Player team to {string}", (newTeam: "home" | "away") => {
  playerForm.editPlayerTeam(currentPlayerId!, newTeam);
});

Then(
  "{string} should appear under the {string} team",
  (playerName: string, newTeam: "home" | "away") => {
    cy.fixture("leagueData.json").then((data) => {
      const playerId = currentPlayerId;
      const teamId = newTeam === "home" ? "team-1" : "team-2";
      const teamName = getTeamName(teamId, data);
      topScorers
        .getPlayerRow(playerId!)
        .should("include.text", playerName)
        .and("include.text", teamName);
    });
  },
);

Then(
  "the delete button for the {string} team player {string} should be disabled",
  (team: "home" | "away", playerName: string) => {
    cy.fixture("leagueData.json").then((data) => {
      const playerId = getPlayerId(playerName, team, data);
      topScorers.getDeletePlayerButton(playerId).should("be.disabled");
    });
  },
);

When(
  "I delete the {string} team player {string}",
  (team: "home" | "away", playerName: string) => {
    cy.fixture("leagueData.json").then((data) => {
      const playerId = getPlayerId(playerName, team, data);
      currentPlayerId = playerId;
      topScorers.assertPlayerExists(playerId);
      cy.log("the player already exists");
      topScorers.getDeletePlayerButton(playerId).click();
    });
  },
);

Then("{string} should no longer appear in the players list", () => {
  if (currentPlayerId) {
    topScorers.assertPlayerDoesNotExist(currentPlayerId);
  }
});

Then(
  "all delete buttons for the {string} team should be disabled",
  (team: "home" | "away") => {
    const teamId = team === "home" ? "team-1" : "team-2";
    cy.fixture("leagueData.json").then((data) => {
      const teamPlayers = data.players.filter(
        (p: Player) => p.teamId === teamId,
      );
      teamPlayers.forEach((p: Player) => {
        topScorers.getDeletePlayerButton(p.id).should("be.disabled");
      });
    });
  },
);
