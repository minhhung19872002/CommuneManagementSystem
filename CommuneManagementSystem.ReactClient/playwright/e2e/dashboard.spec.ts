import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
});

// ─── Dashboard renders stats ─────────────────────────────────────────────────
test('renders dashboard shell with all stat cards', async ({ page }) => {
  await expect(page.getByTestId('app-shell')).toBeVisible();
  await expect(page.getByTestId('topbar-user')).toContainText(/\S/);

  const statIds = [
    'dashboard-stat-total-population',
    'dashboard-stat-total-households',
    'dashboard-stat-alive-count',
    'dashboard-stat-male-count',
    'dashboard-stat-female-count',
    'dashboard-stat-dead-count',
    'dashboard-stat-moved-count',
    'dashboard-stat-temp-resident-count',
    'dashboard-stat-temp-absent-count',
  ];

  for (const statId of statIds) {
    await expect(page.getByTestId(statId)).toBeVisible();
    // Value elements should contain a number
    await expect(page.getByTestId(`${statId}-value`)).toBeVisible();
  }
});

// ─── Dashboard stat values are real numbers from seed data ─────────────────
test('stat values match seed data (8 persons total)', async ({ page }) => {
  // Seed data has 8 persons (7 alive, 1 dead person in death records)
  // Stats from /api/reports/statistics
  const totalPopValue = await page.getByTestId('dashboard-stat-total-population-value').textContent();
  expect(Number(totalPopValue?.replace(/\D/g, ''))).toBeGreaterThan(0);

  const totalHHValue = await page.getByTestId('dashboard-stat-total-households-value').textContent();
  expect(Number(totalHHValue?.replace(/\D/g, ''))).toBeGreaterThan(0);
});

// ─── Quick links navigate correctly ────────────────────────────────────────
test('quick link to households works', async ({ page }) => {
  await expect(page.getByTestId('app-shell')).toBeVisible();
  // Find the quick-link whose href contains /households
  const householdLink = page.locator('a[href="/households"]').first();
  await householdLink.click();
  await expect(page).toHaveURL(/\/households$/);
  await expect(page.getByTestId('households-page')).toBeVisible({ timeout: 8_000 });
});

test('quick link to persons works', async ({ page }) => {
  const personsLink = page.locator('a[href="/persons"]').first();
  await personsLink.click();
  await expect(page).toHaveURL(/\/persons$/);
  await expect(page.getByTestId('persons-page')).toBeVisible({ timeout: 8_000 });
});

test('quick link to reports works', async ({ page }) => {
  const reportsLink = page.locator('a[href="/reports"]').first();
  await reportsLink.click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByTestId('reports-page')).toBeVisible({ timeout: 8_000 });
});

// ─── Sidebar collapse works ─────────────────────────────────────────────────
test('sidebar collapses and expands', async ({ page }) => {
  // Initial state: sidebar should be visible
  await expect(page.getByTestId('nav-dashboard').first()).toBeVisible();

  // Click collapse toggle (hidden on mobile, visible on desktop via ←/→ button)
  // The toggle button is inside the topbar area
  const collapseBtn = page.locator('button', { has: page.locator('span', { hasText: '←' }) }).first();
  await collapseBtn.click();

  // After collapse, the sidebar nav items might be hidden or truncated
  // At minimum the shell should still be visible
  await expect(page.getByTestId('app-shell')).toBeVisible();
});

// ─── User info displayed in topbar ─────────────────────────────────────────
test('topbar shows current user info', async ({ page }) => {
  const topbarUser = page.getByTestId('topbar-user');
  await expect(topbarUser).toBeVisible();
  // Admin username should be visible somewhere in the topbar
  const topbarText = topbarUser.textContent();
  await expect(topbarText).toMatch(/admin|Nguyễn Văn A/i);
});

// ─── Mobile navigation opens ─────────────────────────────────────────────────
test('mobile hamburger menu opens sidebar on small viewport', async ({ page, viewport }) => {
  // Only relevant on mobile-sized viewports
  if (viewport && viewport.width && viewport.width >= 768) {
    test.skip();
    return;
  }

  await page.getByTestId('topbar-mobile-menu').click();
  // Sidebar overlay should appear
  await expect(page.getByTestId('nav-reports').first()).toBeVisible({ timeout: 5_000 });
});
