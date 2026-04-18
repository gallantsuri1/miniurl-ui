import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page', () => {
  test('should display forgot password form correctly', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByText(/reset.*password/i)).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('should disable send button when email is empty', async ({ page }) => {
    await page.goto('/forgot-password');

    const sendButton = page.getByRole('button', { name: /send reset link/i });
    await expect(sendButton).toBeDisabled();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailField = page.getByLabel('Email Address');
    await emailField.fill('not-an-email');
    await emailField.blur();

    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByText('Sign In').click();
    await expect(page).toHaveURL(/login/);
  });

  test('should handle submission with non-existent email', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel('Email Address').fill('nonexistent@example.com');
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Should not crash, may show error or success (backend behavior)
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/forgot-password|login/);
  });
});
