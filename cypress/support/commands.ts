/// <reference types="cypress" />

Cypress.Commands.add("loginAsAdmin", () => {
  const token = `admin_${Date.now()}_${crypto.randomUUID()}`;
  cy.visit("/");
  cy.window().then((win) => {
    win.sessionStorage.setItem("atlantis_admin_token", token);
  });
  cy.visit("/admin");
  cy.url().should("include", "/admin");
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAsAdmin(): Chainable;
    }
  }
}

export {};