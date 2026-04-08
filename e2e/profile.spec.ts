import { test, expect } from './helpers/auth';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.goto('/profile');
    await page.waitForURL('**/profile');
  });

  test('should display profile page correctly', async ({ page }) => {
    await expect(page.getByText(/edit profile/i)).toBeVisible();
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeDisabled();
    await expect(page.getByLabel('Role')).toBeDisabled();
    await expect(page.getByRole('button', { name: /update profile/i })).toBeVisible();
  });

  test('should display profile information cards', async ({ page }) => {
    await expect(page.getByText('Full Name', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Username').first()).toBeVisible();
    await expect(page.getByText('Email').first()).toBeVisible();
    await expect(page.getByText('Member Since').first()).toBeVisible();
  });

  test('should reject invalid first name on submit', async ({ page }) => {
    const firstName = page.getByLabel('First Name');
    await firstName.fill('123');
    await page.getByRole('button', { name: /update profile/i }).click();

    // The form should not submit successfully - check that no success message appears
    await expect(page.getByText(/profile updated successfully/i)).not.toBeVisible();
  });

  test('should reject invalid last name on submit', async ({ page }) => {
    const lastName = page.getByLabel('Last Name');
    await lastName.fill('Last@Name');
    await page.getByRole('button', { name: /update profile/i }).click();

    await expect(page.getByText(/profile updated successfully/i)).not.toBeVisible();
  });

  test('should reject invalid email on submit', async ({ page }) => {
    const email = page.getByLabel('Email Address');
    await email.fill('not-an-email');
    await page.getByRole('button', { name: /update profile/i }).click();

    await expect(page.getByText(/profile updated successfully/i)).not.toBeVisible();
  });

  test('should detect no changes and show message', async ({ page }) => {
    await page.getByRole('button', { name: /update profile/i }).click();

    await expect(page.getByText(/no changes detected/i)).toBeVisible();
  });

  test('should navigate back to dashboard', async ({ page }) => {
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
