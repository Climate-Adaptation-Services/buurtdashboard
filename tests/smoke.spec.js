// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('buurtdashboard-tutorial-seen', 'true');
    });
    await page.goto('/?config=dordrecht');
    // Wait for the app container to appear instead of fixed timeout
    await page.waitForSelector('.container', { timeout: 15000 });
  });

  test('Application loads and shows indicators', async ({ page }) => {
    // At least one indicator card must be visible
    await expect(page.locator('.indicator').first()).toBeVisible({ timeout: 15000 });
  });

  test('Map renders with paths', async ({ page }) => {
    // Wait for Leaflet map container to appear (SVG paths inside Leaflet may be few initially)
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
    const pathCount = await page.locator('svg path').count();
    expect(pathCount).toBeGreaterThan(0);
  });

  test('No NaN values in the UI', async ({ page }) => {
    // Wait for indicators to render (indicator-stats is visibility:hidden for Dordrecht, use indicator instead)
    await page.waitForSelector('.indicator', { timeout: 20000 });
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');
    expect(bodyText).not.toContain('undefined');
  });

  test('No critical JavaScript errors', async ({ page }) => {
    const criticalErrors = [];

    page.on('pageerror', error => criticalErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known SVG rendering edge cases
        if (!text.includes('<path>') && !text.includes('<rect>') &&
            !text.includes('<text>') && !text.includes('<line>') &&
            !text.includes('font')) {
          criticalErrors.push(text);
        }
      }
    });

    await page.reload();
    await page.waitForSelector('.container', { timeout: 15000 });

    // Allow up to 1 error for known edge cases (e.g. font loading)
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });
});
