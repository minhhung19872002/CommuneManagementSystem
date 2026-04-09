describe('Dashboard', () => {
  beforeEach(() => {
    cy.loginAsDemo();
  });

  // ─── Stat cards render ─────────────────────────────────────────────────────
  it('renders all dashboard stat cards with values', () => {
    cy.getByTestId('app-shell').should('be.visible');
    cy.getByTestId('topbar-user').invoke('text').should('match', /\S/);

    const statIds = [
      'dashboard-stat-total-population-value',
      'dashboard-stat-total-households-value',
      'dashboard-stat-alive-count-value',
      'dashboard-stat-male-count-value',
      'dashboard-stat-female-count-value',
      'dashboard-stat-dead-count-value',
      'dashboard-stat-moved-count-value',
      'dashboard-stat-temp-resident-count-value',
      'dashboard-stat-temp-absent-count-value',
    ];

    statIds.forEach((id) => {
      cy.getByTestId(id).should('be.visible').invoke('text').should('match', /\S/);
    });
  });

  // ─── Seed data: stats are real numbers ────────────────────────────────────
  it('stat values reflect seed data (8 persons)', () => {
    cy.getByTestId('dashboard-stat-total-population-value')
      .invoke('text')
      .then((t) => expect(Number(t.replace(/\D/g, ''))).to.be.greaterThan(0));
    cy.getByTestId('dashboard-stat-total-households-value')
      .invoke('text')
      .then((t) => expect(Number(t.replace(/\D/g, ''))).to.be.greaterThan(0));
  });

  // ─── Quick links navigate correctly ───────────────────────────────────────
  it('quick link to households works', () => {
    cy.get('a[href="/households"]').first().click();
    cy.url().should('include', '/households');
    cy.getByTestId('households-page').should('be.visible', { timeout: 8_000 });
  });

  it('quick link to persons works', () => {
    cy.get('a[href="/persons"]').first().click();
    cy.url().should('include', '/persons');
    cy.getByTestId('persons-page').should('be.visible', { timeout: 8_000 });
  });

  it('quick link to reports works', () => {
    cy.get('a[href="/reports"]').first().click();
    cy.url().should('include', '/reports');
    cy.getByTestId('reports-page').should('be.visible', { timeout: 8_000 });
  });

  // ─── Topbar user info ───────────────────────────────────────────────────────
  it('topbar shows current user info', () => {
    cy.getByTestId('topbar-user').should('be.visible');
    cy.getByTestId('topbar-user').invoke('text').should('match', /admin|Nguyễn Văn A/i);
  });

  // ─── Mobile navigation ─────────────────────────────────────────────────────
  it('mobile hamburger opens navigation', () => {
    cy.viewport('iphone-8');
    cy.getByTestId('topbar-mobile-menu').click();
    cy.getByTestId('nav-reports').should('be.visible', { timeout: 5_000 });
  });
});
