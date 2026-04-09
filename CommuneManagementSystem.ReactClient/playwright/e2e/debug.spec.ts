import { expect, test } from '@playwright/test';
import { loginAsDemo } from './support/auth';

test('DEBUG: check axios vs fetch behavior', async ({ page }) => {
  await loginAsDemo(page);
  
  // Check initial state
  const before = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
  }));
  console.log('BEFORE:', JSON.stringify(before));
  
  // Inject real token using direct fetch
  const res = await page.evaluate(async () => {
    try {
      const r = await fetch('http://127.0.0.1:5068/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: '123' })
      });
      const data = await r.json();
      return { ok: r.ok, status: r.status, hasToken: !!data.token, tokenPreview: data.token?.substring(0, 20) };
    } catch(e) {
      return { error: String(e) };
    }
  });
  console.log('Login API result:', JSON.stringify(res));
  
  // Now set real token
  await page.evaluate(async () => {
    const r = await fetch('http://127.0.0.1:5068/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: '123' })
    });
    const data = await r.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    // Verify it was set
    const stored = localStorage.getItem('token');
    return { stored: stored?.substring(0,20), match: stored === data.token };
  });
  
  // Check localStorage
  const after = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
  }));
  console.log('AFTER:', JSON.stringify(after));
  
  // Navigate
  await page.goto('/households', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('URL after 3s:', page.url());
  
  await expect(page).toHaveURL(/\/households$/);
});
