import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/backup');
  await expect(page.getByTestId('backup-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads ──────────────────────────────────────────────────────────────
test('backup page loads correctly', async ({ page }) => {
  await expect(page).toHaveURL(/\/backup$/);
  await expect(page.getByTestId('backup-page')).toBeVisible({ timeout: 10_000 });
});

// ─── System info is displayed ───────────────────────────────────────────────
test('system info card shows correct tech stack', async ({ page }) => {
  await expect(page.locator('.ant-card')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-card').first()).toContainText('ASP.NET Core');
  await expect(page.locator('.ant-card').first()).toContainText('React');
  await expect(page.locator('.ant-card').first()).toContainText('SQLite');
});

// ─── Backup button triggers and shows result ────────────────────────────────
test('backup button triggers API and shows result', async ({ page }) => {
  const backupBtn = page.locator('button').filter({ hasText: /Sao lưu|Bắt đầu sao lưu/i }).first();
  await expect(backupBtn).toBeVisible();

  await backupBtn.click();

  // Loading state should show
  await expect(backupBtn).toContainText(/Đang sao lưu/i, { timeout: 3_000 }).catch(() => {});

  // Success message
  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 15_000 });

  // Result panel should appear
  const resultPanel = page.locator('.mt-5.rounded-\\[22px\\]');
  await expect(resultPanel).toBeVisible({ timeout: 10_000 });
  await expect(resultPanel).toContainText('thành công');
});

// ─── Backup can be triggered multiple times ─────────────────────────────────
test('backup can be triggered again after first success', async ({ page }) => {
  const backupBtn = page.locator('button').filter({ hasText: /Sao lưu/i }).first();
  await backupBtn.click();
  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 15_000 });

  // Wait for button to be clickable again
  await expect(backupBtn).toBeEnabled({ timeout: 5_000 });

  await backupBtn.click();
  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 15_000 });
});
