describe('Persons', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/persons');
    cy.url().should('include', '/persons');
    cy.getByTestId('persons-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Table loads seed data ─────────────────────────────────────────────────
  it('table shows seed persons', () => {
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-table').contains('Nguyễn Văn Minh');
    cy.get('.ant-table').contains('Nguyễn Thị Lan');
    cy.get('.ant-table').contains('Trần Văn Hùng');
  });

  // ─── Search ────────────────────────────────────────────────────────────────
  it('search filters by name', () => {
    cy.get('input[placeholder="Tìm tên, CCCD..."]').type('Nguyễn Văn Minh{enter}');
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').should('have.length', 1);
    cy.get('.ant-table').contains('Nguyễn Văn Minh');
  });

  // ─── Status filter ────────────────────────────────────────────────────────
  it('status filter works', () => {
    cy.get('input[placeholder="Trạng thái"]').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').filter(':contains("Đang sống")').click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── View detail modal ────────────────────────────────────────────────────
  it('opens person detail modal', () => {
    cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="chi tiết"]').click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').find('button').filter(':contains("Đóng")').click();
    cy.get('.ant-modal').should('not.exist');
  });

  // ─── Create person ─────────────────────────────────────────────────────────
  it('creates a new person', () => {
    cy.get('button').filter(':contains("Thêm nhân khẩu")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Thêm nhân khẩu mới');

    cy.get('.ant-modal').find('input[placeholder="Nguyễn Văn A"]').type('Test Person Cypress');
    cy.get('.ant-modal').find('input[type="date"]').first().type('2000-01-15');

    cy.get('.ant-modal').find('button').filter(':contains("Thêm mới")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-modal').should('not.exist');
    cy.get('.ant-table').contains('Test Person Cypress');
  });

  // ─── Edit person ───────────────────────────────────────────────────────────
  it('edits an existing person', () => {
    cy.get('.ant-table-tbody tr').filter(':has(td:contains("Nguyễn Thị Lan"))')
      .find('button').filter('[title*="sửa"]').click();

    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Sửa nhân khẩu');

    cy.get('.ant-modal').find('input[placeholder="Nông dân, Công nhân..."]').clear().type('Nội trợ (CY)');
    cy.get('.ant-modal').find('button').filter(':contains("Lưu")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
  });

  // ─── Birth registration modal ─────────────────────────────────────────────
  it('opens and cancels birth registration', () => {
    cy.get('button').filter(':contains("Khai sinh")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Khai sinh');
    cy.get('.ant-modal').find('.ant-tabs-tab').filter(':contains("Khai tử")').click();
    cy.get('.ant-modal').contains('Khai tử');
    cy.get('.ant-modal').find('button').filter(':contains("Đóng")').first().click();
    cy.get('.ant-modal').should('not.exist');
  });

  // ─── Full birth registration ───────────────────────────────────────────────
  it('completes birth registration', () => {
    cy.get('button').filter(':contains("Khai sinh")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });

    cy.get('.ant-modal').find('input[placeholder="Tên trẻ"]').type('Em Bé Cypress');
    cy.get('.ant-modal').find('input[type="date"]').first().type('2024-06-15');

    cy.get('.ant-modal').find('button').filter(':contains("Đăng ký")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-modal').should('not.exist');
    cy.get('.ant-table').contains('Em Bé Cypress');
  });
});
