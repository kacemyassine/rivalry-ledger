Feature: Create New League
  As an admin, I want to archive the current league and start a new one
  so that the competition can continue with a fresh slate.

  Background:
    Given I am logged in as admin
    And I am on the admin page

  # --- Unsaved Changes Guard ---

  # Scenario: Admin cannot start a new league with unsaved changes
  #   Given I have unsaved changes
  #   When I try to start a new league
  #   Then I should see the "Unsaved Changes Warning" dialog

  # Scenario: Admin saves changes and continues to new league when all matches are played
  #   Given target matches for the current league has been reached
  #   And I have unsaved changes
  #   When I try to start a new league
  #   And I click "Save & Continue"
  #   Then I should see the "Config" dialog

  # # --- Incomplete League Warning ---

  # Scenario: Admin is warned when league has not reached target matches
  #   Given the current league has played less matches than the target
  #   When I try to start a new league
  #   Then I should see the "League Incomplete" dialog

  # Scenario: Admin proceeds despite incomplete league
  #   Given the current league has played less matches than the target
  #   When I try to start a new league
  #   And I choose to proceed despite the warning
  #   Then I should see the "Config" dialog

  # # --- Validation ---

  # Scenario: Admin cannot proceed to confirmation without a league name
  #   Given target matches for the current league has been reached
  #   And I am on the config dialog
  #   When I leave the league name empty
  #   Then the "Next" button should be disabled

  # Scenario: Admin cannot proceed with only spaces as league name
  #   Given target matches for the current league has been reached
  #   And I am on the config dialog
  #   When I type "   " as the new league name
  #   Then the "Next" button should be disabled

  #  ─── Guards ───────────────────────────────────────────────────────────────

  Scenario: Admin cannot start a new league with fewer than 4 matches
    Given the current league has fewer than 4 matches played
    When I click the "Start New League"
    Then I should see the error toast "Cannot start new league: at least 4 matches required."
    And no dialog should open

  Scenario: Admin is blocked by unsaved changes
    Given the current league has at least 4 matches played
    And I have unsaved changes
    When I click the "Start New League"
    Then I should see the "Unsaved Changes Warning" dialog

  # Scenario: Admin dismisses the unsaved changes dialog
  #   Given the "Unsaved Changes" dialog is open
  #   When I click "OK"
  #   Then the dialog should close
  #   And I should remain on the admin page with my unsaved changes intact

  # Scenario: Admin saves and continues from the unsaved changes dialog
  #   Given the "Unsaved Changes" dialog is open
  #   And the league has reached its target match count
  #   When I click "Save & Continue"
  #   Then my changes should be saved to GitHub
  #   And the config dialog should open

  # Scenario: Admin saves and is shown the warning dialog when league is not complete
  #   Given the "Unsaved Changes" dialog is open
  #   And the current league has played fewer matches than the target
  #   When I click "Save & Continue"
  #   Then my changes should be saved to GitHub
  #   And the "League Not Complete" warning dialog should open

  # Scenario: Admin is warned when the league has not reached its target
  #   Given the current league has at least 4 matches
  #   And the number of played matches is less than the target
  #   And I have no unsaved changes
  #   When I click "Start New League"
  #   Then the "League Not Complete" warning dialog should appear
  #   And I should see the played vs target match count
  #   And I should see that target will be adjusted to the number of played matches

  # Scenario: Admin cancels the league-not-complete warning
  #   Given the "League Not Complete" warning dialog is open
  #   When I click "Cancel"
  #   Then the dialog should close
  #   And the current league should remain unchanged

  # Scenario: Admin proceeds past the league-not-complete warning
  #   Given the "League Not Complete" warning dialog is open
  #   When I click "Proceed"
  #   Then the config dialog should open

  # # ─── Config dialog ────────────────────────────────────────────────────────

  # Scenario: Config dialog opens directly when league has reached its target
  #   Given the current league has at least 4 matches
  #   And the number of played matches equals or exceeds the target
  #   And I have no unsaved changes
  #   When I click "Start New League"
  #   Then the config dialog should open

  # Scenario: Config dialog shows all required fields
  #   Given the config dialog is open
  #   Then I should see a "New League Name" input
  #   And I should see a "Target Matches" input defaulting to 50
  #   And I should see a "Min Squad Size per Team" input
  #   And I should see a "League Type" toggle with "With Scorers" and "Without Scorers"
  #   And I should see an "Archive Image" upload control
  #   And I should see a "Keep players (goals reset to 0)" checkbox checked by default

  # Scenario: Next button is disabled when league name is empty
  #   Given the config dialog is open
  #   When the "New League Name" field is empty
  #   Then the "Next" button should be disabled

  # Scenario: Next button is disabled when league name is whitespace only
  #   Given the config dialog is open
  #   When I type "   " in the "New League Name" field
  #   Then the "Next" button should be disabled

  # Scenario: Target matches cannot be set below 4
  #   Given the config dialog is open
  #   When I set "Target Matches" to 2
  #   Then the value should be adjusted to 4

  # Scenario: Admin selects "Without Scorers" league type
  #   Given the config dialog is open
  #   When I click "Without Scorers"
  #   Then "Without Scorers" should be highlighted as active

  # Scenario: Admin uploads an archive image
  #   Given the config dialog is open
  #   When I select a valid image file
  #   Then a preview thumbnail should appear
  #   And the upload button should show the filename

  # Scenario: Archive image is optional
  #   Given the config dialog is open
  #   And I have not selected an image
  #   When I enter a valid league name and click "Next"
  #   Then the confirm dialog should open without errors

  # Scenario: Admin unchecks "Keep players"
  #   Given the config dialog is open
  #   When I uncheck "Keep players (goals reset to 0)"
  #   Then the checkbox should be unchecked

  # Scenario: Admin cancels the config dialog
  #   Given the config dialog is open
  #   When I click "Cancel"
  #   Then the dialog should close
  #   And no league data should have changed

  # Scenario: Admin proceeds to the confirm dialog with valid config
  #   Given the config dialog is open
  #   When I enter "Summer League 2026" as the new league name
  #   And I set target matches to 30
  #   And I select "Without Scorers"
  #   And I click "Next"
  #   Then the confirm dialog should open

  # # ─── Confirm dialog ───────────────────────────────────────────────────────

  # Scenario: Confirm dialog shows a full summary
  #   Given the confirm dialog is open with name "Summer League 2026"
  #   Then I should see the current league name under "Archiving"
  #   And I should see the top-ranked team under "Winner"
  #   And I should see "Summer League 2026" under "New League Name"
  #   And I should see the chosen league type, target matches, min squad size, and keep players value

  # Scenario: Admin goes back from the confirm dialog to the config dialog
  #   Given the confirm dialog is open
  #   When I click "Back"
  #   Then the config dialog should open
  #   And my previously entered values should still be present

  # Scenario: Admin sees a loading state while archiving
  #   Given the confirm dialog is open
  #   When I click "Archive & Start New"
  #   Then I should see a spinner and "Archiving league and preparing new season..."
  #   And the action buttons should no longer be visible

  # # ─── Outcome ─────────────────────────────────────────────────────────────

  # Scenario: Archive succeeds and a new league is started
  #   Given the confirm dialog is open
  #   When I click "Archive & Start New"
  #   And the archive operation succeeds
  #   Then I should see a success toast
  #   And I should be redirected to the visitor page
  #   And the admin page should now reflect the new league with zero matches

  # Scenario: Archive fails and the current league is preserved
  #   Given the confirm dialog is open
  #   When I click "Archive & Start New"
  #   And the archive operation fails
  #   Then I should see an error toast
  #   And the current league data should remain unchanged

  # # ─── Archived Leagues page ────────────────────────────────────────────────

  # Scenario: Archived leagues page lists all past seasons
  #   Given I navigate to "/archived-leagues"
  #   Then I should see a card for each archived league
  #   And each card should show the league name, match count, champion, start date, and end date

  # Scenario: Archived leagues page shows empty state
  #   Given no leagues have been archived yet
  #   When I navigate to "/archived-leagues"
  #   Then I should see "No archived leagues yet."

  # Scenario: Clicking an archived league card navigates to its detail page
  #   Given I am on the archived leagues page
  #   When I click on an archived league card
  #   Then I should see the standings, match history, and top scorers for that season

  # Scenario: Archived league detail shows not-found for an invalid ID
  #   Given I navigate to "/archived-leagues/nonexistent-id"
  #   Then I should see "League not found"
  #   And I should see a link back to the archived leagues list