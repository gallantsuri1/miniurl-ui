import { test, expect } from '@playwright/test';

test.describe('Token Refresh from Response Headers', () => {
  test('should update localStorage token when X-Authorization and X-Token-Renewed headers are present', async ({ page }) => {
    // Mock API response with token refresh headers
    await page.route('**/api/urls', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'X-Authorization': 'new_refreshed_token_12345',
          'X-Token-Renewed': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true },
        }),
      });
    });

    // Set initial token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'old_token_12345');
    });

    // Trigger an API call by navigating to dashboard
    await page.goto('/dashboard');

    // Wait for the API call to complete
    await page.waitForResponse('**/api/urls');

    // Verify that localStorage token was updated
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('new_refreshed_token_12345');
  });

  test('should NOT update localStorage token when X-Token-Renewed is false', async ({ page }) => {
    // Mock API response without token renewal
    await page.route('**/api/urls', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'X-Authorization': 'some_token',
          'X-Token-Renewed': 'false',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true },
        }),
      });
    });

    // Set initial token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'original_token_12345');
    });

    // Trigger an API call
    await page.goto('/dashboard');

    // Wait for the API call to complete
    await page.waitForResponse('**/api/urls');

    // Verify that localStorage token was NOT updated
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('original_token_12345');
  });

  test('should NOT update localStorage token when X-Authorization header is missing', async ({ page }) => {
    // Mock API response without X-Authorization header
    await page.route('**/api/urls', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'X-Token-Renewed': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          message: 'OK',
          data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, first: true, last: true },
        }),
      });
    });

    // Set initial token in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('token', 'original_token_67890');
    });

    // Trigger an API call
    await page.goto('/dashboard');

    // Wait for the API call to complete
    await page.waitForResponse('**/api/urls');

    // Verify that localStorage token was NOT updated
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBe('original_token_67890');
  });
});
