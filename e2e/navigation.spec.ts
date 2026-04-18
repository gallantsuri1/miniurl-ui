import { test, expect } from './helpers/auth';

test.describe('Navigation & Header', () => {
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL('**/dashboard');
  });

  test('should display header with app name', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should display profile button in header', async ({ page }) => {
    // Profile button has Tooltip with title "Profile"
    const profileBtn = page.getByRole('button', { name: 'Profile' });
    await expect(profileBtn).toBeVisible();
  });

  test('should navigate to profile from header button', async ({ page }) => {
    // The avatar button is wrapped in a Tooltip with title "Profile"
    await page.getByRole('button', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/profile/);
  });

  test('should open dropdown menu and navigate to settings', async ({ page }) => {
    // Click the expand more button to open menu
    await page.locator('header').getByRole('button').nth(1).click();
    await page.getByRole('menuitem', { name: /settings/i }).click();
    await expect(page).toHaveURL(/settings/);
  });

  test('should logout successfully', async ({ page }) => {
    // Open menu
    await page.locator('header').getByRole('button').nth(1).click();
    await page.getByRole('menuitem', { name: /logout/i }).click();
    await expect(page).toHaveURL(/login/);

    // Verify token is cleared
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('should show user initials in avatar', async ({ page }) => {
    const avatar = page.locator('header').getByRole('button').first();
    await expect(avatar).toBeVisible();
  });
});
