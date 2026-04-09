import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';

const demoCredentials = {
  username: process.env.E2E_USERNAME ?? 'admin',
  password: process.env.E2E_PASSWORD ?? '123',
};

export { demoCredentials };

// Extended expect with custom matchers
export const expect = base.expect.extend({
  async toBeLoaded(page: Page) {
    await expect(page).toHaveURL(/\/(login|$)$/);
    return this;
  },
});

// Custom base test that auto-logs-in
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-page')).toBeVisible();

    if (demoCredentials.username === 'admin' && demoCredentials.password === '123') {
      await page.getByTestId('demo-account-admin').click();
    } else {
      await page.getByTestId('login-username').fill(demoCredentials.username);
      await page.getByTestId('login-password').fill(demoCredentials.password);
    }

    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    await use(page);
  },
});
