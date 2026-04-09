describe('Temporary Residence', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/temporary-residence');
    cy.url().should('include', '/temporary-residence');
    cy.getByTestId('temp-residence-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Seed data loads ───────────────────────────────────────────────────────
  it('loads seed temp residence record', () => {
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').should('have.length.greaterThan', 0);
    cy.get('.ant-table').contains('Trần Đức Anh');
    cy.get('.ant-table').contains('Ký túc xá');
  });

  // ─── Status filter ─────────────────────────────────────────────────────────
  it('status filter works', () => {
    cy.get('input[placeholder="Trạng thái"]').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').filter(':contains("Đang tạm trú")').click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Refresh ───────────────────────────────────────────────────────────────
  it('refresh button reloads list', () => {
    cy.get('button').filter(':contains("Làm mới")').first().click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Create temp residence ────────────────────────────────────────────────
  it('creates a new temp residence registration', () => {
    cy.get('button').filter(':contains("Đăng ký tạm trú")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Đăng ký tạm trú');

    // Select person
    cy.get('.ant-modal .ant-select').filter(':has(input[placeholder*="Chọn"])').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').first().click();

    // Fill address
    cy.get('.ant-modal').find('input[placeholder="Thôn, Xã, Huyện..."]').type('Ký túc xá Trường ĐH Cypress');

    // Dates
    const dateInputs = cy.get('.ant-modal input[type="date"]');
    dateInputs.first().type('2026-04-01');
    dateInputs.last().type('2026-10-01');

    // Reason
    cy.get('.ant-modal').find('input[placeholder="Công tác, Du lịch..."]').type('Học tập Cypress');

    cy.get('.ant-modal').find('button').filter(':contains("Đăng ký")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-modal').should('not.exist');
    cy.get('.ant-table').contains('Ký túc xá Trường ĐH Cypress');
  });

  // ─── Extend ────────────────────────────────────────────────────────────────
  it('extends a temp residence record', () => {
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
  it('cancels a temp residence registration', () => {
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
