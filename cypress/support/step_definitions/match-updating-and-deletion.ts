import {
  Given,
  When,
  Then,
  DataTable,
} from "@badeball/cypress-cucumber-preprocessor";
import { getMatchByStats, getPlayerId } from "../matchHelpers";
import { MatchHistory } from "../components/MatchHistory";
import { MatchForm } from "../components/MatchForm";
import { ScorerInput } from "../matchHelpers";
import { TopScorers } from "../components/TopScorers";
import { Match } from "@/store/leagueStore";
import { setCurrentMatchId } from "./sharedState";

type MatchScorer = Match["scorers"][number];

const matchForm = new MatchForm();
const topScorers = new TopScorers();

// eslint-disable-next-line prefer-const
let initialGoals: Record<string, number> = {};
// eslint-disable-next-line prefer-const
let oldScorerGoals: Record<string, number> = {};
let deletedScorers: ScorerInput[] = [];

function setUpdatedScore(score: string) {
  const [home, away] = score.split("-");
  const homeGoals = Number(home);
  const awayGoals = Number(away);
  matchForm.enterHomeScore(homeGoals);
  matchForm.enterAwayScore(awayGoals);
}

let withScorersMatchId: string;
let withoutScorersMatchId: string;
let currentMatchId: string;

let updatedHomeGoals: number;
let updatedAwayGoals: number;
let updatedScorers: ScorerInput[] = [];

const matchHistory = new MatchHistory();

Given(
  "a match {string} with goal scorers exists:",
  (score: string, dataTable: DataTable) => {
    const scorers = dataTable.hashes().map((row) => ({
      team: row.team as "home" | "away",
      playerName: row["player-name"],
      goals: Number(row.goals),
      isOwnGoal: row["own-goal"] === "true",
    }));

    cy.fixture("leagueData.json").then((data) => {
      const matchId = getMatchByStats(score, scorers, data);
      if (!matchId) {
        throw new Error(
          `No match found with score "${score}" and given scorers`,
        );
      }

      withScorersMatchId = matchId;
    });
  },
);

Given("a match {string} without goal scorers exists", (score: string) => {
  cy.fixture("leagueData.json").then((data) => {
    const matchId = getMatchByStats(score, null, data);

    if (!matchId) {
      throw new Error(`No match found with score "${score}" and no scorers`);
    }

    withoutScorersMatchId = matchId;
  });
});

Given("I am updating the {string} with no scorers match", (score: string) => {
  cy.fixture("leagueData.json").then((data) => {
    const matchId = getMatchByStats(score, null, data);
    matchHistory.openMatchEditMode(withoutScorersMatchId);
    currentMatchId = withoutScorersMatchId;
    setCurrentMatchId(currentMatchId);
  });
});

Then("each player's total goal count shouldn't change", () => {
  cy.fixture("leagueData.json").then((data) => {
    updatedScorers.forEach((scorer) => {
      const playerId = getPlayerId(scorer.playerName, scorer.team, data);
      topScorers.assertPlayerGoals(playerId, initialGoals[playerId]);
    });
  });
});

When("I update the match score to {string}", (score: string) => {
  setUpdatedScore(score);
  matchForm.submit("update");
  cy.get('[role="dialog"]').should("not.exist");
});

Then(
  "the match should appear in the match history with a score of {string}",
  (score: string) => {
    const [home, away] = score.split("-");
    const homeGoals = Number(home);
    const awayGoals = Number(away);
    matchHistory.assertScore(withoutScorersMatchId, homeGoals, awayGoals);
  },
);

Given(
  "I am updating the {string} with scorers match in {string} league",
  (
    score: string,
    leagueType: "with-scorers" | "without-scorers",
    dataTable: DataTable,
  ) => {
    const scorers: ScorerInput[] = dataTable.hashes().map((row) => ({
      team: row.team as "home" | "away",
      playerName: row["player-name"],
      goals: Number(row.goals),
      isOwnGoal: row["own-goal"] === "true",
    }));
    updatedScorers = scorers;

    cy.fixture("leagueData.json").then((data) => {
      if (leagueType === "with-scorers") {
        updatedScorers.forEach((scorer) => {
          const playerId = getPlayerId(scorer.playerName, scorer.team, data);
          topScorers.getPlayerGoals(playerId).then((goals) => {
            initialGoals[playerId] = goals;
          });
        });
      }

      const matchId = getMatchByStats(score, scorers, data);

      const match = data.matches.find((m: Match) => m.id === matchId);
      match.scorers.forEach((s: MatchScorer) => {
        oldScorerGoals[s.playerId] = s.goals;
      });

      currentMatchId = matchId!;
      setCurrentMatchId(currentMatchId);
      matchHistory.openMatchEditMode(matchId!);
    });
  },
);

When(
  "I change the scorer of the {string} team {string} goals to {int}",
  (team: string, playerName: string, goals: number) => {
    cy.fixture("leagueData.json").then((data) => {
      const playerId = getPlayerId(playerName, team, data);
      matchForm.updateScorer(playerId, goals);

      const existing = updatedScorers.find(
        (s) => getPlayerId(s.playerName, s.team, data) === playerId,
      );
      if (existing) {
        existing.goals = goals;
      }
    });
  },
);

When("I submit the update", () => {
  matchForm.submit("update");
});

When("I set the old score to {string}", (score: string) => {
  setUpdatedScore(score);
  updatedHomeGoals = Number(score.split("-")[0]);
  updatedAwayGoals = Number(score.split("-")[1]);
});

Then(
  "the match should appear in the match history with updated scorers",
  () => {
    matchHistory.assertScore(
      currentMatchId,
      updatedHomeGoals,
      updatedAwayGoals,
    );
    matchHistory.assertScorers(
      currentMatchId,
      updatedScorers.map((s) => ({ ...s, isOwnGoal: s.isOwnGoal ?? false })),
    );
  },
);

Then("each player's total goal count should reflect the updated values", () => {
  cy.log("im here");
  cy.fixture("leagueData.json").then((data) => {
    updatedScorers.forEach((scorer) => {
      const playerId = getPlayerId(scorer.playerName, scorer.team, data);
      topScorers.assertPlayerGoals(
        playerId,
        initialGoals[playerId] - (oldScorerGoals[playerId] ?? 0) + scorer.goals,
      );
    });
  });
});

When("I click the submit button", () => {
  matchForm.submit("update");
});

When("I close the match form without saving", () => {
  matchForm.closeTheForm();
});

When("I change the match date to {string}", (newDate: string) => {
  matchForm.changeDateTo(newDate);
  matchForm.submit("update");
});

Then(
  "the match should appear in the match history with the new date {string}",
  (newDate: string) => {
    matchHistory.assertDateIs(currentMatchId, newDate);
  },
);

Then(
  "An error message telling the date cannot be in the future should appear",
  () => {
    matchForm.assertDateErrorMessage();
  },
);

Then(
  "the match should still appear in the match history with a date of {string}",
  (expectedDate: string) => {
    matchHistory.assertDateIs(currentMatchId, expectedDate);
  },
);

Given("I am deleting the {string} with no scorers match", (score: string) => {
  cy.fixture("leagueData.json").then((data) => {
    const matchId = getMatchByStats(score, null, data);
    currentMatchId = matchId!;
    setCurrentMatchId(currentMatchId);
  });
});

When("I delete the match", () => {
  cy.log(`Deleting match with ID: ${currentMatchId}`);
  matchHistory.deleteMatch(currentMatchId);
  matchHistory.confirmDeleteMatch();
});

Then("the match should no longer appear in the match history", () => {
  matchHistory.assertMatchDoesNotExist(currentMatchId);
});

When("I try mistakenly to delete the match", () => {
  matchHistory.deleteMatch(currentMatchId);
});

Then("I should see the delete confirmation message", () => {
  cy.get('[data-testid="delete-confirmation-dialog"]').should("be.visible");
});

When("I cancel the deletion", () => {
  matchHistory.cancelDeleteMatch();
});

Given(
  "I am deleting the {string} with scorers match in {string} league",
  (
    score: string,
    leagueType: "withoutScorers" | "with-scorers",
    dataTable: DataTable,
  ) => {
    const scorers: ScorerInput[] = dataTable.hashes().map((row) => ({
      team: row.team as "home" | "away",
      playerName: row["player-name"],
      goals: Number(row.goals),
      isOwnGoal: row["own-goal"] === "true",
    }));

    deletedScorers = scorers;

    cy.fixture("leagueData.json").then((data) => {
      scorers.forEach((scorer) => {
        const playerId = getPlayerId(scorer.playerName, scorer.team, data);

        if (leagueType === "with-scorers") {
          topScorers.getPlayerGoals(playerId).then((goals) => {
            initialGoals[playerId] = goals;
            oldScorerGoals[playerId] = scorer.goals;
          });
        }

        const matchId = getMatchByStats(score, scorers, data);
        currentMatchId = matchId!;
        setCurrentMatchId(currentMatchId);
      });
    });
  },
);

Then("each player's total goal count should decrease accordingly", () => {
  cy.fixture("leagueData.json").then((data) => {
    deletedScorers.forEach((scorer) => {
      const playerId = getPlayerId(scorer.playerName, scorer.team, data);
      topScorers.assertPlayerGoals(
        playerId,
        initialGoals[playerId] - scorer.goals,
      );
    });
  });
});
