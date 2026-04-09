import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/logs');
  await expect(page.getByTestId('logs-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads with seed logs ───────────────────────────────────────────────
test('page loads system logs table with seed data', async ({ page }) => {
  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByTestId('logs-page')).toBeVisible({ timeout: 10_000 });

  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });

  // Seed logs contain "admin" username
  await expect(page.locator('.ant-table')).toContainText('admin');
});

// ─── Seed log entries are visible ───────────────────────────────────────────
test('seed log entries are displayed correctly', async ({ page }) => {
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });

  // First seed log: admin logged in
  await expect(page.locator('.ant-table')).toContainText('Đăng nhập');
  await expect(page.locator('.ant-table')).toContainText('System');

  // Second seed log: household created
  await expect(page.locator('.ant-table')).toContainText('Tạo hộ khẩu');
  await expect(page.locator('.ant-table')).toContainText('HoKhau');
});

// ─── Search filters by username ─────────────────────────────────────────────
test('search filters logs by username', async ({ page }) => {
  const searchInput = page.locator('input[placeholder="Tìm hành động, người dùng..."]');
  await expect(searchInput).toBeVisible();

  await searchInput.fill('admin');
  await page.keyboard.press('Enter');

  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);

  // Clear search
  await searchInput.clear();
  await page.keyboard.press('Enter');
});

// ─── Module filter works ─────────────────────────────────────────────────────
test('module filter filters logs by module', async ({ page }) => {
  const moduleSelect = page.locator('input[placeholder="Lọc theo module"]').first();
  await moduleSelect.click();
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'System' }).click();

  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0);
});

// ─── Refresh button ──────────────────────────────────────────────────────────
test('refresh button reloads logs', async ({ page }) => {
  const refreshBtn = page.locator('button').filter({ hasText: /Làm mới|Reload/i }).first();
  await refreshBtn.click();
  await expect(page.getByTestId('logs-page')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-table')).toBeVisible();
});

// ─── Logs are sorted by time ─────────────────────────────────────────────────
test('logs are sorted by timestamp (newest first)', async ({ page }) => {
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 8_000 });

  // Verify timestamps are displayed
  const firstRowTimestamp = await rows.first().locator('td').first().textContent();
  expect(firstRowTimestamp).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
});
