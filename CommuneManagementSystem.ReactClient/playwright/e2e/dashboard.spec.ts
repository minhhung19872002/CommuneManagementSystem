import { expect, test } from '@playwright/test';
import { loginAsDemo } from './support/auth';

test.beforeEach(async ({ page }) => {
  await loginAsDemo(page);
});

test('renders the dashboard shell and key statistic cards', async ({ page }) => {
  const statIds = [
    'dashboard-stat-total-population-value',
    'dashboard-stat-total-households-value',
    'dashboard-stat-alive-count-value',
    'dashboard-stat-temp-resident-count-value',
    'dashboard-stat-temp-absent-count-value',
  ];

  await expect(page.getByTestId('app-shell')).toBeVisible();
  await expect(page.getByTestId('topbar-user')).toContainText(/\S/);

  for (const statId of statIds) {
    await expect(page.getByTestId(statId)).toContainText(/\d/);
  }
});

test('opens the off-canvas navigation on mobile and routes to reports', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile navigation is only relevant on mobile projects.');

  await page.getByTestId('topbar-mobile-menu').click();
  await expect(page.getByTestId('nav-reports')).toBeVisible();
  await page.getByTestId('nav-reports').click();
  await expect(page).toHaveURL(/\/reports$/);
  await expect(page.getByTestId('reports-page')).toBeVisible();
});
