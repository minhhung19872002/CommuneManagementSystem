describe('Authentication', () => {
  // ─── Guest: redirects to login ─────────────────────────────────────────────
  it('redirects guest to /login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.getByTestId('login-page').should('be.visible');
    cy.getByTestId('login-form').should('be.visible');
  });

  // ─── Demo fill + submit ───────────────────────────────────────────────────
  it('fills demo admin and logs in successfully', () => {
    cy.visit('/login');
    cy.getByTestId('demo-account-admin').click();
    cy.getByTestId('login-username').should('have.value', 'admin');
    cy.getByTestId('login-password').should('have.value', '123');
    cy.getByTestId('login-submit').click();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });
    cy.url().should('match', /\/(login|$)$/);
  });

  // ─── Manual credentials ───────────────────────────────────────────────────
  it('manual credentials login works', () => {
    cy.visit('/login');
    cy.getByTestId('login-username').type('admin');
    cy.getByTestId('login-password').type('123');
    cy.getByTestId('login-submit').click();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });
  });

  // ─── Wrong password shows error ───────────────────────────────────────────
  it('wrong password shows error message', () => {
    cy.visit('/login');
    cy.getByTestId('login-username').type('admin');
    cy.getByTestId('login-password').type('wrongpassword');
    cy.getByTestId('login-submit').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
    cy.get('.ant-message').invoke('text').should('match', /không đúng|mật khẩu|sai/i);
  });

  // ─── Non-existent user shows error ─────────────────────────────────────────
  it('non-existent user shows error message', () => {
    cy.visit('/login');
    cy.getByTestId('login-username').type('nobody123');
    cy.getByTestId('login-password').type('123456');
    cy.getByTestId('login-submit').click();
    cy.get('.ant-message').should('be.visible', { timeout: 8_000 });
  });

  // ─── Session persists after reload ────────────────────────────────────────
  it('session persists after page reload', () => {
    cy.visit('/login');
    cy.getByTestId('demo-account-admin').click();
    cy.getByTestId('login-submit').click();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });
    cy.reload();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });
    cy.url().should('not.include', '/login');
  });

  // ─── Logout works ─────────────────────────────────────────────────────────
  it('logout navigates to login', () => {
    cy.visit('/login');
    cy.getByTestId('demo-account-admin').click();
    cy.getByTestId('login-submit').click();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });
    cy.getByTestId('logout-button').click();
    cy.url().should('include', '/login', { timeout: 8_000 });
    cy.getByTestId('login-page').should('be.visible');
  });

  // ─── All nav items visible for admin ─────────────────────────────────────
  it('all main nav items are visible after login', () => {
    cy.visit('/login');
    cy.getByTestId('demo-account-admin').click();
    cy.getByTestId('login-submit').click();
    cy.getByTestId('dashboard-page').should('be.visible', { timeout: 10_000 });

    cy.getByTestId('nav-dashboard').should('be.visible');
    cy.getByTestId('nav-households').should('be.visible');
    cy.getByTestId('nav-persons').should('be.visible');
    cy.getByTestId('nav-reports').should('be.visible');
    cy.getByTestId('nav-users').should('be.visible');
    cy.getByTestId('nav-logs').should('be.visible');
    cy.getByTestId('nav-backup').should('be.visible');
  });

  // ─── Navigation to each page ─────────────────────────────────────────────
  it('navigates to households page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-households').click();
    cy.url().should('include', '/households');
    cy.getByTestId('households-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to persons page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-persons').click();
    cy.url().should('include', '/persons');
    cy.getByTestId('persons-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to reports page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-reports').click();
    cy.url().should('include', '/reports');
    cy.getByTestId('reports-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to users page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-users').click();
    cy.url().should('include', '/users');
    cy.getByTestId('users-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to logs page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-logs').click();
    cy.url().should('include', '/logs');
    cy.getByTestId('logs-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to backup page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-backup').click();
    cy.url().should('include', '/backup');
    cy.getByTestId('backup-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to temporary-residence page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-temp-residence').click();
    cy.url().should('include', '/temporary-residence');
    cy.getByTestId('temp-residence-page').should('be.visible', { timeout: 8_000 });
  });

  it('navigates to temporary-absence page', () => {
    cy.loginAsDemo();
    cy.getByTestId('nav-temp-absence').click();
    cy.url().should('include', '/temporary-absence');
    cy.getByTestId('temp-absence-page').should('be.visible', { timeout: 8_000 });
  });
});
