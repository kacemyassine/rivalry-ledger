# Note : WSL stands for With Scorers League.
Feature: Match Updating and Deletion for WSL league Type.
    As an admin, I need to edit or delete a previously recorded match
    so that the match history and Players stats stay accurate.

    Background:
        Given The current league type is 'with-scorers'
        And I am logged in as admin
        And I am on the admin page
        And a match "3-2" with goal scorers exists:
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
    @RLQ-XX
    Scenario: Admin edits a match and player goal totals adjust accordingly
        Given I am updating the '3-2' with scorers match in 'with-scorers' league
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

    Scenario: Editing a match fails when scorer goals don't add up
        Given I am updating the '3-2' with scorers match in 'with-scorers' league
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
        When I change the scorer of the "home" team "Antoine-Griezmann" goals to 5
        And I click the submit button
        Then An error message telling goals don't add up should appear
        And the match should still appear in the match history with a score of "3-2"
        And each player's total goal count shouldn't change

Scenario: Admin changes a match's date normally
    Given I am updating the '3-2' with scorers match in 'with-scorers' league
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
    When I change the match date to "2026-02-10"
    Then the match should appear in the match history with the new date "2026-02-10"

Scenario: Admin cannot set a match date in the future
    Given I am updating the '3-2' with scorers match in 'with-scorers' league
            | team | player-name       | goals |
            | home | Antoine-Griezmann | 2     |
            | away | Ruud-Gullit       | 1     |
            | home | Kylian Mbappé     | 1     |
            | away | Didier Drogba     | 1     |
    When I change the match date to "2049-02-21"
    Then An error message telling the date cannot be in the future should appear
    And the match should still appear in the match history with a date of "2026-01-01"

Scenario: Admin deletes a match with scorers and player goal totals adjust accordingly
    Given I am deleting the '3-2' with scorers match in 'with-scorers' league
        | team | player-name       | goals |
        | home | Antoine-Griezmann | 2     |
        | away | Ruud-Gullit       | 1     |
        | home | Kylian Mbappé     | 1     |
        | away | Didier Drogba     | 1     |
    When I delete the match
    Then the match should no longer appear in the match history
    And each player's total goal count should decrease accordingly

@RLQ-XX
Scenario: Admin cancels a match deletion
    Given I am deleting the '3-2' with scorers match in 'with-scorers' league
        | team | player-name       | goals |
        | home | Antoine-Griezmann | 2     |
        | away | Ruud-Gullit       | 1     |
        | home | Kylian Mbappé     | 1     |
        | away | Didier Drogba     | 1     |
    And I try mistakenly to delete the match
    Then I should see the delete confirmation message
    When I cancel the deletion
    Then the match should still appear in the match history with a score of "3-2"
    And each player's total goal count shouldn't change







