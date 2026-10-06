import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { MatchHistory } from "../POM/components/MatchHistory";
import { AdminPage } from "../pages/adminPage";
import { PlayerForm } from "../POM/components/PlayerForm";
import { interceptMatchesWithCount } from "../matchHelpers";
import { LeagueData } from "../POM/leagueData";
import { API_SUCCESS, API_ERRORS } from "@/lib/errors";
import { ConfigDialog } from "../POM/configDialog";
import { ConfirmationDialog } from "../POM/confirmationDialog";

const matchHistory = new MatchHistory();
const adminPage = new AdminPage();
const playerForm = new PlayerForm();
const leagueData = new LeagueData();
const configDialog = new ConfigDialog();
const confirmationDialog = new ConfirmationDialog();


Given("I have unsaved changes", () => {
  playerForm.editPlayerName("player-1", "New Player Name");
  adminPage.assertUsavedChangesIs("be.visible");
});

When("I try to start a new league", () => {
  adminPage.clickStartNewLeague();
});

Then(
  "I should see the {string} dialog",
  (
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) => {
    adminPage.getDialog(dialogType);
  },
);

When("I click the {string} button on the admin page", (buttonName: string) => {
  cy.get("button").contains(buttonName).click();
});

Given("target matches for the current league has been reached", () => {
  leagueData.getMatchCount().then((matchCount) => {
    leagueData.setTargetMatches(matchCount);
  });
});

Given("the current league has played less matches than the target", () => {
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

When("I choose to proceed despite the warning", () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get("button").contains("Proceed").click();
  });
});

Given("I am on the config dialog", () => {
  adminPage.clickStartNewLeague();
  adminPage.getDialog("Config");
});

When("I leave the league name empty", () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="new-league-name-input"]').clear();
  });
});

Then("the {string} button should be disabled", (buttonName: string) => {
  cy.get('[role="dialog"]').within(() => {
    cy.get("button").contains(buttonName).should("be.disabled");
  });
});

When("I type {string} as the new league name", (leagueName: string) => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('[data-testid="new-league-name-input"]').clear().type(leagueName);
  });
});

Given("the current league has fewer than 4 matches played", () => {
  interceptMatchesWithCount(3);
});

Then("I should see the error toast {string}", (errorMessage: string) => {
  cy.get("[data-sonner-toast]").should("contain.text", errorMessage);
});

Then("no dialog should open", () => {
  cy.get('[role="dialog"]').should("not.exist");
});

Given("the current league has at least 4 matches played", () => {
  interceptMatchesWithCount(4);
});

Given(
  "the {string} dialog is open",
  (
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) => {
    adminPage.openDialog(dialogType);
  },
);

Then("the dialog should close", () => {
  cy.get('[role="dialog"]').should("not.exist");
});

Then("I should remain on the admin page with my unsaved changes intact", () => {
  cy.url().should("include", "/admin");
  adminPage.assertUsavedChangesIs("be.visible");
  // Unsaved changes feature will be implemented soon ,
  //  so now we only verify that the unsaved changes is still visible.
});

Then("my changes should be saved to GitHub", () => {
  cy.get("[data-sonner-toast]").should(
    "contain.text",
    API_SUCCESS.SAVE_SUCCESS,
  );
  adminPage.assertUsavedChangesIs("not.exist");
});

Then(
  "I should be on the {string} dialog",
  (
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) => {
    adminPage.getDialog(dialogType);
  },
);

Given("I have no unsaved changes", () => {
  cy.get('[data-testid="save-btn"]').then(($btn) => {
    if (!$btn.is(":disabled")) {
      adminPage.clickSaveToGitHub();
    }
  });
});

Given(
  "the current league has at least 4 matches played but has not yet reached its target",
  () => {
    leagueData.setMatchCountWithTarget(4);
  },
);

Then("I should see the played vs target match count", () => {
  leagueData.getMatchCount().then((played) => {
    leagueData.getTargetMatches().then((target) => {
      cy.get('[data-testid="played-vs-target-count"]').should(
        "contain.text",
        `${played}/${target}`,
      );
    });
  });
});

Then(
  "I should see that target will be adjusted to the number of played matches",
  () => {
    leagueData.getMatchCount().then((played) => {
      cy.get('[data-testid="new-target-matches"]').should(
        "contain.text",
        `${played}`,
      );
    });
  },
);

When(
  "I click the {string} button on the {string} dialog",
  (
    buttonName: string,
    dialogType:
      | "Unsaved Changes Warning"
      | "Config"
      | "Confirmation"
      | "League Incomplete",
  ) => {
    adminPage.getDialog(dialogType).within(() => {
      cy.get("button").contains(buttonName).click();
    });
  },
);

Then("I should remain on the admin page with no changes made", () => {
  cy.url().should("include", "/admin");
  adminPage.assertUsavedChangesIs("not.exist");
});

When('the New League Name field is empty', () => {
  configDialog.checkNameField('empty');
});

When('I type {string} in the New League Name field', (leagueName: string) => {
  configDialog.enterNewLeagueName(leagueName);
  configDialog.checkNameField('contains', leagueName);
});

When('I click the {string} button in the Config dialog', (leagueType: "Without Scorers" | "With Scorers") => {
  configDialog.setLeagueType(leagueType);
});

Then('the {string} button should be highlighted as active', (leagueType: "Without Scorers" | "With Scorers") => {
  configDialog.assertLeagueTypeActive(leagueType);
});

Given('I have not selected an image', () => {
  configDialog.assertNoImageHasBeenSelected();
});

When('I enter a valid league name and click Next', () => {
  configDialog.enterNewLeagueName('valid league name');
  configDialog.clickNextButton();
});

When('I set target matches to {int}', (targetMatches:number) => {
  configDialog.setTargetMatches(targetMatches);
});

When('I click the {string} button in the Confirmation dialog' , (buttonName: 'Back' | 'Archive & Start New') => {
  if (buttonName === 'Archive & Start New') {
    leagueData.setEmptyLeague();
  }
  confirmationDialog.clickTheButton(buttonName);
});

Then('I should see a spinner and "Archiving league and preparing new season..."', () => {
  confirmationDialog.assertSpinnerIsVisible();
});

Then('the app should navigate to the home page after archiving success', () => {
  confirmationDialog.assertArchivingSuccess();
});

Then('I should see a success confiramation message', () => {
  cy.get("[data-sonner-toast]" ,{ timeout: 6000}).should(
    "contain.text",
    API_SUCCESS.ARCHIVE_SUCCESS,
  );
  adminPage.assertUsavedChangesIs("not.exist");
})

Then('the visitor page should show a new league with zero matches', () => {
  cy.get('[data-testid="confirm-dialog"]', { timeout: 6000 }).should('not.exist');
  cy.url().should('include', '/');
  matchHistory.assertNoMatchesExist();
})

When('the archive operation fails', () => {
  leagueData.setArchiveFailure();
})

Then('I should see a message that indicates an error', () => {
  cy.get("[data-sonner-toast]", { timeout: 6000 }).should(
    "contain.text",
    API_ERRORS.ARCHIVE_FAILED
  );
});

Then('the {string} dialog should remain open', (dialogType: "Unsaved Changes Warning" | "Config" | "Confirmation" | "League Incomplete") => {
  adminPage.getDialog(dialogType);
});
