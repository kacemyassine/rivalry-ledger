import "./commands";

beforeEach(() => {
  cy.fixture("leagueData.json").then((data) => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    cy.intercept("GET", "https://api.github.com/repos/*/contents/*", {
      body: { content: encoded, sha: "abc123" },
    }).as("getLeagueData");
  });
});
