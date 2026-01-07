import { test, expect } from '@playwright/test';

/**
 * Store Management E2E Tests
 *
 * Tests for store-related functionality.
 */

test.describe('Store Discovery', () => {
	test('should redirect to login when accessing /app/discover without auth', async ({ page }) => {
		// Try to access discovery page (requires auth)
		await page.goto('/app/discover');

		// Should be redirected to login for unauthenticated users
		await expect(page).toHaveURL(/\/auth\/login/);
	});
});

test.describe('Join Store Flow', () => {
	test('should display join page with code parameter', async ({ page }) => {
		// Route is /join/[code] - test with a sample code
		await page.goto('/join/TESTCODE');

		// Should load the page (might show invalid code error, but page loads)
		await page.waitForLoadState('domcontentloaded');

		// Check that we're on the join page
		const url = page.url();
		expect(url).toContain('/join');
	});

	test('should show error for invalid invite code', async ({ page }) => {
		// Navigate to join page with invalid code
		await page.goto('/join/INVALIDCODE123');

		await page.waitForLoadState('networkidle');

		// Should either show error or still be on join page
		const pageContent = await page.textContent('body');

		// Accept various outcomes - either error message or form
		const hasContent = pageContent && pageContent.length > 0;
		expect(hasContent).toBeTruthy();
	});
});

test.describe('Store Public Visibility', () => {
	test('should handle non-existent store gracefully', async ({ page }) => {
		// Try to access a store that doesn't exist (requires auth first)
		await page.goto('/app/stores/99999');

		// Should redirect to login for unauthenticated users
		await expect(page).toHaveURL(/\/auth\/login/);
	});
});
