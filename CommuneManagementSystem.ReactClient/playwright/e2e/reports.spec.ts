import { expect, test } from '@playwright/test';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
  await page.goto('/reports');
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByTestId('reports-page')).toBeVisible();
});

test('loads report summaries and tabular data', async ({ page }) => {
  await expect(page.getByTestId('reports-summary-total-population')).toContainText(/\d/);
  await expect.poll(() => page.locator('[data-testid="reports-table-households"] .ant-table-tbody tr:not(.ant-table-placeholder)').count()).toBeGreaterThan(0);

  await page.getByTestId('reports-tab-population').click();
  await expect.poll(() => page.locator('[data-testid="reports-table-population"] .ant-table-tbody tr:not(.ant-table-placeholder)').count()).toBeGreaterThan(0);

  await page.getByTestId('reports-tab-temp-residence').click();
  await expect.poll(() => page.locator('[data-testid="reports-table-temp-residence"] .ant-table-tbody tr:not(.ant-table-placeholder)').count()).toBeGreaterThan(0);

  await page.getByTestId('reports-tab-temp-absence').click();
  await expect.poll(() => page.locator('[data-testid="reports-table-temp-absence"] .ant-table-tbody tr:not(.ant-table-placeholder)').count()).toBeGreaterThan(0);
});

test('exports the active report as JSON', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download');

  await page.getByTestId('reports-export-json').click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^report-\d{4}-\d{2}-\d{2}\.json$/);
});
