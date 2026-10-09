Feature: Archived Leagues

  Scenario: Archived leagues page shows empty state
    Given there are no archived leagues
    And I navigate to '/archived-leagues'
    Then I should see a message indicating that there are no archived leagues

  Scenario: Archived leagues page lists all past seasons
    Given there are two archived leagues available
    And I navigate to '/archived-leagues'
    Then I should see all archived leagues listed on the page

  Scenario: Clicking an archived league card navigates to its detail page
  Given there is a single archived league with the name "Test League"
  And I navigate to '/archived-leagues' 
  When I click on the archived league card for "Test League"
  Then I should be on the league detail page

Scenario: Archived league detail page displays all sections
  Given I am on an archived league detail page for "Test League"
  Then I should see the standings, match history, and top scorers sections

  Scenario: Archived league detail shows not-found for an invalid ID
  Given the requested archived league does not exist
  And I navigate to "/archived-leagues/nonexistent-id"
  Then I should see a "League not found" message with a link to return to archived leagues