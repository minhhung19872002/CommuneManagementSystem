import { expect, test } from '@playwright/test';
import { loginAsDemo } from './support/auth';

test('redirects guests to login and signs in with the demo admin account', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId('login-form')).toBeVisible();

  await loginAsDemo(page);
  await expect(page).toHaveURL(/\/$/);
});
