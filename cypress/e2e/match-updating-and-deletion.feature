Feature: Match Updating and Deletion
    As an admin, I need to edit or delete a previously recorded match
    so that the match history and player stats stay accurate.

    Background:
        Given I am logged in as admin
        And I am on the admin page
        And a match "3-2" with goal scorers exists:
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
        And a match "5-0" without goal scorers exists

    @RLQ-XX
    Scenario: Admin edits a match's score with no scorers
        Given I am updating the "5-0" with no scorers match
        When I update the match score to "4-1"
        Then the match should appear in the match history with a score of "4-1"

    @RLQ-XX
    Scenario: Admin edits a match and player goal totals adjust accordingly
        Given I am updating the "3-2" with scorers match
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
        When I set the old score to "4-2"
        And I change the scorer of the "home" team "Antoine-Griezmann" goals to 3
        And I submit the update
        Then the match should appear in the match history with updated scorers
    And each player's total goal count should reflect the updated values

@RLQ-XX
Scenario: Editing a match fails when scorer goals don't add up
    Given I am updating the "3-2" with scorers match
        | team | player-name       | goals |
        | home | Antoine-Griezmann | 2     |
        | away | Ruud-Gullit       | 1     |
        | home | Kylian Mbappé     | 1     |
        | away | Didier Drogba     | 1     |
    When I change the scorer of the "home" team "Antoine-Griezmann" goals to 5
    And I click the submit button
    Then An error message telling goals don't add up should appear
    And the match should still appear in the match history with a score of "3-2"

@RLQ-XX
Scenario: Admin cancels an edit without saving changes
    Given I am updating the "5-0" with no scorers match
    When I set the old score to "9-9"
    And I close the match form without saving
    Then the match should still appear in the match history with a score of "5-0"

Scenario: Admin changes a match's date normally
    Given I am updating the "5-0" with no scorers match
    When I change the match date to "2026-02-10"
    Then the match should appear in the match history with the new date "2026-02-10"

Scenario: Admin cannot set a match date in the future
    Given I am updating the "5-0" with no scorers match
    When I change the match date to "2049-02-21"
    Then An error message telling the date cannot be in the future should appear
    And the match should still appear in the match history with a date of "2026-03-18"

# @RLQ-XX
# Scenario: Admin deletes a match and stats are reversed
#     Given I am deleting the "5-0" match
#     When I delete the match
#     Then the match should no longer appear in the match history
#     And each scorer's total goal count should decrease accordingly

# @RLQ-XX
# Scenario: Admin cancels a match deletion
#     When I open the context menu for the match
#     And I click "Delete Match"
#     Then I should see the delete confirmation dialog
#     When I cancel the deletion
#     Then the match should still appear in the match history with a score of "3-2"