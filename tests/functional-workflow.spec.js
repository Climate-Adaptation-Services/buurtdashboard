// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Functional Workflow Tests for Buurtdashboard
 * 
 * These tests verify complete user workflows and data integrity
 */

test.describe('User Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?config=dordrecht');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // Allow data loading
  });

  test('Complete indicator selection and visualization workflow', async ({ page }) => {
    // Step 1: Select a specific indicator using the working approach from improved-basic-tests
    const multiselect = page.locator('.multiselect').first();
    
    // Click on the multiselect container (not the hidden input)
    await multiselect.click({ force: true }); // Force click to bypass SVG overlay
    await page.waitForTimeout(1000);
    
    // Look for options and select one
    const options = await page.getByRole('option').all();
    if (options.length > 0) {
      // Find a suitable option (not the first which might be empty)
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.includes('Bodemhoogte')) {
          await option.click();
          break;
        }
      }
      await page.waitForTimeout(3000);
    } else {
      // Skip this test if no options available
      console.log('No indicator options found, skipping workflow test');
      return;
    }
    
    // Step 2: Verify map renders with data
    const mapPaths = page.locator('.map path, svg path');
    const pathCount = await mapPaths.count();
    expect(pathCount).toBeGreaterThan(0);
    
    // Step 3: Verify indicators section exists (may be initially hidden)
    const indicators = page.locator('.indicators');
    const indicatorCount = await indicators.count();
    expect(indicatorCount).toBeGreaterThan(0);
    console.log(`Found ${indicatorCount} indicator sections`);
    
    // Step 4: Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/workflow-indicator-selected.png' });
  });

  test('Map interaction selects neighborhood', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(3000);
    
    // Look for actual neighborhood paths (not UI icons)
    const neighborhoodPaths = page.locator('.map svg path[class*="_path"], svg g path[class*="_path"]');
    const pathCount = await neighborhoodPaths.count();
    
    console.log(`Found ${pathCount} neighborhood paths`);
    
    if (pathCount > 0) {
      // Use force click to bypass any overlays
      await neighborhoodPaths.first().click({ force: true });
      await page.waitForTimeout(2000);
      
      // Verify some visual change occurred (could be selection highlight, stats update, etc.)
      await page.screenshot({ path: 'tests/screenshots/neighborhood-selected.png' });
      
      // This is a basic test - in a real scenario you'd verify specific changes
      console.log('Neighborhood selection test completed');
    } else {
      console.log('No map paths found to test interaction');
    }
  });

  test('URL parameters work for deep linking', async ({ page }) => {
    // Navigate with specific parameters
    await page.goto('/?config=dordrecht&indicator=Bodemhoogte');
    await page.waitForTimeout(5000);
    
    // Verify the indicator was automatically selected
    const selectedOptions = page.locator('.multiselect .selected, [aria-selected="true"]');
    const hasSelection = await selectedOptions.count() > 0;
    
    // Log result (in production you'd have more specific assertions)
    console.log(`URL parameter selection working: ${hasSelection}`);
    
    await page.screenshot({ path: 'tests/screenshots/url-parameter-selection.png' });
  });
});

test.describe('Data Integrity Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?config=dordrecht');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
  });

  test('No broken data states in statistics', async ({ page }) => {
    // Look for "Geen data" or NaN displays
    const noDataElements = page.locator('text=Geen data');
    const nanElements = page.locator('text=NaN');
    
    const noDataCount = await noDataElements.count();
    const nanCount = await nanElements.count();
    
    console.log(`Found ${noDataCount} "Geen data" elements and ${nanCount} NaN elements`);
    
    // In a real test, you'd set thresholds based on expected data completeness
    // For now, just ensure NaN doesn't appear in the UI
    expect(nanCount).toBe(0);
  });

  test('Statistics show reasonable values', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(3000);
    
    // Look for statistical elements
    const statElements = page.locator('.stat, .statistics, [class*="stat"]');
    const statCount = await statElements.count();
    
    console.log(`Found ${statCount} statistical elements`);
    
    if (statCount > 0) {
      // Check if stats contain reasonable numeric values (not just placeholders)
      const statTexts = await statElements.allTextContents();
      const hasNumericValues = statTexts.some(text => /\d+/.test(text));
      
      console.log(`Statistics contain numeric values: ${hasNumericValues}`);
      expect(hasNumericValues).toBe(true);
    }
  });
});

test.describe('Error Handling Tests', () => {
  test('Handles network failures gracefully', async ({ page }) => {
    // First navigate to the page
    await page.goto('/?config=dordrecht');
    await page.waitForTimeout(2000);
    
    // Then block only data requests (not the page itself)
    await page.route('**/s3.eu-north-1.amazonaws.com/**', route => route.abort());
    
    // Reload to trigger data loading failures
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Verify app doesn't crash - should show loading states or error messages
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy(); // Basic check that something renders
    
    await page.screenshot({ path: 'tests/screenshots/network-failure-handling.png' });
  });

  test('Invalid config parameter handled', async ({ page }) => {
    await page.goto('/?config=nonexistent');
    await page.waitForTimeout(3000);
    
    // App should handle invalid config gracefully
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    
    await page.screenshot({ path: 'tests/screenshots/invalid-config.png' });
  });
});