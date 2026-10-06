Feature: Create New League
  As an admin, I want to archive the current league and start a new one
  so that the competition can continue with a fresh slate.

  Background:
    Given I am logged in as admin
    And I am on the admin page

  # --- Unsaved Changes Guard ---

  Scenario: Admin cannot start a new league with unsaved changes
    Given I have unsaved changes
    When I try to start a new league
    Then I should see the "Unsaved Changes Warning" dialog

  Scenario: Admin saves changes and continues to new league when all matches are played
    Given target matches for the current league has been reached
    And I have unsaved changes
    When I try to start a new league
    And I click the "Save & Continue" button on the "Unsaved Changes Warning" dialog
    Then I should see the "Config" dialog

  # --- Incomplete League Warning ---

  Scenario: Admin is warned when league has not reached target matches
    Given the current league has played less matches than the target
    When I try to start a new league
    Then I should see the "League Incomplete" dialog

  Scenario: Admin proceeds despite incomplete league
    Given the current league has played less matches than the target
    When I try to start a new league
    And I choose to proceed despite the warning
    Then I should see the "Config" dialog

  # --- Validation ---

  Scenario: Admin cannot proceed to confirmation without a league name
    Given target matches for the current league has been reached
    And I am on the config dialog
    When I leave the league name empty
    Then the "Next" button should be disabled

  Scenario: Admin cannot proceed with only spaces as league name
    Given target matches for the current league has been reached
    And I am on the config dialog
    When I type "   " as the new league name
    Then the "Next" button should be disabled

  #  ─── Guards ───────────────────────────────────────────────────────────────

  Scenario: Admin cannot start a new league with fewer than 4 matches
    Given the current league has fewer than 4 matches played
    When I click the "Start New League" button on the admin page
    Then I should see the error toast "Cannot start new league: at least 4 matches required."
    And no dialog should open

  Scenario: Admin is blocked by unsaved changes
    Given the current league has at least 4 matches played
    And I have unsaved changes
    When I click the "Start New League" button on the admin page
    Then I should see the "Unsaved Changes Warning" dialog

  Scenario: Admin dismisses the unsaved changes dialog
    Given I have unsaved changes
    And the "Unsaved Changes Warning" dialog is open
    When I click the "OK" button on the "Unsaved Changes Warning" dialog
    Then the dialog should close
    And I should remain on the admin page with my unsaved changes intact

  Scenario: Admin saves and continues from the unsaved changes dialog
    Given target matches for the current league has been reached
    And I have unsaved changes
    And the "Unsaved Changes Warning" dialog is open
    When I click the "Save & Continue" button on the "Unsaved Changes Warning" dialog
    Then my changes should be saved to GitHub
    And I should be on the "Config" dialog

  Scenario: Admin saves and is shown the warning dialog when league is not complete
    Given the current league has played less matches than the target
    And I have unsaved changes
    And the "Unsaved Changes Warning" dialog is open
    When I click the "Save & Continue" button on the "Unsaved Changes Warning" dialog
    Then my changes should be saved to GitHub
    And I should be on the "League Incomplete" dialog

  Scenario: Admin is warned when the league has not reached its target
    Given the current league has at least 4 matches played but has not yet reached its target
    And I have no unsaved changes
    When I click the "Start New League" button on the admin page
    Then I should be on the "League Incomplete" dialog
    And I should see the played vs target match count
    And I should see that target will be adjusted to the number of played matches

  Scenario: Admin cancels the league-not-complete warning
    Given the current league has at least 4 matches played but has not yet reached its target
    And I have no unsaved changes
    When I click the "Start New League" button on the admin page
    And I click the "Cancel" button on the "League Incomplete" dialog
    Then the dialog should close
    And I should remain on the admin page with no changes made
    #  If a new league had started, the app would navigate to the visitor page — remaining on admin confirms the cancel worked
    # No unsaved changes component appearing confirms the league data was not modified
  
  
  Scenario: Admin proceeds past the league-not-complete warning
    Given the "League Incomplete" dialog is open
    When I click the "Proceed" button on the "League Incomplete" dialog
    Then I should be on the "Config" dialog

  # ─── Config dialog ────────────────────────────────────────────────────────

  Scenario: Config dialog opens directly when league has reached its target
    Given target matches for the current league has been reached
    And I have no unsaved changes
    When I click the "Start New League" button on the admin page
    Then I should be on the "Config" dialog

  Scenario: Next button is disabled when league name is empty
    Given the "Config" dialog is open
    When the New League Name field is empty
    Then the "Next" button should be disabled

  Scenario: Next button is disabled when league name is whitespace only
    Given the "Config" dialog is open
    When I type "   " in the New League Name field
    Then the "Next" button should be disabled

  Scenario: Admin selects "Without Scorers" league type
    Given the "Config" dialog is open
    When I click the "Without Scorers" button in the Config dialog
    Then the "Without Scorers" button should be highlighted as active

  Scenario: Archive image is optional
    Given the "Config" dialog is open
    And I have not selected an image
    When I enter a valid league name and click Next
    Then I should be on the "Confirmation" dialog

  Scenario: Admin cancels the config dialog
    Given the "Config" dialog is open
    When I click the "Cancel" button in the Config dialog
    Then the dialog should close

  Scenario: Admin proceeds to the confirm dialog with valid config
    Given the "Config" dialog is open
    When I type "Summer League 2027" in the New League Name field
    And I set target matches to 30
    And I click the "Without Scorers" button in the Config dialog
    And I click the "Next" button in the Config dialog
    Then I should be on the "Confirmation" dialog

  # ─── Confirm dialog ───────────────────────────────────────────────────────


  Scenario: Admin goes back from the confirm dialog to the config dialog
    Given the "Confirmation" dialog is open
    When I click the "Back" button in the Confirmation dialog
    Then I should be on the "Config" dialog
    # And my previously entered values should still be present

  Scenario: Admin sees a loading state while archiving
    Given the "Confirmation" dialog is open
    When I click the "Archive & Start New" button in the Confirmation dialog
    Then I should see a spinner and "Archiving league and preparing new season..."
    And the app should navigate to the home page after archiving success

  # ─── Outcome ─────────────────────────────────────────────────────────────

    Scenario: Archiving a league succeeds
    Given the "Confirmation" dialog is open
    When I click the "Archive & Start New" button in the Confirmation dialog
    Then I should see a spinner and "Archiving league and preparing new season..."
    Then I should see a success confiramation message
    And the app should navigate to the home page after archiving success

  Scenario: New league is created after archive
    Given the "Confirmation" dialog is open
    When I click the "Archive & Start New" button in the Confirmation dialog
    Then the visitor page should show a new league with zero matches

  Scenario: Archive fails and the current league is preserved
    Given the "Confirmation" dialog is open
    When I click the "Archive & Start New" button in the Confirmation dialog
    And the archive operation fails
    Then I should see a message that indicates an error
    And the "Confirmation" dialog should remain open
