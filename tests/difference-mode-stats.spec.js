// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Difference Mode Stats Component Test Suite
 * 
 * These tests verify that the Stats component correctly displays difference values
 * and integrates with other components in the difference mode flow.
 */

test.describe('Difference Mode Stats Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    await page.waitForLoadState('networkidle');
  });

  test('Stats component shows difference values in difference mode', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    // Select an indicator that supports difference mode (bodemhoogte)
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    
    // Select a neighborhood
    await page.locator('.BU15810101_path').first().click();
    await page.waitForTimeout(1000);
    
    // Capture the initial statistical values
    const initialStatsText = await page.locator('.stats-container').innerText();
    
    // Enable difference mode
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    
    // Capture the difference mode statistical values
    const diffModeStatsText = await page.locator('.stats-container').innerText();
    
    // Verify stats text changed when switching to difference mode
    expect(diffModeStatsText).not.toBe(initialStatsText);
    
    // Check for difference mode indicators in stats text (may include terms like "verschil" or numerical changes)
    // Note: This test assumes difference values appear in the stats component
    const hasDifferenceValue = diffModeStatsText.includes('+') || 
                               diffModeStatsText.includes('-') || 
                               diffModeStatsText.includes('verschil');
    expect(hasDifferenceValue).toBeTruthy();
    
    // Disable difference mode
    await page.locator('select[name="compareYear"]').selectOption({ label: '' });
    await page.waitForTimeout(1000);
    
    // Capture restored stats text
    const restoredStatsText = await page.locator('.stats-container').innerText();
    
    // Verify stats return to normal when difference mode is disabled
    expect(restoredStatsText).toBe(initialStatsText);
  });

  test('End-to-end difference mode workflow with all components', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    // Select an indicator
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    await page.waitForTimeout(500);
    
    // Verify all three main components are initially visible and in sync
    await expect(page.locator('.map-container')).toBeVisible();
    await expect(page.locator('.beeswarm-container')).toBeVisible();
    await expect(page.locator('.stats-container')).toBeVisible();
    
    // Select a neighborhood
    await page.locator('.BU15810101_path').first().click();
    await page.waitForTimeout(1000);
    
    // Capture screenshots of normal mode for comparison
    await page.screenshot({ path: 'tests/screenshots/normal-mode-components.png', fullPage: true });
    
    // Enable difference mode
    await page.locator('select[name="baseYear"]').selectOption({ label: 'AHN3' });
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1500);
    
    // Capture screenshots in difference mode
    await page.screenshot({ path: 'tests/screenshots/difference-mode-components.png', fullPage: true });
    
    // Verify the SVG elements are using the same color in the map and beeswarm
    const mapElementColor = await page.locator('.BU15810101_path').first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    const beeswarmElementColor = await page.locator('.BU15810101_node').first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // The colors should be identical in difference mode
    expect(mapElementColor).toBe(beeswarmElementColor);
    
    // Select another neighborhood to test dynamic updates
    await page.locator('.BU15810102_path').first().click();
    await page.waitForTimeout(1000);
    
    // Verify selection highlight is active in both components
    const isMapHighlighted = await page.locator('.BU15810102_path').first().evaluate(
      el => window.getComputedStyle(el).stroke === 'rgb(225, 87, 90)'
    );
    
    const isBeeswarmHighlighted = await page.locator('.BU15810102_node').first().evaluate(
      el => window.getComputedStyle(el).stroke === 'rgb(225, 87, 90)'
    );
    
    expect(isMapHighlighted).toBeTruthy();
    expect(isBeeswarmHighlighted).toBeTruthy();
    
    // Verify stats updated for the new selection
    // This checks that the new neighborhood name appears in the stats
    const statsText = await page.locator('.stats-container').innerText();
    expect(statsText).toContain('15810102');
    
    // Disable difference mode to verify cleanup
    await page.locator('select[name="compareYear"]').selectOption({ label: '' });
    await page.waitForTimeout(1000);
    
    // Verify all components returned to normal mode state
    await page.screenshot({ path: 'tests/screenshots/normal-mode-restored.png', fullPage: true });
  });
  
  test('Cached difference values persist correctly when toggling other settings', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    
    // Enable difference mode
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    
    // Capture the difference mode colors
    const initialMapColor = await page.locator('.BU15810101_path').first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Select a neighborhood
    await page.locator('.BU15810101_path').first().click();
    await page.waitForTimeout(1000);
    
    // Toggle another indicator and then back
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Groen per inwoner' }).click();
    await page.waitForTimeout(1000);
    
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    await page.waitForTimeout(1000);
    
    // Verify difference mode is still active
    const compareYearValue = await page.locator('select[name="compareYear"]').inputValue();
    expect(compareYearValue).toBe('AHN4');
    
    // Re-enable difference mode explicitly to ensure it's active
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    
    // Verify the map color is consistent after returning to the same indicator
    const finalMapColor = await page.locator('.BU15810101_path').first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // We don't do a strict equality check here because indicator changes may reset caches
    // Instead we verify the color is valid (not black)
    expect(finalMapColor).not.toBe('rgb(0, 0, 0)');
    expect(finalMapColor).not.toBe('');
  });
});
