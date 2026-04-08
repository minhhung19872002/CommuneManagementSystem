import { expect, Page } from '@playwright/test';

const demoCredentials = {
  username: process.env.E2E_USERNAME ?? 'admin',
  password: process.env.E2E_PASSWORD ?? '123',
};

export async function loginAsDemo(page: Page) {
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
}
