import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/persons');
  await expect(page.getByTestId('persons-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads and shows person table ──────────────────────────────────────
test('page loads person table with seed data', async ({ page }) => {
  await expect(page).toHaveURL(/\/persons$/);
  await expect(page.getByTestId('persons-page')).toBeVisible({ timeout: 10_000 });

  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── Seed data persons are visible ─────────────────────────────────────────
test('seed persons appear in the table', async ({ page }) => {
  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  await expect(page.locator('.ant-table')).toContainText('Nguyễn Văn Minh');
  await expect(page.locator('.ant-table')).toContainText('Nguyễn Thị Lan');
  await expect(page.locator('.ant-table')).toContainText('Trần Văn Hùng');
});

// ─── Search filters persons ──────────────────────────────────────────────────
test('search filters persons by name', async ({ page }) => {
  const searchInput = page.locator('input[placeholder="Tìm tên, CCCD..."]');
  await expect(searchInput).toBeVisible();

  await searchInput.fill('Nguyễn Văn Minh');
  await page.keyboard.press('Enter');

  await expect(page.locator('.ant-table')).toContainText('Nguyễn Văn Minh');
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).toHaveCount(1);

  // Clear
  await searchInput.clear();
  await page.keyboard.press('Enter');
});

// ─── Status filter works ─────────────────────────────────────────────────────
test('status filter shows only alive persons', async ({ page }) => {
  const statusSelect = page.locator('input[placeholder="Trạng thái"]').first();
  await statusSelect.click();
  await page.locator('.ant-select-dropdown').locator('.ant-select-item').filter({ hasText: 'Đang sống' }).click();

  await expect(page.locator('.ant-table')).toBeVisible({ timeout: 8_000 });
  const rows = page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

// ─── View person detail ───────────────────────────────────────────────────────
test('opens person detail modal', async ({ page }) => {
  const eyeBtn = page.locator('.ant-table-tbody tr').first().locator('button').filter({ hasTitle: /chi tiết/i }).first();
  await eyeBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Nguyễn Văn Minh');

  await page.getByRole('button', { name: 'Đóng' }).click();
  await expect(modal).not.toBeVisible();
});

// ─── Create person ───────────────────────────────────────────────────────────
test('creates a new person successfully', async ({ page }) => {
  const addBtn = page.locator('button').filter({ hasText: 'Thêm nhân khẩu' }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Thêm nhân khẩu mới');

  // Fill form fields
  await modal.locator('input[placeholder="Nguyễn Văn A"]').fill('Test Person E2E');
  await modal.locator('input[type="date"]').first().fill('2000-01-15');

  // Submit
  await modal.locator('button').filter({ hasText: /Thêm mới/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  await expect(modal).not.toBeVisible();

  await expect(page.locator('.ant-table')).toContainText('Test Person E2E');
});

// ─── Edit person ────────────────────────────────────────────────────────────
test('edits an existing person', async ({ page }) => {
  const editBtn = page.locator('.ant-table-tbody tr').filter({ has: page.locator('td', { hasText: 'Nguyễn Thị Lan' }) }).locator('button').filter({ hasTitle: /sửa/i }).first();
  await editBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Sửa nhân khẩu');

  // Change occupation
  const occupationInput = modal.locator('input[placeholder="Nông dân, Công nhân..."]');
  await occupationInput.clear();
  await occupationInput.fill('Nông dân (đã chỉnh sửa)');

  await modal.locator('button').filter({ hasText: /Lưu/i }).click();
  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
});

// ─── Delete person (cancel) ─────────────────────────────────────────────────
test('delete confirmation appears and can be cancelled', async ({ page }) => {
  const initialCount = await page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)').count();

  // Delete the last added "Test Person E2E" to avoid affecting seed data
  const testRow = page.locator('.ant-table-tbody tr').filter({ has: page.locator('td', { hasText: 'Test Person E2E' }) });
  if (await testRow.count() > 0) {
    const deleteBtn = testRow.locator('button').filter({ hasTitle: /xóa/i }).first();
    await deleteBtn.click();

    const confirmModal = page.locator('.ant-modal-confirm');
    await expect(confirmModal).toBeVisible({ timeout: 5_000 });

    await confirmModal.locator('button').filter({ hasText: /Hủy/i }).click();
    await expect(confirmModal).not.toBeVisible();
    const afterCount = await page.locator('.ant-table-tbody tr:not(.ant-table-placeholder)').count();
    expect(afterCount).toBe(initialCount);
  }
});

// ─── Birth registration modal ───────────────────────────────────────────────
test('opens birth registration modal', async ({ page }) => {
  const birthBtn = page.locator('button').filter({ hasText: /Khai sinh/ }).first();
  await birthBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Khai sinh');

  // Cancel
  await modal.locator('button').filter({ hasText: /Cancel|Đóng|Hủy bỏ/i }).first().click();
  await expect(modal).not.toBeVisible();
});

// ─── Death registration modal ────────────────────────────────────────────────
test('opens death registration modal', async ({ page }) => {
  const deathBtn = page.locator('button').filter({ hasText: /Khai tử/ }).first();
  await deathBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Khai tử');

  await modal.locator('button').filter({ hasText: /Cancel|Đóng|Hủy bỏ/i }).first().click();
  await expect(modal).not.toBeVisible();
});

// ─── Full birth registration flow ───────────────────────────────────────────
test('completes full birth registration flow', async ({ page }) => {
  const birthBtn = page.locator('button').filter({ hasText: /Khai sinh/ }).first();
  await birthBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });

  // Fill birth form
  await modal.locator('input[placeholder="Tên trẻ"]').fill('Em Bé Test');
  // Find date input in birth tab
  const dateInputs = modal.locator('input[type="date"]');
  await dateInputs.first().fill('2024-06-15');

  // Submit
  await modal.locator('button').filter({ hasText: /Đăng ký/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  await expect(modal).not.toBeVisible();

  // Person should now appear in table
  await expect(page.locator('.ant-table')).toContainText('Em Bé Test');
});
