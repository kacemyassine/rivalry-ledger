import {
  Given,
  When,
  Then,
} from "@badeball/cypress-cucumber-preprocessor";
import { LeagueData } from "../POM/leagueData";
import { ArchivedLeaguesPage } from "../pages/archivedLeaguesPage";
import { ArchivedLeaguesDetailPage } from "../pages/archivedLeagueDetailPage";

const leagueData = new LeagueData();
const archivedLeaguesPage = new ArchivedLeaguesPage();
const archivedLeagueDetailPage = new ArchivedLeaguesDetailPage();
Given("I navigate to {string}", (url: string) => {
  cy.visit("/");
  cy.url().should("include", "/");
  cy.visit(url);
  cy.url().should("include", url);
});

Given("there are no archived leagues", () => {
  leagueData.setEmptyArchivedLeague();
});

Then(
  "I should see a message indicating that there are no archived leagues",
  () => {
    archivedLeaguesPage.assertNoArchivedLeaguesMessageIsVisible();
  },
);

Then(
  'I should see a "League not found" message with a link to return to archived leagues',
  () => {
    archivedLeaguesPage.assertLeagueNotFoundMessageIsVisible();
    archivedLeaguesPage.assertLeagueNotFoundSpinnerIsNotVisible();
  },
);

Given("the requested archived league does not exist", () => {
  leagueData.setUnexistingArchivedLeague();
});

Given("there are two archived leagues available", () => {
  const archivedLeaguesNames = [
    { name: "Archived League 1" },
    { name: "Archived League 2" },
  ];
  archivedLeaguesPage.setArchivedLeaguesList(archivedLeaguesNames);
  leagueData.setArchivedLeagues(archivedLeaguesNames);
});

Then("I should see all archived leagues listed on the page", () => {
  const archivedLeagues = archivedLeaguesPage.getArchivedLeaguesList();
  archivedLeagues.forEach((league) => {
    archivedLeaguesPage.assertCardForArchivedLeagueIsVisible(league.name);
  });
});

Given(
  "there is a single archived league with the name {string}",
  (leagueName: string) => {
    const archivedLeagues = [{ name: leagueName }];
    archivedLeaguesPage.setArchivedLeaguesList(archivedLeagues);
    leagueData.setArchivedLeagues(archivedLeagues);
  },
);

When(
  "I click on the archived league card for {string}",
  (leagueName: string) => {
    archivedLeaguesPage.assertCardForArchivedLeagueIsVisible(leagueName);
    archivedLeaguesPage.clickOnArchivedLeagueCard(leagueName);
  },
);

Then("I should be on the league detail page", () => {
  // Assuming this step definition always find one archived league in the list
  const archivedLeagueName =
    archivedLeaguesPage.getArchivedLeaguesList()[0].name;
  cy.url().should(
    "include",
    `/archived-leagues/${archivedLeagueName.toLowerCase().replace(/\s+/g, "-")}`,
  );
});

Given("I am on an archived league detail page for {string}", (leagueName: string) => {
    const archivedLeagues = [{ name: leagueName }];
    leagueData.setArchivedLeagues(archivedLeagues);
    archivedLeaguesPage.setArchivedLeaguesList(archivedLeagues);
    cy.visit(`/archived-leagues/${leagueName.toLowerCase().replace(/\s+/g, "-")}`);
});

Then('I should see the standings, match history, and top scorers sections', () => {
    archivedLeagueDetailPage.assertStandingsSectionIsVisible();
    archivedLeagueDetailPage.assertMatchHistorySectionIsVisible();
    archivedLeagueDetailPage.assertTopScorersSectionIsVisible();
});
