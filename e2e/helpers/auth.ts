import { test as base } from '@playwright/test';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/users';

type UserRole = 'admin' | 'user';

interface TestFixtures {
  loginAsAdmin: () => Promise<void>;
  loginAsUser: () => Promise<void>;
}

export const test = base.extend<TestFixtures>({
  loginAsAdmin: async ({ page }, use) => {
    await use(async () => {
      await login(page, ADMIN_USER.username, ADMIN_USER.password);
    });
  },
  loginAsUser: async ({ page }, use) => {
    await use(async () => {
      await login(page, REGULAR_USER.username, REGULAR_USER.password);
    });
  },
});

async function login(page: import('@playwright/test').Page, username: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Username or Email').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  // Wait for navigation to dashboard after login
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
    // OTP might be required — check for OTP page
  });
}

export { expect } from '@playwright/test';
