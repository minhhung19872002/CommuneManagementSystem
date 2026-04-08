describe('Dashboard shell', () => {
  it('shows the topbar user context and primary stats', () => {
    cy.loginAsDemo();
    cy.getByTestId('app-shell').should('be.visible');
    cy.getByTestId('topbar-user').invoke('text').should('match', /\S/);
    cy.getByTestId('dashboard-stat-total-population-value').invoke('text').should('match', /\d/);
    cy.getByTestId('dashboard-stat-total-households-value').invoke('text').should('match', /\d/);
    cy.getByTestId('dashboard-stat-temp-resident-count-value').invoke('text').should('match', /\d/);
  });

  it('opens the mobile menu and routes to reports', () => {
    cy.viewport('iphone-8');
    cy.loginAsDemo();
    cy.getByTestId('topbar-mobile-menu').click();
    cy.getByTestId('nav-reports').click();
    cy.url().should('include', '/reports');
    cy.getByTestId('reports-page').should('be.visible');
  });
});
