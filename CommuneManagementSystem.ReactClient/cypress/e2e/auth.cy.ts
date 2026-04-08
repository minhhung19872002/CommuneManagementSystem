describe('Authentication', () => {
  it('redirects guests to the login screen and signs in with the demo account', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.getByTestId('login-form').should('be.visible');

    cy.getByTestId('demo-account-admin').click();
    cy.getByTestId('login-submit').click();

    cy.getByTestId('dashboard-page').should('be.visible');
  });
});
