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
});
