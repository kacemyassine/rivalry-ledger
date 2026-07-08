# WSL stands for With Scorers League.
Feature: Match recording for With Scorers League Type.

    Verify that matches can be recorded with goal scorers attributed to individual players, 
    edited, 
    and deleted, 
    ensuring scorer data and scores are persisted correctly.

Background: 
    Given I am logged in as admin
    And I am on the admin page
    And The current league type is 'with-scorers'

Scenario Outline: Enable record a match result with a final score and without scorers.
  When I record a match with a final score of "<score>"
  Then An error message telling goals don't add up should appear

  Examples:
    | score |
    | 5-4   |
    | 2-0   |

Scenario: Record a match with goal scorers
  When I set the score to "3-2"
  And I assign goals to scorers:
    | team | player-name | goals |
    | home | Antoine-Griezmann | 2     |
    | away | Ruud-Gullit | 2     |
    | home | Kylian Mbappé | 1 |
  And I record the match 
  Then the match should appear in the match history with corresponding scorers
  And each player's total goal count should reflect the updated values


Scenario: Cannot submit a match when scorer goals don't add up to the score
   When I set the score to "3-2"
  And I assign goals to scorers:
    | team | player-name | goals |
    | home | Antoine-Griezmann | 2     |
    | away | Ruud-Gullit | 2     |
  And I record the match 
  Then An error message telling goals don't add up should appear

Scenario: Record a match with a player scoring multiple times added as separate rows
  When I set the score to "3-2"
  And I assign goals to scorers:
    | team | player-name | goals |
    | home | Antoine-Griezmann | 1     |
    | home | Antoine-Griezmann | 1     |
    | home | Antoine-Griezmann | 1     |
    | away | Ruud-Gullit | 1     |
    | away | Ruud-Gullit | 1     |
  And I record the match
  Then the match should appear in the match history with corresponding scorers
  And each player's total goal count should reflect the updated values


Scenario: Record a match with a player scoring an own goal
  When I set the score to "4-2"
  And I assign goals to scorers:
    | team | player-name | goals | own-goal |
    | home | Antoine-Griezmann | 2     | false |
    | away | Ruud-Gullit | 2     | false |
    | away | Petr Čech | 1     | true  |
    | away | Petr Čech | 1     | true  |
  And I record the match
  Then the match should appear in the match history with corresponding scorers
  And each player's total goal count should reflect the updated values
  # Own goals don't add up to the player goals count .