describe('Users', () => {
  beforeEach(() => {
    cy.loginAsDemo();
    cy.visit('/users');
    cy.url().should('include', '/users');
    cy.getByTestId('users-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Seed users load ───────────────────────────────────────────────────────
  it('loads seed user cards', () => {
    cy.get('.ant-card').should('have.length.greaterThan', 0);
    cy.get('body').contains('admin');
    cy.get('body').contains('Nguyễn Văn A');
    cy.get('body').contains('Quản trị viên');
  });

  // ─── Create user ───────────────────────────────────────────────────────────
  it('creates a new user', () => {
    cy.get('button').filter(':contains("Thêm người dùng")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-modal').contains('Thêm người dùng mới');

    cy.get('.ant-modal').find('input[placeholder="Tên đăng nhập"]').type('cypress_user');
    cy.get('.ant-modal').find('input[placeholder="Mật khẩu"]').type('cy1234');
    cy.get('.ant-modal').find('input[placeholder="Họ và tên đầy đủ"]').type('Người Dùng Cypress');

    cy.get('.ant-modal').find('button').filter(':contains("Thêm mới")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-modal').should('not.exist');
    cy.get('body').contains('cypress_user');
    cy.get('body').contains('Người Dùng Cypress');
  });

  // ─── Validation ────────────────────────────────────────────────────────────
  it('shows validation errors for empty fields', () => {
    cy.get('button').filter(':contains("Thêm người dùng")').first().click();
    cy.get('.ant-modal').should('be.visible', { timeout: 5_000 });

    cy.get('.ant-modal').find('button').filter(':contains("Thêm mới")').click();
    cy.get('.ant-form-item-explain-error').should('have.length.greaterThan', 0);

    cy.get('.ant-modal .ant-modal-close').click();
  });

  // ─── Toggle lock ───────────────────────────────────────────────────────────
  it('lock/unlock toggles user status', () => {
    const lockBtn = cy.get('.ant-card').first().find('button').filter(':contains("Khóa"), :contains("Mở")').first();

    lockBtn.should('be.visible');
    lockBtn.click();
    cy.get('.ant-popconfirm').should('be.visible', { timeout: 5_000 });
    cy.get('.ant-popconfirm').find('button').filter(':contains("Xác nhận")').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
  });

  // ─── Delete user ───────────────────────────────────────────────────────────
  it('deletes the test user', () => {
    cy.get('.ant-card').filter(':contains("cypress_user")').then(($card) => {
      if ($card.length > 0) {
        $card.find('button').filter(':contains("Xóa")').click();
        cy.get('.ant-popconfirm').should('be.visible', { timeout: 5_000 });
        cy.get('.ant-popconfirm').find('button').filter(':contains("Xóa")').click();
        cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
        cy.get('body').should('not.include.text', 'cypress_user');
      }
    });
  });
});
