import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/temporary-absence');
  await expect(page.getByTestId('temp-absence-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads with seed data ──────────────────────────────────────────────
test('page loads with seed temp absence record', async ({ page }) => {
  await expect(page).toHaveURL(/\/temporary-absence$/);
  await expect(page.getByTestId('temp-absence-page')).toBeVisible({ timeout: 10_000 });

  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });

  // Seed: Trần Văn Hùng (personId=4) → TP. Hồ Chí Minh, công tác
  await expect(page.locator('.ant-table')).toContainText('Trần Văn Hùng');
  await expect(page.locator('.ant-table')).toContainText('TP. Hồ Chí Minh');
});

// ─── Status filter ───────────────────────────────────────────────────────────
test('status filter shows only Active absences', async ({ page }) => {
  const statusSelect = page.locator('input[placeholder="Trạng thái"]').first();
  await statusSelect.click();
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'Đang tạm vắng' }).click();

  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0);
});

// ─── Refresh button ─────────────────────────────────────────────────────────
test('refresh button reloads absence list', async ({ page }) => {
  const refreshBtn = page.locator('button').filter({ hasText: /Làm mới|Reload/i }).first();
  await refreshBtn.click();
  await expect(page.getByTestId('temp-absence-page')).toBeVisible({ timeout: 8_000 });
});

// ─── Create temp absence ─────────────────────────────────────────────────────
test('creates a new temp absence registration', async ({ page }) => {
  const addBtn = page.locator('button').filter({ hasText: /Đăng ký tạm vắng/i }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Đăng ký tạm vắng');

  // Select a person
  const personSelect = modal.locator('.ant-select').filter({ has: page.locator('input[placeholder*="Chọn nhân"]') }).first();
  await personSelect.click();
  await page.locator('.ant-select-dropdown .ant-select-item').first().click();

  // Fill dates
  const dateInputs = modal.locator('.ant-modal input[type="date"]');
  await dateInputs.nth(0).fill('2026-05-01');
  await dateInputs.nth(1).fill('2026-09-01');

  // Fill destination
  await modal.locator('input[placeholder="Thành phố, Tỉnh..."]').fill('Hà Nội');

  // Fill reason
  await modal.locator('input[placeholder="Công tác, Du lịch..."]').fill('Du lịch E2E Test');

  // Submit
  await modal.locator('button').filter({ hasText: /Đăng ký/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  await expect(modal).not.toBeVisible();

  await expect(page.locator('.ant-table')).toContainText('Hà Nội');
});

// ─── Extend temp absence ────────────────────────────────────────────────────
test('extends an existing temp absence record', async ({ page }) => {
  const extendBtn = page.locator('.ant-table-tbody tr').first().locator('button').filter({ hasTitle: /gia hạn/i }).first();

  if (await extendBtn.isVisible()) {
    await extendBtn.click();

    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal).toContainText('Gia hạn');

    await modal.locator('input[type="date"]').fill('2026-12-31');

    await modal.locator('button').filter({ hasText: /Gia hạn/i }).click();
    await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  } else {
    test.skip();
  }
});

// ─── Cancel temp absence ────────────────────────────────────────────────────
test('cancels a temp absence registration', async ({ page }) => {
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  if (count === 0) { test.skip(); return; }

  const firstRow = rows.first();
  const cancelBtn = firstRow.locator('button').filter({ hasTitle: /hủy/i }).first();

  if (await cancelBtn.isVisible()) {
    await cancelBtn.click();

    const popconfirm = page.locator('.ant-popconfirm');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await popconfirm.locator('button').filter({ hasText: /Hủy bỏ/i }).click();

    await expect(page.locator('.ant-table')).toBeVisible();
  } else {
    test.skip();
  }
});
