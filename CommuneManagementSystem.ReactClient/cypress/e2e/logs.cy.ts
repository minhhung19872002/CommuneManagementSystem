describe('System Logs', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/logs');
    cy.url().should('include', '/logs');
    cy.getByTestId('logs-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Seed logs load ────────────────────────────────────────────────────────
  it('loads system logs with seed data', () => {
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').should('have.length.greaterThan', 0);
    cy.get('.ant-table').contains('admin');
  });

  // ─── Seed log entries ──────────────────────────────────────────────────────
  it('shows seed log entries', () => {
    cy.get('.ant-table').contains('Đăng nhập');
    cy.get('.ant-table').contains('System');
    cy.get('.ant-table').contains('Tạo hộ khẩu');
    cy.get('.ant-table').contains('HoKhau');
  });

  // ─── Search ────────────────────────────────────────────────────────────────
  it('search filters logs by username', () => {
    cy.get('input[placeholder="Tìm hành động, người dùng..."]').type('admin{enter}');
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').should('have.length.greaterThan', 0);
    cy.get('input[placeholder="Tìm hành động, người dùng..."]').clear().type('{enter}');
  });

  // ─── Module filter ─────────────────────────────────────────────────────────
  it('module filter filters logs', () => {
    cy.get('input[placeholder="Lọc theo module"]').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').filter(':contains("System")').click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Refresh ────────────────────────────────────────────────────────────────
  it('refresh button reloads logs', () => {
    cy.get('button').filter(':contains("Làm mới")').first().click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Timestamps ────────────────────────────────────────────────────────────
  it('log timestamps are displayed', () => {
    cy.get('.ant-table-tbody tr').first().find('td').first().invoke('text').should('match', /\d/);
  });
});
