import { expect, test } from './support/commands';
import { demoCredentials } from './support/commands';

// ─── Guest: redirects to login ───────────────────────────────────────────────
test('guest is redirected to /login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('login-page')).toBeVisible();
  await expect(page.getByTestId('login-form')).toBeVisible();
});

// ─── Login with demo fill ────────────────────────────────────────────────────
test('fills demo admin and logs in successfully', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  // fields should be pre-filled
  const usernameInput = page.getByTestId('login-username');
  const passwordInput = page.getByTestId('login-password');
  await expect(usernameInput).toHaveValue('admin');
  await expect(passwordInput).toHaveValue('123');

  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/$/);
});

// ─── Login with manual credentials ─────────────────────────────────────────
test('manual credentials login works', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('123');
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Login with wrong password ───────────────────────────────────────────────
test('wrong password shows error message', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-username').fill('admin');
  await page.getByTestId('login-password').fill('wrongpassword');
  await page.getByTestId('login-submit').click();

  // Ant Design message.error — appears as an ant-message div
  await expect(page.locator('.ant-message')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-message')).toContainText(/không đúng|mật khẩu|sai/i);
});

// ─── Login with non-existent user ───────────────────────────────────────────
test('non-existent user shows error message', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-username').fill('nobody123');
  await page.getByTestId('login-password').fill('123456');
  await page.getByTestId('login-submit').click();

  await expect(page.locator('.ant-message')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-message')).toContainText(/không đúng|sai|tài khoản/i);
});

// ─── Session persists on refresh ────────────────────────────────────────────
test('session persists after page reload', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });

  // Reload
  await page.reload();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });
  await expect(page).not.toHaveURL(/\/login$/);
});

// ─── Logout works ───────────────────────────────────────────────────────────
test('logout button navigates to login', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });

  // Logout (use .first() — logout appears in both desktop sidebar and mobile sidebar)
  await page.getByTestId('logout-button').first().click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 8_000 });
  await expect(page.getByTestId('login-page')).toBeVisible();
});

// ─── Navigation items visible after login ───────────────────────────────────
test('all main nav items are visible for admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });

  // Desktop sidebar (each nav item appears twice: desktop sidebar + mobile sidebar)
  await expect(page.getByTestId('nav-dashboard').first()).toBeVisible();
  await expect(page.getByTestId('nav-households').first()).toBeVisible();
  await expect(page.getByTestId('nav-persons').first()).toBeVisible();
  await expect(page.getByTestId('nav-reports').first()).toBeVisible();
  await expect(page.getByTestId('nav-users').first()).toBeVisible();
  await expect(page.getByTestId('nav-logs').first()).toBeVisible();
  await expect(page.getByTestId('nav-backup').first()).toBeVisible();
});

// ─── Navigates to each page after login ─────────────────────────────────────
test('navigates to households page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });
  await page.getByTestId('nav-households').first().click();
  await expect(page).toHaveURL(/\/households$/);
  await expect(page.getByTestId('households-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to persons page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-persons').first().click();
  await expect(page).toHaveURL(/\/persons$/);
  await expect(page.getByTestId('persons-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to reports page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-reports').first().click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByTestId('reports-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to users page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-users').first().click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByTestId('users-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to logs page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-logs').first().click();
  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByTestId('logs-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to backup page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-backup').first().click();
  await expect(page).toHaveURL(/\/backup$/);
  await expect(page.getByTestId('backup-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to temporary-residence page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-temp-residence').first().click();
  await expect(page).toHaveURL(/\/temporary-residence$/);
  await expect(page.getByTestId('temp-residence-page')).toBeVisible({ timeout: 8_000 });
});

test('navigates to temporary-absence page', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('demo-account-admin').click();
  await page.getByTestId('login-submit').click();
  await page.getByTestId('nav-temp-absence').first().click();
  await expect(page).toHaveURL(/\/temporary-absence$/);
  await expect(page.getByTestId('temp-absence-page')).toBeVisible({ timeout: 8_000 });
});
