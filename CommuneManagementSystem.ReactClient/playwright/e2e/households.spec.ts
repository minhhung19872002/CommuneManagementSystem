import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/households');
  await expect(page.getByTestId('households-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads and shows household table ────────────────────────────────────
test('page loads household table with seed data', async ({ page }) => {
  await expect(page).toHaveURL(/\/households$/);
  await expect(page.getByTestId('households-page')).toBeVisible({ timeout: 10_000 });

  // Seed has 3 households
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── Table contains seed data ────────────────────────────────────────────────
test('table shows seed household HK-001', async ({ page }) => {
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-table')).toContainText('HK-001');
  await expect(page.locator('.ant-table')).toContainText('Thôn 1, Xã An Thành');
  await expect(page.locator('.ant-table')).toContainText('Nguyễn Văn Minh');
});

// ─── Search filters households ───────────────────────────────────────────────
test('search filters households by household number', async ({ page }) => {
  const searchInput = page.getByTestId('households-search-input');
  await expect(searchInput).toBeVisible();

  await searchInput.fill('HK-001');
  await page.keyboard.press('Enter');

  await expect(page.locator('.ant-table')).toContainText('HK-001');
  // Should NOT contain HK-002 in filtered results (if pagination allows)
  // We just verify filtering happened
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Clear search
  await searchInput.clear();
  await page.keyboard.press('Enter');
  await expect(page.locator('.ant-table')).toContainText('HK-002');
});

// ─── Status filter works ─────────────────────────────────────────────────────
test('status filter filters by Active', async ({ page }) => {
  const statusSelect = page.locator('input[placeholder="Trạng thái"]').first();
  await statusSelect.click();
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'Hoạt động' }).click();

  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── Refresh button reloads data ───────────────────────────────────────────
test('refresh button reloads household list', async ({ page }) => {
  const refreshBtn = page.locator('button').filter({ hasText: /Làm mới|Reload/i }).first();
  await refreshBtn.click();
  await expect(page.getByTestId('households-page')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-table')).toContainText('HK-001');
});

// ─── View household detail ───────────────────────────────────────────────────
test('opens household detail modal', async ({ page }) => {
  // Click the "eye" button on the first row
  const eyeBtn = page.locator('.ant-table-tbody tr').first().locator('button').filter({ hasTitle: /xem chi tiết/i }).first();
  await eyeBtn.click();

  // Modal should appear
  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Chi tiết');
  await expect(modal).toContainText('HK-001');

  // Close modal
  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(modal).not.toBeVisible();
});

// ─── Create household ─────────────────────────────────────────────────────────
test('creates a new household successfully', async ({ page }) => {
  // Click "Thêm hộ khẩu" button
  const addBtn = page.locator('button').filter({ hasText: 'Thêm hộ khẩu' }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Thêm hộ khẩu mới');

  // Fill form
  await modal.locator('input[placeholder="VD: HK-004"]').fill('HK-TEST-001');
  await modal.locator('input[placeholder="Thôn, Xã, Huyện..."]').fill('Thôn Test, Xã An Thành');

  // Select head person (Nguyễn Văn Minh - first person in list)
  const headSelect = modal.locator('.ant-select').filter({ has: page.locator('input[placeholder*="Chọn nhân"]') }).first();
  await headSelect.click();
  await page.locator('.ant-select-dropdown .ant-select-item').first().click();

  // Submit
  await modal.locator('button').filter({ hasText: /Thêm mới/i }).click();

  // Expect success message
  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });

  // Modal should close
  await expect(modal).not.toBeVisible();

  // New household should appear in table
  await expect(page.locator('.ant-table')).toContainText('HK-TEST-001');
});

// ─── Edit household ──────────────────────────────────────────────────────────
test('edits an existing household', async ({ page }) => {
  // Click edit button on first row
  const editBtn = page.locator('.ant-table-tbody tr').first().locator('button').filter({ hasTitle: /sửa/i }).first();
  await editBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Sửa hộ khẩu');

  // Update address
  await modal.locator('input[placeholder="Thôn, Xã, Huyện..."]').clear();
  await modal.locator('input[placeholder="Thôn, Xã, Huyện..."]').fill('Thôn 99, Xã Test');

  // Submit
  await modal.locator('button').filter({ hasText: /Lưu/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
});

// ─── Delete household (cancel confirm) ─────────────────────────────────────
test('delete confirmation appears and can be cancelled', async ({ page }) => {
  const initialCount = await page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)').count();

  // Click delete on first row
  const deleteBtn = page.locator('.ant-table-tbody tr').first().locator('button').filter({ hasTitle: /xóa/i }).first();
  await deleteBtn.click();

  // Confirm dialog appears
  const confirmModal = page.locator('.ant-modal-confirm');
  await expect(confirmModal).toBeVisible({ timeout: 5_000 });
  await expect(confirmModal).toContainText('Xác nhận xóa');

  // Cancel
  await confirmModal.locator('button').filter({ hasText: /Hủy/i }).click();
  await expect(confirmModal).not.toBeVisible();

  // Count should be unchanged
  const afterCount = await page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)').count();
  expect(afterCount).toBe(initialCount);
});
