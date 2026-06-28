import {
  Given,
  When,
  Then,
  DataTable,
} from "@badeball/cypress-cucumber-preprocessor";
import { MatchForm } from "../components/MatchForm";
import { AdminPage } from "../pages/adminPage";
import { MatchHistory } from "../components/MatchHistory";
import { TopScorers } from "../components/TopScorers";
import { getPlayerId } from "../../support/matchHelpers";
import { Player } from "@/store/leagueStore";

const adminPage = new AdminPage();
const matchForm = new MatchForm();
const topScorers = new TopScorers();
const matchHistory = new MatchHistory();

let homeGoals = 0;
let awayGoals = 0;
let nextMatchId = "";
let scorers: { team: "home" | "away"; playerName: string; goals: number; isOwnGoal: boolean }[] =
  [];
// eslint-disable-next-line prefer-const
let resolvedScorerIds: Record<string, string> = {}; // playerName -> playerId
// eslint-disable-next-line prefer-const
let initialGoals: Record<string, number> = {};

function setScore(score: string) {
  const match = score.match(/^\(?(-?\d+)\)?-\(?(-?\d+)\)?$/);
  homeGoals = Number(match![1]);
  awayGoals = Number(match![2]);

  cy.fixture("leagueData.json").then((data) => {
    nextMatchId = `match-${data.matches.length + 1}`;
    adminPage.clickRecordMatch();
    matchForm.enterHomeScore(homeGoals);
    matchForm.enterAwayScore(awayGoals);
  });
}

When("I record a match with a final score of {string}", (score: string) => {
  setScore(score);
  matchForm.submit();
});

When("I record the match", () => {
  matchForm.submit();
});

When("I set the score to {string}", (score: string) => {
  setScore(score);
});
Then("the match should appear in the match history with no scorers", () => {
  matchHistory.assertMatchExists(nextMatchId);
  matchHistory.assertScore(nextMatchId, homeGoals, awayGoals);
  matchHistory.assertNoScorers(nextMatchId);
});

Then(
  "the match should appear in the match history with corresponding scorers",
  () => {
    matchHistory.assertMatchExists(nextMatchId);
    matchHistory.assertScore(nextMatchId, homeGoals, awayGoals);
    matchHistory.assertScorers(nextMatchId, scorers);
  },
);

When("I assign goals to scorers:", (dataTable: DataTable) => {
  scorers = dataTable.hashes().map((row) => ({
    team: row.team as "home" | "away",
    playerName: row["player-name"],
    goals: Number(row.goals),
    isOwnGoal: row["own-goal"] === "true",
  }));

  cy.fixture("leagueData.json").then((data) => {
    scorers.forEach((scorer) => {
      const playerId = getPlayerId(scorer.playerName, scorer.team, data);
      resolvedScorerIds[`${scorer.team}-${scorer.playerName}`] = playerId;
      initialGoals[playerId] =
        data.players.find((p: Player) => p.id === playerId)?.goals ?? 0;
      matchForm.addScorer(
        playerId,
        scorer.playerName.replace("-", " "),
        scorer.goals,
        scorer.isOwnGoal,
      );
    });
  });
});

Then("each player's total goal count should increase accordingly", () => {
  const totalsByPlayer: Record<string, number> = {};

  scorers
    .filter((scorer) => !scorer.isOwnGoal)
    .forEach((scorer) => {
      const playerId = resolvedScorerIds[`${scorer.team}-${scorer.playerName}`];
      totalsByPlayer[playerId] = (totalsByPlayer[playerId] ?? 0) + scorer.goals;
    });

  Object.entries(totalsByPlayer).forEach(([playerId, totalGoalsScored]) => {
    topScorers.assertPlayerGoals(
      playerId,
      initialGoals[playerId] + totalGoalsScored,
    );
  });
});

Then("An error message telling goals don't add up should appear", () => {
  cy.contains(new RegExp("goals don.t add up", "i")).should("be.visible");
});


