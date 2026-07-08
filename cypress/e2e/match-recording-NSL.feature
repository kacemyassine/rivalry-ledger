# NSL in the name stands for Non Scorers League.
Feature: Match Recording for Non Scorers League Type
      Verify that matches can be recorded,
      edited,
      and deleted in a league where goals and scorers are not tracked,
      ensuring score-only results are persisted correctly.
  Background:
    Given The current league type is 'without-scorers'
    And I am logged in as admin
    And I am on the admin page

  Scenario Outline: Successfully record a match result with a final score and without scorers.
  When I record a match with a final score of "<score>"
  Then the match should appear in the match history with no scorers

  Examples:
    | score |
    | 5-4   |
    | 2-0   |
    | 0-0   |

Scenario: Record a match with goal scorers
  When I set the score to "3-2"
  And I assign goals to scorers:
    | team | player-name | goals |
    | home | Antoine-Griezmann | 2     |
    | away | Ruud-Gullit | 2     |
    | home | Kylian Mbappé | 1 |
  And I record the match 
  Then the match should appear in the match history with corresponding scorers


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
  