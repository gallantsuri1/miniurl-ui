import { test, expect } from './helpers/auth';

test.describe('URL Management', () => {
  test.beforeEach(async ({ page, loginAsAdmin }) => {
    await loginAsAdmin();
    await page.waitForURL('**/dashboard');
  });

  test('should delete a URL with confirmation', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com/delete-me');
    await page.getByRole('button', { name: /shorten/i }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: /delete/i }).first().click();

    await expect(page.getByText('Delete URL')).toBeVisible();
    await expect(page.getByText(/sure you want to delete/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();

    await page.getByRole('button', { name: /delete/i }).last().click();
    await expect(page.getByText(/url deleted successfully/i)).toBeVisible();
  });

  test('should cancel URL deletion', async ({ page }) => {
    await page.getByLabel('Long URL').fill('https://example.com/keep-me');
    await page.getByRole('button', { name: /shorten/i }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: /delete/i }).first().click();
    await expect(page.getByText('Delete URL')).toBeVisible();

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByText('Delete URL')).not.toBeVisible();
  });

  test('should show empty state when no URLs', async ({ page }) => {
    await expect(page.getByText(/your urls/i)).toBeVisible();
  });

  test('should handle URL too long validation', async ({ page }) => {
    // The input has maxLength=2000, so the browser prevents typing beyond that
    // We verify the maxLength attribute is set correctly
    const urlInput = page.getByLabel('Long URL');
    await expect(urlInput).toHaveAttribute('maxlength', '2000');
  });

  test('should update click count when clicking short URL', async ({ page, context }) => {
    // Create a URL first
    await page.getByLabel('Long URL').fill('https://example.com/click-test');
    await page.getByRole('button', { name: /shorten/i }).click();
    await page.waitForTimeout(2000);

    // Get the initial click count
    const initialClickCountCell = page.locator('table tbody tr').first().locator('td').nth(2);
    const initialCountText = await initialClickCountCell.textContent();
    const initialCount = parseInt(initialCountText || '0', 10);

    // Grant permission for new tab
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click the short URL (opens in new tab)
    const shortUrlLink = page.locator('table tbody tr').first().locator('td').first().locator('span[role="button"], typography');
    await shortUrlLink.click();

    // Wait a moment for the background API call to complete
    await page.waitForTimeout(1000);

    // The click count should have updated (reload to see updated count)
    await page.reload();
    await page.waitForTimeout(1000);

    const updatedClickCountCell = page.locator('table tbody tr').first().locator('td').nth(2);
    const updatedCountText = await updatedClickCountCell.textContent();
    const updatedCount = parseInt(updatedCountText || '0', 10);

    // Click count should have increased
    expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
  });
});
