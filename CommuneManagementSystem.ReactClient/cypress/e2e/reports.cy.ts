describe('Reports', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/reports');
    cy.url().should('include', '/reports');
  });

  it('loads summary cards and report tabs', () => {
    cy.getByTestId('reports-summary-total-population').invoke('text').should('match', /\d/);
    cy.get('[data-testid="reports-table-households"] .ant-table-tbody tr:not(.ant-table-placeholder)').should(($rows) => {
      expect($rows.length).to.be.greaterThan(0);
    });

    cy.getByTestId('reports-tab-population').click();
    cy.get('[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)').should(($rows) => {
      expect($rows.length).to.be.greaterThan(0);
    });

    cy.getByTestId('reports-tab-temp-residence').click();
    cy.get('[data-testid="reports-table-temp-residence"] .ant-table-tbody tr:not(.ant-table-placeholder)').should(($rows) => {
      expect($rows.length).to.be.greaterThan(0);
    });
  });
});
