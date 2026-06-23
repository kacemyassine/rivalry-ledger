/// <reference types="cypress" />

Cypress.Commands.add("loginAsAdmin", () => {
  const token = `admin_${Date.now()}_${crypto.randomUUID()}`;
  cy.window().then((win) => {
    win.sessionStorage.setItem("atlantis_admin_token", token);
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable<void>;
    }
  }
}