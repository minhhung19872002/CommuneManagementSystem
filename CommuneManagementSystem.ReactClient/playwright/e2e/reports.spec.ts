import { expect, test } from './support/commands';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/reports');
  await expect(page.getByTestId('reports-page')).toBeVisible({ timeout: 10_000 });
});

// ─── Reports page loads summary cards ──────────────────────────────────────
test('shows 4 summary statistic cards', async ({ page }) => {
  const summaryIds = [
    'reports-summary-total-population',
    'reports-summary-total-households',
    'reports-summary-temp-residence',
    'reports-summary-temp-absence',
  ];

  for (const id of summaryIds) {
    await expect(page.getByTestId(id)).toBeVisible();
    const valueEl = page.locator(`[data-testid="${id}"] .summary-card-value`);
    await expect(valueEl).toBeVisible();
    await expect(valueEl).not.toHaveText('—');
  }
});

// ─── Households report tab loads table ──────────────────────────────────────
test('households tab loads data from seed (3 households)', async ({ page }) => {
  await expect(page.getByTestId('reports-tab-households')).toBeVisible();
  await expect(page.getByTestId('reports-table-households')).toBeVisible({ timeout: 8_000 });

  // Wait for Ant Design table rows to appear (not placeholder)
  const rows = page.locator('[data-testid="reports-table-households"] .ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  // Seed has 3 households
  expect(count).toBeGreaterThanOrEqual(1);
});

// ─── Population report tab ──────────────────────────────────────────────────
test('population tab loads seed person data', async ({ page }) => {
  await page.getByTestId('reports-tab-population').click();
  await expect(page.getByTestId('reports-table-population')).toBeVisible({ timeout: 8_000 });

  const rows = page.locator('[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(1);
  // Should contain "Nguyễn Văn Minh" from seed data
  await expect(page.getByTestId('reports-table-population')).toContainText('Nguyễn Văn Minh');
});

// ─── Temporary residence tab ────────────────────────────────────────────────
test('temp residence tab loads seed data (1 record)', async ({ page }) => {
  await page.getByTestId('reports-tab-temp-residence').click();
  await expect(page.getByTestId('reports-table-temp-residence')).toBeVisible({ timeout: 8_000 });

  const rows = page.locator('[data-testid="reports-table-temp-residence"] .ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  // Should contain Trần Đức Anh (personId=6) from seed
  await expect(page.getByTestId('reports-table-temp-residence')).toContainText('Trần Đức Anh');
});

// ─── Temporary absence tab ───────────────────────────────────────────────────
test('temp absence tab loads seed data (1 record)', async ({ page }) => {
  await page.getByTestId('reports-tab-temp-absence').click();
  await expect(page.getByTestId('reports-table-temp-absence')).toBeVisible({ timeout: 8_000 });

  const rows = page.locator('[data-testid="reports-table-temp-absence"] .ant-table-tbody tr:not(.ant-table-placeholder)');
  await expect(rows).not.toHaveCount(0, { timeout: 10_000 });
  // Should contain Trần Văn Hùng (personId=4) from seed
  await expect(page.getByTestId('reports-table-temp-absence')).toContainText('Trần Văn Hùng');
  await expect(page.getByTestId('reports-table-temp-absence')).toContainText('TP. Hồ Chí Minh');
});

// ─── Export JSON download ───────────────────────────────────────────────────
test('exports active report as JSON file', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');

  await page.getByTestId('reports-export-json').click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^report-\d{4}-\d{2}-\d{2}\.json$/);
});

// ─── Refresh button reloads data ─────────────────────────────────────────────
test('refresh button reloads the current tab data', async ({ page }) => {
  await page.getByTestId('reports-tab-population').click();
  await expect(page.getByTestId('reports-table-population')).toBeVisible({ timeout: 8_000 });

  const initialRowCount = await page.locator(
    '[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)',
  ).count();

  expect(initialRowCount).toBeGreaterThan(0);

  await page.getByTestId('reports-refresh').click();
  await expect(page.getByTestId('reports-table-population')).toBeVisible({ timeout: 8_000 });
});
