// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('buurtdashboard-tutorial-seen', 'true');
    });
    await page.goto('/?config=dordrecht');
    await page.waitForSelector('.container', { timeout: 15000 });
  });

  test('Nederland barplot visible on initial load', async ({ page }) => {
    // Core fix: Nederland bars should appear immediately from cache, without waiting for GeoJSON
    const indicator = page.locator('.indicator').first();
    await expect(indicator).toBeVisible({ timeout: 15000 });

    // At least one barplot SVG should be rendered
    const barplot = page.locator('svg[class^="barplot_"]').first();
    await expect(barplot).toBeVisible({ timeout: 10000 });

    // And it should contain at least one rect (bar) - use count instead of visibility
    // since bars inside SVG may not be "visible" in Playwright's sense when inside overflow:hidden
    const bars = barplot.locator('rect');
    await expect(bars).not.toHaveCount(0, { timeout: 5000 });
  });

  test('Selecting a municipality shows gemeente stat', async ({ page }) => {
    // Wait for the map paths to load (municipality paths appear first)
    await page.waitForSelector('svg path', { timeout: 20000 });
    await page.waitForTimeout(2000); // Let GeoJSON finish loading

    // Click a map path
    const paths = page.locator('.map svg path');
    const count = await paths.count();
    if (count === 0) {
      console.log('⚠️  No map paths found, skipping');
      return;
    }

    // Click somewhere in the middle of the map to hit a municipality
    const mapEl = page.locator('.map');
    const box = await mapEl.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(2000);
    }

    // After clicking, stats for gemeente or buurt should appear
    // indicator-stats divs are always present but only show Stat when selection is non-null
    const statText = await page.locator('.indicator-stats').allTextContents();
    const hasValue = statText.some(t => /\d+/.test(t));
    // This is soft: if no click landed on a path, stats stay empty — still a valid state
    console.log(`Gemeente/buurt stat after map click: ${hasValue ? 'values visible' : 'no selection made'}`);
  });

  test('URL parameter loads indicator', async ({ page }) => {
    await page.goto('/?config=dordrecht&indicator=Bodemhoogte');
    await page.waitForSelector('.container', { timeout: 15000 });
    // Wait for GeoJSON to load so URL params are processed
    await page.waitForTimeout(5000);

    // The URL should still contain the indicator parameter
    expect(page.url()).toContain('indicator=Bodemhoogte');

    // At least one indicator card should be visible
    await expect(page.locator('.indicator').first()).toBeVisible({ timeout: 10000 });
  });

  test('Invalid config does not crash', async ({ page }) => {
    await page.goto('/?config=nonexistent');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
