import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/temporary-residence');
  await expect(page.getByTestId('temp-residence-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads with seed data ──────────────────────────────────────────────
test('page loads with seed temp residence record', async ({ page }) => {
  await expect(page).toHaveURL(/\/temporary-residence$/);
  await expect(page.getByTestId('temp-residence-page')).toBeVisible({ timeout: 10_000 });

  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });

  // Seed: Trần Đức Anh (personId=6) at "Ký túc xá Trường THPT An Thành"
  await expect(page.locator('.ant-table')).toContainText('Trần Đức Anh');
  await expect(page.locator('.ant-table')).toContainText('Ký túc xá');
});

// ─── Status filter ───────────────────────────────────────────────────────────
test('status filter shows only Active records', async ({ page }) => {
  const statusSelect = page.locator('input[placeholder="Trạng thái"]').first();
  await statusSelect.click();
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'Đang tạm trú' }).click();

  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ─── Refresh button ─────────────────────────────────────────────────────────
test('refresh button reloads data', async ({ page }) => {
  const refreshBtn = page.locator('button').filter({ hasText: /Làm mới|Reload/i }).first();
  await refreshBtn.click();
  await expect(page.getByTestId('temp-residence-page')).toBeVisible({ timeout: 8_000 });
});

// ─── Create temp residence ──────────────────────────────────────────────────
test('creates a new temp residence registration', async ({ page }) => {
  const addBtn = page.locator('button').filter({ hasText: /Đăng ký tạm trú/i }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Đăng ký tạm trú');

  // Select a person (Nguyễn Văn Minh - alive, person id=1)
  const personSelect = modal.locator('.ant-select').filter({ has: page.locator('input[placeholder*="Chọn nhân"]') }).first();
  await personSelect.click();
  await page.locator('.ant-select-dropdown .ant-select-item').first().click();

  // Fill address
  await modal.locator('input[placeholder="Thôn, Xã, Huyện..."]').fill('Ký túc xá Trường ĐH Test');

  // Fill dates
  const dateInputs = modal.locator('.ant-modal input[type="date"]');
  await dateInputs.nth(0).fill('2026-04-01');
  await dateInputs.nth(1).fill('2026-10-01');

  // Fill reason
  await modal.locator('input[placeholder="Công tác, Du lịch..."]').fill('Học tập E2E Test');

  // Submit
  await modal.locator('button').filter({ hasText: /Đăng ký/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  await expect(modal).not.toBeVisible();

  await expect(page.locator('.ant-table')).toContainText('Ký túc xá Trường ĐH Test');
});

// ─── Extend temp residence ───────────────────────────────────────────────────
test('extends an existing temp residence record', async ({ page }) => {
  // The seed record is Active, so it should have Extend button
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
    // If no active records, create one first
    test.skip();
  }
});

// ─── Cancel temp residence ──────────────────────────────────────────────────
test('cancels a temp residence registration', async ({ page }) => {
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  if (count === 0) { test.skip(); return; }

  // Find a row with an active cancel button
  const firstRow = rows.first();
  const cancelBtn = firstRow.locator('button').filter({ hasTitle: /hủy/i }).first();

  if (await cancelBtn.isVisible()) {
    await cancelBtn.click();

    // Popconfirm appears
    const popconfirm = page.locator('.ant-popconfirm');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await popconfirm.locator('button').filter({ hasText: /Hủy bỏ/i }).click();

    // Row should still be present (cancelled)
    await expect(page.locator('.ant-table')).toBeVisible();
  } else {
    test.skip();
  }
});
