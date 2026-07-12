Feature: Player Management
  As an admin, I need to add, edit, and delete players
  so that the squad roster stays accurate.

  Background:
    Given I am logged in as admin
    And I am on the admin page

  Scenario: Admin adds a new player
    When I add a new player with name "Test Player" to the "home" team
    Then The new 'home' team player 'Test Player' should appear in the players list

  Scenario: Admin cannot add a player without a name
    When I add a new player with name "" to the "home" team 
    Then I should see the form error "Player name is required."

  Scenario: Admin cannot add a player with a name shorter than 3 characters
  When I add a new player with name "AB" to the "home" team
  Then I should see the form error "Player name must be between 3 and 40 characters"

Scenario: Admin cannot add a player with a name that starts with a special character
  When I add a new player with name "-Invalid Name" to the "home" team
  Then I should see the form error "Player name must start and end with a letter"

Scenario: Admin cannot add a player with special characters in the name
  When I add a new player with name "Invalid@Name" to the "home" team
  Then I should see the form error "Player name must contain only letters, spaces, hyphens, and apostrophes"

Scenario: Admin cannot add a player with a name that already exists in the team
  When I add a new player with name "Antoine Griezmann" to the "home" team
  Then I should see the form error "Player with the same name already exists in the team"

  Scenario: Admin edits a player's name
    Given I am editing the "home" team player "Antoine Griezmann"
    When I edit the Player name to "Tony Griezmann"
    Then "Tony Griezmann" should appear in the players list

  Scenario: Admin edits a player's team when the player has no goals
    Given I am editing the "home" team player "Antoine Griezmann"
    When I edit the Player team to "away"
    Then "Antoine Griezmann" should appear under the "away" team

  Scenario: Admin cannot edit a player name to less than 3 characters
  Given I am editing the "home" team player "Antoine Griezmann"
  When I edit the Player name to "AB"
  Then I should see the form error "Player name must be between 3 and 40 characters"

Scenario: Admin cannot edit a player name starting with a special character
  Given I am editing the "home" team player "Antoine Griezmann"
  When I edit the Player name to "-Invalid Name"
  Then I should see the form error "Player name must start and end with a letter"

Scenario: Admin cannot edit a player name with special characters
  Given I am editing the "home" team player "Antoine Griezmann"
  When I edit the Player name to "Invalid@Name"
  Then I should see the form error "Player name must contain only letters, spaces, hyphens, and apostrophes"

Scenario: Admin cannot edit a player name to a name that already exists in the team
  Given I am editing the "home" team player "Antoine Griezmann"
  When I edit the Player name to "Kylian Mbappé"
  Then I should see the form error "Player with the same name already exists in the team"

  Scenario: Admin cannot delete a player with goals
    Then the delete button for the "home" team player "Antoine-Griezmann" should be disabled

  Scenario: Admin deletes a player with no goals
    When I delete the "away" team player "Ramy Bensebaini"
    Then "Ramy Bensebaini" should no longer appear in the players list

  Scenario: Admin cannot delete any player when team is at minimum squad size
  Then all delete buttons for the "home" team should be disabled