describe('Backup', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/backup');
    cy.url().should('include', '/backup');
    cy.getByTestId('backup-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Page loads ────────────────────────────────────────────────────────────
  it('backup page loads correctly', () => {
    cy.get('.ant-card').should('have.length.greaterThan', 0);
  });

  // ─── System info ───────────────────────────────────────────────────────────
  it('system info shows correct tech stack', () => {
    cy.get('.ant-card').first().contains('ASP.NET Core');
    cy.get('.ant-card').first().contains('React');
    cy.get('.ant-card').first().contains('SQLite');
  });

  // ─── Backup trigger ───────────────────────────────────────────────────────
  it('backup button triggers and shows result', () => {
    cy.get('button').filter(':contains("Sao lưu"), :contains("Bắt đầu")').first()
      .should('be.visible')
      .click();

    // Success message
    cy.get('.ant-message').should('be.visible', { timeout: 15_000 });
    cy.get('.ant-message').invoke('text').should('include', 'thành công');

    // Result panel
    cy.get('.mt-5').should('be.visible', { timeout: 10_000 });
    cy.get('.mt-5').contains('thành công');
  });

  // ─── Multiple triggers ────────────────────────────────────────────────────
  it('backup can be triggered again', () => {
    cy.get('button').filter(':contains("Sao lưu")').first().click();
    cy.get('.ant-message').should('include.text', 'thành công', { timeout: 15_000 });

    cy.get('button').filter(':contains("Sao lưu")').should('be.enabled');
    cy.get('button').filter(':contains("Sao lưu")').first().click();
    cy.get('.ant-message').should('include.text', 'thành công', { timeout: 15_000 });
  });
});
