import { test, expect } from './helpers/auth';
import { ADMIN_USER } from './fixtures/users';

test.describe('User Management', () => {
  test('should navigate to user details page when clicking View button', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

    // Click the first View button
    const viewButtons = page.getByRole('button', { name: /view/i });
    const firstViewButton = viewButtons.first();
    await expect(firstViewButton).toBeVisible();
    await firstViewButton.click();

    // Should navigate to user detail page
    await expect(page).toHaveURL(/\/admin\/users\/\d+/);
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible({ timeout: 10000 });
  });

  test('should display user details correctly on detail page', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

    // Click the first View button
    const viewButtons = page.getByRole('button', { name: /view/i });
    await expect(viewButtons.first()).toBeVisible();
    await viewButtons.first().click();

    // Wait for user detail page
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible({ timeout: 10000 });

    // Verify sections are visible
    await expect(page.getByText('Personal Information')).toBeVisible();
    await expect(page.getByText('Account Information')).toBeVisible();
    await expect(page.getByText('Activity Information')).toBeVisible();

    // Verify data fields are present
    await expect(page.getByText('Full Name')).toBeVisible();
    await expect(page.getByText('Email Address')).toBeVisible();
    await expect(page.getByText('Username')).toBeVisible();
    await expect(page.getByText('User ID')).toBeVisible();
    await expect(page.getByText('Role')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Account Created')).toBeVisible();
    await expect(page.getByText('Last Login')).toBeVisible();
  });

  test('should navigate back to user management from detail page', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

    // Click the first View button
    const viewButtons = page.getByRole('button', { name: /view/i });
    await expect(viewButtons.first()).toBeVisible();
    await viewButtons.first().click();

    // Wait for user detail page
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible({ timeout: 10000 });

    // Click back button
    const backButton = page.getByRole('button', { name: /back to user management/i });
    await expect(backButton).toBeVisible();
    await backButton.click();

    // Should navigate back to user management
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });
  });

  test('should display back button in header row alongside title', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

    // Navigate to user management and view a user
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

    const viewButtons = page.getByRole('button', { name: /view/i });
    await expect(viewButtons.first()).toBeVisible();
    await viewButtons.first().click();

    // Wait for user detail page
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible({ timeout: 10000 });

    // Verify the back button is in the same header row as the title
    // (matching the same layout as UserManagementPage's "Back to Dashboard" button)
    const headerRow = page.locator('text="User Details"').locator('xpath=..');
    await expect(headerRow.locator('text="Back to User Management"')).toBeVisible();
  });

  test('should show correct user info in detail page', async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10000 });

    // Navigate to user management
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible({ timeout: 10000 });

    // Get the first user's username from the table
    const firstUsername = await page.locator('table tbody tr').first().locator('td').nth(3).textContent();

    // Click the first View button
    const viewButtons = page.getByRole('button', { name: /view/i });
    await expect(viewButtons.first()).toBeVisible();
    await viewButtons.first().click();

    // Wait for user detail page
    await expect(page.getByRole('heading', { name: 'User Details' })).toBeVisible({ timeout: 10000 });

    // Verify the page shows the correct user
    await expect(page.locator('text="Viewing details for user"')).toBeVisible();
    if (firstUsername) {
      await expect(page.locator(`text="${firstUsername}"`).first()).toBeVisible();
    }
  });
});
