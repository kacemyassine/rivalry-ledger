import "./commands";

beforeEach(() => {
  cy.fixture("leagueData.json").then((data) => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    cy.intercept("HEAD", "https://api.github.com", { statusCode: 200 }).as(
      "checkOnline",
    );
    cy.intercept("GET", "https://api.github.com/**", {
      body: { content: encoded, sha: "abc123" },
    }).as("getLeagueData");
  });
  cy.intercept("PUT", "https://api.github.com/**", {
    statusCode: 200,
    body: { content: { sha: "fake-sha" } },
  }).as("putLeagueData");
});

Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver loop")) {
    return false;
  }
});
