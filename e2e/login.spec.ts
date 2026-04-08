import { test, expect } from './helpers/auth';
import { ADMIN_USER } from './fixtures/users';

test.describe('Login Page', () => {
  test('should display login form correctly', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('Sign In')).toBeVisible();
    await expect(page.getByLabel('Username or Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByText('Forgot Password?')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login');

    // Focus and blur without typing to trigger validation
    await page.getByLabel('Username or Email').focus();
    await page.getByLabel('Username or Email').blur();

    await expect(page.getByText('Username or email is required')).toBeVisible();

    await page.getByLabel('Password').focus();
    await page.getByLabel('Password').blur();

    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should disable submit button when fields are empty', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /sign in/i });
    await expect(submitButton).toBeDisabled();

    // Fill username but not password
    await page.getByLabel('Username or Email').fill(ADMIN_USER.username);
    await expect(submitButton).toBeDisabled();

    // Fill password
    await page.getByLabel('Password').fill('password');
    await expect(submitButton).toBeEnabled();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Username or Email').fill('nonexistentuser');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/invalid|failed|not found/i);
  });

  test('should login successfully with valid credentials', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');

    await page.getByText('Forgot Password?').click();
    await expect(page).toHaveURL(/forgot-password/);
  });
});
