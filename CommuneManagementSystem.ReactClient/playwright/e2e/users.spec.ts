import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/users');
  await expect(page.getByTestId('users-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Page loads with seed users ─────────────────────────────────────────────
test('page loads user cards with seed data', async ({ page }) => {
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByTestId('users-page')).toBeVisible({ timeout: 10_000 });

  // Seed has 3 users: admin, nhankhau, hokhau
  await expect(page.locator('.ant-card')).not.toHaveCount(0, { timeout: 10_000 });
  const cards = page.locator('.ant-card');
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(1);

  // Admin user should be visible
  await expect(page.locator('body')).toContainText('admin');
  await expect(page.locator('body')).toContainText('Nguyễn Văn A');
});

// ─── Seed user roles are displayed ─────────────────────────────────────────
test('seed user roles are correctly displayed', async ({ page }) => {
  await expect(page.locator('.ant-tag')).not.toHaveCount(0, { timeout: 8_000 });
  // Admin tag
  await expect(page.locator('body')).toContainText('Quản trị viên');
});

// ─── Create new user ─────────────────────────────────────────────────────────
test('creates a new user successfully', async ({ page }) => {
  const addBtn = page.locator('button').filter({ hasText: /Thêm người dùng/i }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });
  await expect(modal).toContainText('Thêm người dùng mới');

  // Fill form
  await modal.locator('input[placeholder="Tên đăng nhập"]').fill('testuser_e2e');
  await modal.locator('input[placeholder="Mật khẩu"]').fill('test1234');
  await modal.locator('input[placeholder="Họ và tên đầy đủ"]').fill('Người Dùng Test E2E');

  // Submit
  await modal.locator('button').filter({ hasText: /Thêm mới/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
  await expect(modal).not.toBeVisible();

  // New user should appear
  await expect(page.locator('body')).toContainText('testuser_e2e');
  await expect(page.locator('body')).toContainText('Người Dùng Test E2E');
});

// ─── Create user validation: missing fields ─────────────────────────────────
test('create user shows validation error for missing fields', async ({ page }) => {
  const addBtn = page.locator('button').filter({ hasText: /Thêm người dùng/i }).first();
  await addBtn.click();

  const modal = page.locator('.ant-modal');
  await expect(modal).toBeVisible({ timeout: 5_000 });

  // Try to submit with empty fields
  await modal.locator('button').filter({ hasText: /Thêm mới/i }).click();

  // Ant Design form validation should show error messages
  const validationErrors = modal.locator('.ant-form-item-explain-error');
  await expect(validationErrors.first()).toBeVisible({ timeout: 3_000 });

  // Close modal
  await modal.locator('.ant-modal-close').click();
});

// ─── Toggle user lock ────────────────────────────────────────────────────────
test('lock/unlock button toggles user status', async ({ page }) => {
  // Find a card with a status toggle button
  const firstCard = page.locator('.ant-card').first();
  const lockBtn = firstCard.locator('button').filter({ hasText: /Khóa|Mở/ }).first();

  await expect(lockBtn).toBeVisible();
  await lockBtn.click();

  // Popconfirm appears
  const popconfirm = page.locator('.ant-popconfirm');
  await expect(popconfirm).toBeVisible({ timeout: 5_000 });
  await popconfirm.locator('button').filter({ hasText: /Xác nhận/i }).click();

  await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });
});

// ─── Delete user ─────────────────────────────────────────────────────────────
test('deletes a newly created user', async ({ page }) => {
  // Find the test user card
  const testUserCard = page.locator('.ant-card').filter({ has: page.locator('text', { exact: false }, 'testuser_e2e') });

  if (await testUserCard.count() > 0) {
    const deleteBtn = testUserCard.locator('button').filter({ hasText: /Xóa/ }).first();
    await deleteBtn.click();

    const popconfirm = page.locator('.ant-popconfirm');
    await expect(popconfirm).toBeVisible({ timeout: 5_000 });
    await popconfirm.locator('button[ant-click-animating-without-extra-child]').filter({ hasText: /Xóa/i }).first().click();

    // Click confirm button inside popconfirm
    await page.locator('.ant-popconfirm').locator('button').filter({ hasText: /Xóa/i }).click();

    await expect(page.locator('.ant-message')).toContainText(/thành công/i, { timeout: 8_000 });

    // User should no longer appear
    await expect(page.locator('body')).not.toContainText('testuser_e2e');
  } else {
    test.skip();
  }
});
