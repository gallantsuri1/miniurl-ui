import { test, expect } from './helpers/auth';
import { ADMIN_USER } from './fixtures/users';

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated users from profile to login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/login/);
  });

  test('should redirect unauthenticated users from settings to login', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/login/);
  });

  test('should allow access to login page without auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/login/);
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('should allow access to forgot password without auth', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('should not show dashboard content when not logged in', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);

    // Dashboard elements should not be visible
    await expect(page.getByText('Create Short URL')).not.toBeVisible();
  });

  test('should preserve redirect after login', async ({ page }) => {
    // Navigate to dashboard while not logged in
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);

    // Login
    await page.getByLabel('Username or Email').fill(ADMIN_USER.username);
    await page.getByLabel('Password').fill(ADMIN_USER.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });
});
