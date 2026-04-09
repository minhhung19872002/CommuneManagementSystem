describe('Reports', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/reports');
    cy.url().should('include', '/reports');
    cy.getByTestId('reports-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Summary cards ─────────────────────────────────────────────────────────
  it('shows 4 summary statistic cards', () => {
    const summaryIds = [
      'reports-summary-total-population',
      'reports-summary-total-households',
      'reports-summary-temp-residence',
      'reports-summary-temp-absence',
    ];

    summaryIds.forEach((id) => {
      cy.getByTestId(id).should('be.visible');
      cy.get(`[data-testid="${id}"] .summary-card-value`).should('not.have.text', '—');
    });
  });

  // ─── Households tab ───────────────────────────────────────────────────────
  it('households tab loads table with seed data', () => {
    cy.getByTestId('reports-tab-households').should('be.visible');
    cy.get('[data-testid="reports-table-households"]').should('be.visible', { timeout: 8_000 });

    cy.get('[data-testid="reports-table-households"] .ant-table-tbody tr:not(.ant-table-placeholder)')
      .should('have.length.greaterThan', 0);

    cy.get('[data-testid="reports-table-households"]').contains('HK-001');
  });

  // ─── Population tab ────────────────────────────────────────────────────────
  it('population tab loads seed persons', () => {
    cy.getByTestId('reports-tab-population').click();
    cy.get('[data-testid="reports-table-population"]').should('be.visible', { timeout: 8_000 });

    cy.get('[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)')
      .should('have.length.greaterThan', 0);

    cy.get('[data-testid="reports-table-population"]').contains('Nguyễn Văn Minh');
  });

  // ─── Temp residence tab ────────────────────────────────────────────────────
  it('temp residence tab loads seed record', () => {
    cy.getByTestId('reports-tab-temp-residence').click();
    cy.get('[data-testid="reports-table-temp-residence"]').should('be.visible', { timeout: 8_000 });

    cy.get('[data-testid="reports-table-temp-residence"] .ant-table-tbody tr:not(.ant-table-placeholder)')
      .should('have.length.greaterThan', 0);

    cy.get('[data-testid="reports-table-temp-residence"]').contains('Trần Đức Anh');
  });

  // ─── Temp absence tab ──────────────────────────────────────────────────────
  it('temp absence tab loads seed record', () => {
    cy.getByTestId('reports-tab-temp-absence').click();
    cy.get('[data-testid="reports-table-temp-absence"]').should('be.visible', { timeout: 8_000 });

    cy.get('[data-testid="reports-table-temp-absence"] .ant-table-tbody tr:not(.ant-table-placeholder)')
      .should('have.length.greaterThan', 0);

    cy.get('[data-testid="reports-table-temp-absence"]').contains('Trần Văn Hùng');
  });

  // ─── Export JSON ───────────────────────────────────────────────────────────
  it('exports active report as JSON', () => {
    const downloads = Cypress.env('downloads') || [];
    cy.getByTestId('reports-export-json').click();
    // Success message appears
    cy.get('.ant-message').should('be.visible');
  });

  // ─── Refresh ───────────────────────────────────────────────────────────────
  it('refresh button reloads current tab data', () => {
    cy.getByTestId('reports-tab-population').click();
    cy.get('[data-testid="reports-table-population"]').should('be.visible', { timeout: 8_000 });

    const initialCount = cy.get('[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)').its('length');

    cy.getByTestId('reports-refresh').click();
    cy.get('[data-testid="reports-table-population"]').should('be.visible', { timeout: 8_000 });
  });
});
