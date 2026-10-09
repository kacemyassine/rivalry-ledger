Feature: Admin Authentication
  As an admin, I need to log in and out of the admin panel,
  and visitors must not be able to reach admin features without authentication.

  Background:
    Given I am on the home page

  @RLQ-9
  Scenario: Admin logs in with the correct password
    When I open the admin login dialog
    And I enter the password "0217"
    And I submit the login form
    Then I should be redirected to the admin page

  @RLQ-9
  Scenario: Admin login fails with an incorrect password
    When I open the admin login dialog
    And I enter the password "wrongpass"
    And I submit the login form
    Then I should see the error message "Incorrect password"
    And I should still be on the home page

  @RLQ-10
  Scenario: Admin logs out from the admin page
    Given I am logged in as admin
    And I am on the admin page
    When I click the "Logout" button on the admin page
    Then I should be redirected to the home page

  @RLQ-11
  Scenario: Visitor cannot access the admin page directly without authentication
    When I visit the admin page directly without logging in
    Then I should be redirected to the home page

  Scenario: Admin sees warning message after multiple failed login attempts
  When I open the admin login dialog
  And I attempt to login with incorrect password 3 times
  Then I should see the error message "Too many attempts. Please slow down."
  And I should still be able to attempt login

Scenario: Admin is locked out after 5 failed login attempts
  When I open the admin login dialog
  When I attempt to login with incorrect password 5 times
  Then the submit button should be disabled