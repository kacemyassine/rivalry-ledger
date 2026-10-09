import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { Navbar } from "../../support/POM/components/navbar";

const navbar = new Navbar();

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
  navbar.openAdminLoginDialog();
});

When("I enter the password {string}", (password: string) => {
  navbar.adminLoginDialog.typePassword(password);
});

When("I submit the login form", () => {
  navbar.adminLoginDialog.submit();
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
  navbar.adminLoginDialog.getErrorMessage().should("contain.text", message);
});

When('I attempt to login with incorrect password {int} times', (count: number) => {
  for (let i = 0; i < count; i++) {
    navbar.adminLoginDialog.typePassword("wrongpass");
    navbar.adminLoginDialog.submit();
  }
});

Then('I should still be able to attempt login', () => {
  navbar.adminLoginDialog.getErrorMessage().should("be.visible");
  navbar.adminLoginDialog.assertSubmitButtonIs("enabled");

});

Then('the submit button should be disabled', () => {
  navbar.adminLoginDialog.assertSubmitButtonIs("disabled");
});