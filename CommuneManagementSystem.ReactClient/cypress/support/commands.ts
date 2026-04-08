declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      loginAsDemo(username?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => cy.get(`[data-testid="${testId}"]`));

Cypress.Commands.add('loginAsDemo', (username = 'admin', password = '123') => {
  cy.visit('/login');
  cy.getByTestId('login-page').should('be.visible');

  if (username === 'admin' && password === '123') {
    cy.getByTestId('demo-account-admin').click();
  } else {
    cy.getByTestId('login-username').clear().type(username);
    cy.getByTestId('login-password').clear().type(password, { log: false });
  }

  cy.getByTestId('login-submit').click();
  cy.getByTestId('dashboard-page').should('be.visible');
});

export {};
