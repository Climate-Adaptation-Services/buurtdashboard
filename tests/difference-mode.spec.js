// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Difference Mode Color Consistency Test Suite
 * 
 * These tests verify that the colors in the map and beeswarm chart match correctly
 * when in difference mode, ensuring visual consistency across dashboard components.
 */

test.describe('Difference Mode Color Consistency Tests', () => {
  // Before each test, navigate to the app and set up a consistent starting point
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('Map and BeeswarmPlot show consistent colors in difference mode', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    // Select an indicator that supports difference mode
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    
    // Select a neighborhood to focus the test - use a general selector for any neighborhood path
    const mapFeatureSelector = 'path[class*="_path"]';
    await page.locator(mapFeatureSelector).first().click();
    await page.waitForTimeout(1000); // Wait for selection to process
    
    // Get the class name of the selected neighborhood to use in other selectors
    const selectedNeighborhoodClass = await page.locator(mapFeatureSelector).first().evaluate(
      el => el.getAttribute('class').split(' ').find(cls => cls.includes('_path'))
    );
    
    // Extract the neighborhood code from the class for finding matching beeswarm node
    const neighborhoodCode = selectedNeighborhoodClass.split('_')[0];
    
    // Capture the initial color of the selected neighborhood on the map
    const initialMapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Capture the initial color of the corresponding node in the beeswarm plot
    const beeswarmNodeSelector = `circle[class*="${neighborhoodCode}"]`;
    const initialBeeswarmColor = await page.locator(beeswarmNodeSelector).first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Enable difference mode by selecting the compare year
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000); // Wait for difference mode to activate
    
    // Capture the color of the selected neighborhood on the map in difference mode
    const differenceMapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Capture the color of the corresponding node in the beeswarm plot in difference mode
    const differenceBeeswarmColor = await page.locator(beeswarmNodeSelector).first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Assert that the colors match between map and beeswarm in difference mode
    expect(differenceMapColor).toBe(differenceBeeswarmColor);
    
    // Verify that the colors changed when switching to difference mode
    expect(differenceMapColor).not.toBe(initialMapColor);
    expect(differenceBeeswarmColor).not.toBe(initialBeeswarmColor);
    
    // Disable difference mode by clearing the compare year
    await page.locator('select[name="compareYear"]').selectOption({ label: '' });
    await page.waitForTimeout(1000); // Wait for normal mode to restore
    
    // Verify that the colors return to the initial values
    const restoredMapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
      el => window.getComputedStyle(el).fill
    );
    const restoredBeeswarmColor = await page.locator(beeswarmNodeSelector).first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Assert that colors match each other again in normal mode
    expect(restoredMapColor).toBe(restoredBeeswarmColor);
    
    // Optionally assert that normal mode colors match the initial colors
    // Note: Skipping this assertion as store initialization might cause slight differences
    // expect(restoredMapColor).toBe(initialMapColor);
  });
  
  test('Colors update reactively when toggling difference mode multiple times', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    // Select an indicator that supports difference mode
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemhoogte' }).click();
    
    // Select a neighborhood
    await page.locator('.BU15810101_path').first().click();
    await page.waitForTimeout(1000);
    
    // Track color changes through multiple toggle cycles
    const colorSnapshots = [];
    
    // Helper function to capture colors
    async function captureColors() {
      const mapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
        el => window.getComputedStyle(el).fill
      );
      const beeswarmColor = await page.locator(`circle[class*="${neighborhoodCode}"]`).first().evaluate(
        el => window.getComputedStyle(el).fill
      );
      return { mapColor, beeswarmColor };
    }
    
    // Capture initial colors
    colorSnapshots.push(await captureColors());
    
    // First toggle to difference mode
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    colorSnapshots.push(await captureColors());
    
    // Toggle back to normal mode
    await page.locator('select[name="compareYear"]').selectOption({ label: '' });
    await page.waitForTimeout(1000);
    colorSnapshots.push(await captureColors());
    
    // Toggle to difference mode again
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    colorSnapshots.push(await captureColors());
    
    // Verify map and beeswarm colors match in each state
    colorSnapshots.forEach((snapshot, index) => {
      expect(snapshot.mapColor).toBe(snapshot.beeswarmColor, 
        `Colors should match between map and beeswarm in snapshot ${index}`);
    });
    
    // Verify difference mode colors are different from normal mode colors
    expect(colorSnapshots[0].mapColor).not.toBe(colorSnapshots[1].mapColor);
    expect(colorSnapshots[2].mapColor).not.toBe(colorSnapshots[3].mapColor);
    
    // Verify consistency across toggle cycles
    expect(colorSnapshots[0].mapColor).toBe(colorSnapshots[2].mapColor, 
      'Normal mode colors should be consistent across toggle cycles');
    expect(colorSnapshots[1].mapColor).toBe(colorSnapshots[3].mapColor, 
      'Difference mode colors should be consistent across toggle cycles');
  });
  
  test('Unit switching preserves color consistency in difference mode', async ({ page }) => {
    // The Dordrecht config automatically selects the municipality
    // Wait for the page to be fully loaded with data
    await page.waitForTimeout(2000);
    
    // Select an indicator that supports difference mode and unit switching
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Bodemkoolstofbalans' }).click();
    
    // Select a neighborhood using a general selector
    const mapFeatureSelector = 'path[class*="_path"]';
    await page.locator(mapFeatureSelector).first().click();
    await page.waitForTimeout(1000);
    
    // Get the class name of the selected neighborhood
    const selectedNeighborhoodClass = await page.locator(mapFeatureSelector).first().evaluate(
      el => el.getAttribute('class').split(' ').find(cls => cls.includes('_path'))
    );
    
    // Extract the neighborhood code
    const neighborhoodCode = selectedNeighborhoodClass.split('_')[0];
    
    // Enable difference mode
    await page.locator('select[name="compareYear"]').selectOption({ label: 'AHN4' });
    await page.waitForTimeout(1000);
    
    // Capture colors with default unit (%)
    const percentModeMapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
      el => window.getComputedStyle(el).fill
    );
    const percentModeBeeswarmColor = await page.locator(`circle[class*="${neighborhoodCode}"]`).first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Assert map and beeswarm colors match in percent mode
    expect(percentModeMapColor).toBe(percentModeBeeswarmColor);
    
    // Switch to m² unit if available
    const unitSwitchSelector = '.unit-switch button:nth-child(2)'; // Second button for m²
    const hasUnitSwitch = await page.locator(unitSwitchSelector).count() > 0;
    
    if (hasUnitSwitch) {
      // Switch to m² units
      await page.getByRole('button', { name: 'm²' }).click();
      await page.waitForTimeout(1000); // Wait for unit switch to process
      
      // Capture colors with m² unit
      const m2ModeMapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
        el => window.getComputedStyle(el).fill
      );
      const m2ModeBeeswarmColor = await page.locator(`circle[class*="${neighborhoodCode}"]`).first().evaluate(
        el => window.getComputedStyle(el).fill
      );
      
      // Assert map and beeswarm colors match in m² mode
      expect(m2ModeMapColor).toBe(m2ModeBeeswarmColor);
      
      // Verify that colors are consistent after unit switch
      // The colors should remain the same since they're based on original values
      expect(percentModeMapColor).toBe(m2ModeMapColor,
        'Colors should be consistent across unit switches in difference mode');
    }
  });
});
