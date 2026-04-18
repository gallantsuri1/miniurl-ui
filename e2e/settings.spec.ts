import { test, expect } from './helpers/auth';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/settings');
    await page.waitForURL('**/settings');
  });

  test('should display settings page correctly', async ({ page }) => {
    await expect(page.getByText(/appearance/i)).toBeVisible();
    await expect(page.getByText(/danger zone/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /delete account/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /back to dashboard/i })).toBeVisible();
  });

  test('should display theme options', async ({ page }) => {
    await expect(page.getByText('Light')).toBeVisible();
    await expect(page.getByText('Dark')).toBeVisible();
  });

  test('should change theme', async ({ page }) => {
    await page.getByText('Dark').click();
    await page.waitForTimeout(1000);

    // Verify dark theme card has the checkmark icon
    const checkmark = page.locator('svg[data-testid="CheckCircleIcon"]').first();
    await expect(checkmark).toBeVisible();
  });

  test('should display export data option', async ({ page }) => {
    await expect(page.getByText(/export my data/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /download json export/i })).toBeVisible();
  });

  test('should open delete account dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete Account' }).click();

    await expect(page.getByRole('heading', { name: 'Delete Account' })).toBeVisible();
    await expect(page.getByLabel('Enter your password to confirm')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete My Account' })).toBeVisible();
  });

  test('should show validation error for delete password < 8 chars', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete Account' }).click();

    const passwordField = page.getByLabel('Enter your password to confirm');
    await passwordField.fill('short');
    await passwordField.blur();

    // Tooltip shows error message - get the first matching one
    await expect(page.getByText('Password must be at least 8 characters').first()).toBeVisible();
  });

  test('should disable delete button when password is empty', async ({ page }) => {
    await page.getByRole('button', { name: /delete account/i }).click();

    const deleteButton = page.getByRole('button', { name: /delete my account/i });
    await expect(deleteButton).toBeDisabled();
  });

  test('should disable delete button when password < 8 chars', async ({ page }) => {
    await page.getByRole('button', { name: /delete account/i }).click();

    await page.getByLabel('Enter your password to confirm').fill('short');
    const deleteButton = page.getByRole('button', { name: /delete my account/i });
    await expect(deleteButton).toBeDisabled();
  });

  test('should close delete dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /delete account/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();

    await expect(page.getByLabel('Enter your password to confirm')).not.toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
