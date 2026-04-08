import { test, expect } from '@playwright/test';

test.describe('Reset Password Page', () => {
  test('should show invalid token page without valid token', async ({ page }) => {
    await page.goto('/reset-password');

    // Should show "Invalid Reset Link" error page
    await expect(page.getByRole('heading', { name: 'Invalid Reset Link' })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page from reset page', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForTimeout(2000);

    // On the error page, use the "Request New Reset Link" button which goes to forgot-password
    // then from there navigate to login
    if (await page.getByText('Request New Reset Link').isVisible().catch(() => false)) {
      await page.getByText('Request New Reset Link').click();
      await page.waitForTimeout(1000);
    }

    await page.getByText('Sign In').first().click();
    await expect(page).toHaveURL(/login/);
  });

  test('should show request new reset link option', async ({ page }) => {
    await page.goto('/reset-password');
    await page.waitForTimeout(2000);

    await expect(page.getByText('Request New Reset Link')).toBeVisible();
  });
});
