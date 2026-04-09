describe('Households', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/households');
    cy.url().should('include', '/households');
    cy.getByTestId('households-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Table loads seed data ─────────────────────────────────────────────────
  it('table shows seed households', () => {
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-table').contains('HK-001');
    cy.get('.ant-table').contains('Thôn 1, Xã An Thành');
    cy.get('.ant-table').contains('Nguyễn Văn Minh');
  });

  // ─── Search ────────────────────────────────────────────────────────────────
  it('search filters households', () => {
    cy.getByTestId('households-search-input').should('exist');
    cy.getByTestId('households-search-input').type('HK-001{enter}');
    cy.get('.ant-table').contains('HK-001');
    cy.getByTestId('households-search-input').clear().type('{enter}');
    cy.get('.ant-table').contains('HK-002');
  });

  // ─── Status filter ────────────────────────────────────────────────────────
  it('status filter filters by Active', () => {
    cy.get('input[placeholder="Trạng thái"]').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').filter(':contains("Hoạt động")').click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── Refresh ───────────────────────────────────────────────────────────────
  it('refresh button reloads list', () => {
    cy.get('button').filter(':contains("Làm mới")').first().click();
    cy.get('.ant-table').should('be.visible', { timeout: 8_000 });
  });

  // ─── View detail modal ─────────────────────────────────────────────────────
  it('opens household detail modal', () => {
    cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="chi tiết"]').click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Chi tiết');
    cy.get('.ant-modal').find('button').filter(':contains("Đóng")').click();
    cy.get('.ant-modal').should('not.exist');
  });

  // ─── Create household ───────────────────────────────────────────────────────
  it('creates a new household', () => {
    cy.get('button').filter(':contains("Thêm hộ khẩu")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Thêm hộ khẩu mới');

    cy.get('.ant-modal').find('input[placeholder="VD: HK-004"]').type('HK-CY-001');
    cy.get('.ant-modal').find('input[placeholder="Thôn, Xã, Huyện..."]').type('Thôn Test, Xã An Thành');

    // Select head person
    cy.get('.ant-modal .ant-select').filter(':has(input[placeholder*="Chọn"])').first().click();
    cy.get('.ant-select-dropdown .ant-select-item').first().click();

    cy.get('.ant-modal').find('button').filter(':contains("Thêm mới")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-message').invoke('text').should('include', 'thành công');

    cy.get('.ant-modal').should('not.exist');
    cy.get('.ant-table').contains('HK-CY-001');
  });

  // ─── Edit household ─────────────────────────────────────────────────────────
  it('edits an existing household', () => {
    cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="sửa"]').click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Sửa hộ khẩu');

    cy.get('.ant-modal').find('input[placeholder="Thôn, Xã, Huyện..."]').clear().type('Thôn 99, Xã Test');
    cy.get('.ant-modal').find('button').filter(':contains("Lưu")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
  });

  // ─── Delete confirmation ───────────────────────────────────────────────────
  it('delete confirmation can be cancelled', () => {
    const initialCount = cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').its('length');

    cy.get('.ant-table-tbody tr').first().find('button').filter('[title*="xóa"]').click();
    cy.get('.ant-modal-confirm').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal-confirm').contains('Xác nhận xóa');
    cy.get('.ant-modal-confirm').find('button').filter(':contains("Hủy")').click();
    cy.get('.ant-modal-confirm').should('not.exist');
    cy.get('.ant-table-tbody tr:not(.ant-table-placeholder)').its('length').should('eq', initialCount);
  });
});
