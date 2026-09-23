import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { MatchHistory } from "../POM/components/MatchHistory";
import { AdminPage } from "../pages/adminPage";
import { PlayerForm } from "../POM/components/PlayerForm";
import { interceptMatchesWithCount } from "../matchHelpers"; 
import { LeagueData } from "../POM/leagueData";

const matchHistory = new MatchHistory();
const adminPage = new AdminPage();
const playerForm = new PlayerForm();
const leagueData = new LeagueData();


Given('I have unsaved changes' , () => {
    playerForm.editPlayerName('player-1', 'New Player Name');
    adminPage.assertUsavedChangesIs('be.visible');
})

When("I try to start a new league", () => {
    adminPage.clickStartNewLeague();
})

Then('I should see the {string} dialog', (dialogType: 'Unsaved Changes Warning' | 'Config' | 'Confirmation' | 'League Incomplete') => {
    adminPage.getDialog(dialogType);
})

When("I click the {string}", (buttonName: string ) => {
    cy.get('button').contains(buttonName).click();
})

Given('target matches for the current league has been reached', () => {
  leagueData.getMatchCount().then((matchCount) => {
    leagueData.setTargetMatches(matchCount);
  });
});

Given('the current league has played less matches than the target', () => {
  leagueData.getTargetMatches().then((target) => {
  leagueData.getMatchCount().then((count) => {
    if (count >= target) {
      leagueData.setTargetMatches(count + 1); 
      // This ensures that the target is now greater than the current match count
    }
    // else already less than target, no need to touch anything
  });
});
});

When('I choose to proceed despite the warning', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('button').contains('Proceed').click();
  });
});

Given('I am on the config dialog', () => {
  adminPage.clickStartNewLeague();
  adminPage.getDialog('Config');
});

When('I leave the league name empty', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="new-league-name-input"]').clear();
  });
});

Then('the {string} button should be disabled', (buttonName: string) => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('button').contains(buttonName).should('be.disabled');
  });
});

When('I type {string} as the new league name', (leagueName: string) => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="new-league-name-input"]').clear().type(leagueName);
  });
});

Given('the current league has fewer than 4 matches played', () => {
  interceptMatchesWithCount(3);
});

Then('I should see the error toast {string}', (errorMessage: string) => {
  cy.get('[data-sonner-toast]').should('contain.text', errorMessage)
});

Then('no dialog should open', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

Given('the current league has at least 4 matches played', () => {
  interceptMatchesWithCount(4);
});