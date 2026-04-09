describe('Temporary Absence', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/temporary-absence');
    cy.url().should('include', '/temporary-absence');
    cy.getByTestId('temp-absence-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Seed data loads ───────────────────────────────────────────────────────
  it('loads seed temp absence record', () => {
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').should('have.length.greaterThan', 0);
    cy.get('.ant-table').contains('Trần Văn Hùng');
    cy.get('.ant-table').contains('TP. Hồ Chí Minh');
  });

  // ─── Status filter ─────────────────────────────────────────────────────────
  it('status filter works', () => {
    cy.get('input[placeholder="Trạng thái"]').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').filter(':contains("Đang tạm vắng")').click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Refresh ───────────────────────────────────────────────────────────────
  it('refresh button reloads list', () => {
    cy.get('button').filter(':contains("Làm mới")').first().click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Create temp absence ────────────────────────────────────────────────────
  it('creates a new temp absence registration', () => {
    cy.get('button').filter(':contains("Đăng ký tạm vắng")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Đăng ký tạm vắng');

    // Select person
    cy.get('.ant-modal .ant-select').filter(':has(input[placeholder*="Chọn"])').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').first().click();

    // Dates
    const dateInputs = cy.get('.ant-modal input[type="date"]');
    dateInputs.first().type('2026-05-01');
    dateInputs.last().type('2026-09-01');

    // Destination
    cy.get('.ant-modal').find('input[placeholder="Thành phố, Tỉnh..."]').type('Hà Nội');

    // Reason
    cy.get('.ant-modal').find('input[placeholder="Công tác, Du lịch..."]').type('Du lịch Cypress');

    cy.get('.ant-modal').find('button').filter(':contains("Đăng ký")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-modal').should('not.exist');
    cy.get('.ant-table').contains('Hà Nội');
  });

  // ─── Extend ────────────────────────────────────────────────────────────────
  it('extends a temp absence record', () => {
    const extendBtn = cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="gia hạn"]');

    extendBtn.then(($el) => {
      if ($el.is(':visible')) {
        extendBtn.click();
        cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
        cy.get('.ant-modal').contains('Gia hạn');
        cy.get('.ant-modal').find('input[type="date"]').type('2026-12-31');
        cy.get('.ant-modal').find('button').filter(':contains("Gia hạn")').click();
        cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
      }
    });
  });

  // ─── Cancel ────────────────────────────────────────────────────────────────
  it('cancels a temp absence registration', () => {
    const cancelBtn = cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="hủy"]');

    cancelBtn.then(($el) => {
      if ($el.is(':visible')) {
        cancelBtn.click();
        cy.get('.ant-popconfirm').should('be.visible', { timeout: 5_000 });
        cy.get('.ant-popconfirm').find('button').filter(':contains("Hủy bỏ")').click();
        cy.get('.ant-table').should('be.visible');
      }
    });
  });
});
