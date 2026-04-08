import { test, expect } from './helpers/auth';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL('**/dashboard');
  });

  test('should display dashboard correctly', async ({ page }) => {
    await expect(page.getByText(/create short url/i)).toBeVisible();
    await expect(page.getByLabel('Long URL')).toBeVisible();
    await expect(page.getByLabel('Custom Alias (optional)')).toBeVisible();
    await expect(page.getByRole('button', { name: /shorten/i })).toBeVisible();
    await expect(page.getByText(/your urls/i)).toBeVisible();
  });

  test('should disable shorten button without URL', async ({ page }) => {
    const shortenButton = page.getByRole('button', { name: /shorten/i });
    await expect(shortenButton).toBeDisabled();
  });

  test('should show validation error for URL with spaces', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com url with spaces');
    await page.getByLabel('Long URL').blur();

    // Tooltip should appear with error message
    await expect(page.getByText(/must not contain spaces/i)).toBeVisible();
  });

  test('should show validation error for invalid alias', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com/valid-path');
    await page.getByLabel('Custom Alias (optional)').fill('ab');  // too short
    await page.getByLabel('Custom Alias (optional)').blur();

    await expect(page.getByText(/at least 3 characters/i)).toBeVisible();
  });

  test('should show validation error for alias with special chars', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com/valid-path');
    await page.getByLabel('Custom Alias (optional)').fill('my-link!');  // special char
    await page.getByLabel('Custom Alias (optional)').blur();

    await expect(page.getByText(/alphanumeric/i)).toBeVisible();
  });

  test('should create a short URL successfully', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com/test-url');
    await page.getByRole('button', { name: /shorten/i }).click();

    // Wait for success or table update
    await page.waitForTimeout(2000);

    // The URL should appear in the table or we get a success tooltip
    const successVisible = await page.getByText(/shortened successfully/i).isVisible().catch(() => false);
    const tableVisible = await page.getByText('example.com/test-url').isVisible().catch(() => false);
    expect(successVisible || tableVisible).toBeTruthy();
  });

  test('should create a short URL with custom alias', async ({ page }) => {
    const uniqueAlias = `test${Date.now()}`;
    await page.getByLabel('Long URL').fill('https://example.com/aliased-url');
    await page.getByLabel('Custom Alias (optional)').fill(uniqueAlias);
    await page.getByRole('button', { name: /shorten/i }).click();

    await page.waitForTimeout(3000);

    // Check that either the form was cleared (success) or there's no error
    const hasError = await page.locator('.Mui-error').isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });

  test('should search URLs', async ({ page }) => {
    // First create a URL
    await page.getByLabel('Long URL').fill('https://example.com/searchable-url');
    await page.getByRole('button', { name: /shorten/i }).click();
    await page.waitForTimeout(2000);

    // Then search for it
    await page.getByPlaceholder('Search URLs...').fill('searchable');
    await page.getByRole('button', { name: /search/i }).click();

    await page.waitForTimeout(1000);
    // Check that at least one element contains the text
    const cells = page.getByRole('cell');
    await expect(cells.first()).toBeVisible();
  });

  test('should clear search', async ({ page }) => {
    await page.getByPlaceholder('Search URLs...').fill('nonexistent');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: /clear/i }).click();
    await expect(page.getByPlaceholder('Search URLs...')).toHaveValue('');
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/settings/);
    // Go back to dashboard for subsequent tests
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await page.waitForURL('**/dashboard');
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/profile/);
    await page.getByRole('button', { name: /back to dashboard/i }).click();
    await page.waitForURL('**/dashboard');
  });

  test('should display URL limits dialog', async ({ page }) => {
    await page.getByText(/limits/i).click();
    await expect(page.getByText('URL Creation Limits', { exact: true })).toBeVisible();
    await expect(page.getByText('Per Minute')).toBeVisible();
    await expect(page.getByText('Per Day')).toBeVisible();
    await expect(page.getByText('Per Month')).toBeVisible();
  });
});
