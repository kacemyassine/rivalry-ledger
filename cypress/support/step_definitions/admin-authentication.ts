import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the home page", () => {
  cy.visit("/");
});

Given("I am logged in as admin", () => {
  cy.loginAsAdmin();
});

Given("I am on the admin page", () => {
  cy.visit("/admin");
});

When("I open the admin login dialog", () => {
  cy.contains("button", "Admin").click();
});

When("I enter the password {string}", (password: string) => {
  cy.get('input[type="password"]').clear().type(password);
});

When("I submit the login form", () => {
  cy.contains("button", "Enter").click();
});

When("I click the {string} button", (label: string) => {
  cy.contains("button", label).click();
});

When("I visit the admin page directly without logging in", () => {
  cy.visit("/admin");
});

Then("I should be redirected to the admin page", () => {
  cy.url().should("include", "/admin");
});

Then("I should be redirected to the home page", () => {
  cy.url().should("eq", `${Cypress.config().baseUrl}/`);
});

Then("I should still be on the home page", () => {
  cy.url().should("eq", `${Cypress.config().baseUrl}/`);
});

Then("I should see the error message {string}", (message: string) => {
  cy.get('[data-testid="password-error"]').should("contain.text", message);
});