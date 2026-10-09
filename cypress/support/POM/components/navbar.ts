export class Navbar {
  private getNavbar() {
    return cy.get('[data-testid="navbar-component"]');
  }

  getAdminLoginDialog() {
    return cy.get('[data-testid="admin-login-dialog"]');
  }

  openAdminLoginDialog() {
    this.getNavbar().find('[data-testid="admin-button"]').click();
  }

  adminLoginDialog = {
    typePassword: (password: string) => {
      this.getAdminLoginDialog().find("input").type(password);
    },
    submit: () => {
      this.getAdminLoginDialog().contains("button", "Enter").click();
    },

    getErrorMessage: () => {
      return this.getAdminLoginDialog().find('[data-testid="password-error"]');
    },
    assertSubmitButtonIs: (state: "enabled" | "disabled") => {
      this.getAdminLoginDialog()
        .find('[data-testid="admin-submit-button"]')
        .should(state === "enabled" ? "not.be.disabled" : "be.disabled");
    },
  };
}
