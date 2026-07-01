import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { currentMatchId } from "./sharedState";
import { MatchHistory } from "../components/MatchHistory";

const matchHistory = new MatchHistory();

Then(
  "the match should still appear in the match history with a score of {string}",
  (score: string) => {
    const [home, away] = score.split("-");
    const homeGoals = Number(home);
    const awayGoals = Number(away);
    cy.get('[role="dialog"]').should("not.exist");
    matchHistory.assertScore(currentMatchId, homeGoals, awayGoals);
  },
);
