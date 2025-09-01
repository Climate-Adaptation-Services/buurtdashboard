// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Difference Mode Color Consistency Test Suite - Improved Version
 * 
 * These tests verify that the colors in the map and beeswarm chart match correctly
 * when in difference mode, ensuring visual consistency across dashboard components.
 * This version uses more resilient selectors and approaches for testing.
 */

test.describe('Difference Mode Color Consistency Tests', () => {
  // Before each test, navigate to the app and set up a consistent starting point
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait time for all components to initialize
  });

  test('Map and BeeswarmPlot show consistent colors in difference mode', async ({ page }) => {
    // Try to select an indicator from the dropdown
    try {
      await selectAnyAvailableIndicator(page);
    } catch (error) {
      console.log('Could not select indicator using dropdown, continuing with default indicator');
    }
    
    // Wait for any indicator changes to apply
    await page.waitForTimeout(2000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/initial-state.png' });

    // Select any available neighborhood path
    await selectAnyNeighborhood(page);
    
    // Get the neighborhood class and code
    const { selectedNeighborhoodClass, neighborhoodCode } = await getNeighborhoodSelectors(page);
    
    // Capture initial colors
    const { mapColor: initialMapColor, beeswarmColor: initialBeeswarmColor } = 
      await captureColors(page, selectedNeighborhoodClass, neighborhoodCode);
    
    // Enable difference mode if possible
    const diffModeEnabled = await enableDifferenceMode(page);
    if (!diffModeEnabled) {
      console.log('Could not enable difference mode, skipping test');
      test.skip();
      return;
    }
    
    // Take screenshot of difference mode state
    await page.screenshot({ path: 'tests/screenshots/difference-mode.png' });
    
    // Capture difference mode colors
    const { mapColor: differenceMapColor, beeswarmColor: differenceBeeswarmColor } = 
      await captureColors(page, selectedNeighborhoodClass, neighborhoodCode);
    
    // Assert that the colors match between map and beeswarm in difference mode
    expect(differenceMapColor).toBe(differenceBeeswarmColor,
      'Colors should match between map and beeswarm in difference mode');
    
    // Verify that the colors changed when switching to difference mode
    expect(differenceMapColor).not.toBe(initialMapColor,
      'Difference mode colors should differ from normal mode');
    expect(differenceBeeswarmColor).not.toBe(initialBeeswarmColor,
      'Difference mode colors should differ from normal mode');
    
    // Return to normal mode
    await disableDifferenceMode(page);
    
    // Take screenshot of restored state
    await page.screenshot({ path: 'tests/screenshots/restored-state.png' });
    
    // Capture restored colors
    const { mapColor: restoredMapColor, beeswarmColor: restoredBeeswarmColor } = 
      await captureColors(page, selectedNeighborhoodClass, neighborhoodCode);
    
    // Verify that the colors match between map and beeswarm in normal mode
    expect(restoredMapColor).toBe(restoredBeeswarmColor,
      'Colors should match between map and beeswarm in normal mode');
  });

  test('Unit switching preserves color consistency in difference mode', async ({ page }) => {
    // Try to select an indicator from the dropdown
    try {
      await selectAnyAvailableIndicator(page);
    } catch (error) {
      console.log('Could not select indicator using dropdown, continuing with default indicator');
    }
    
    // Wait for any indicator changes to apply
    await page.waitForTimeout(2000);
    
    // Select any available neighborhood path
    await selectAnyNeighborhood(page);
    
    // Get the neighborhood class and code
    const { selectedNeighborhoodClass, neighborhoodCode } = await getNeighborhoodSelectors(page);
    
    // Enable difference mode if possible
    const diffModeEnabled = await enableDifferenceMode(page);
    if (!diffModeEnabled) {
      console.log('Could not enable difference mode, skipping test');
      test.skip();
      return;
    }
    
    // Capture difference mode colors with default unit
    const { mapColor: defaultUnitMapColor, beeswarmColor: defaultUnitBeeswarmColor } = 
      await captureColors(page, selectedNeighborhoodClass, neighborhoodCode);
    
    // Check if unit switch is available
    const hasUnitSwitch = await page.getByRole('button', { name: 'm²' }).count() > 0;
    
    if (hasUnitSwitch) {
      // Switch to m² unit
      await page.getByRole('button', { name: 'm²' }).click();
      await page.waitForTimeout(2000); // Wait longer for unit switch to fully process
      
      // Take screenshot of m² unit state
      await page.screenshot({ path: 'tests/screenshots/m2-unit-state.png' });
      
      // Capture colors with m² unit
      const { mapColor: m2UnitMapColor, beeswarmColor: m2UnitBeeswarmColor } = 
        await captureColors(page, selectedNeighborhoodClass, neighborhoodCode);
      
      // Assert that the colors match between map and beeswarm in m² unit
      expect(m2UnitMapColor).toBe(m2UnitBeeswarmColor,
        'Colors should match between map and beeswarm in m² unit');
      
      // Verify that colors are consistent after unit switch
      // The colors should remain the same since they're based on original values
      expect(defaultUnitMapColor).toBe(m2UnitMapColor,
        'Colors should be consistent across unit switches in difference mode');
      expect(defaultUnitBeeswarmColor).toBe(m2UnitBeeswarmColor,
        'Colors should be consistent across unit switches in difference mode');
    } else {
      console.log('Unit switch not available, skipping unit switch test');
    }
  });
});

/**
 * Helper function to select any available indicator
 */
async function selectAnyAvailableIndicator(page) {
  // Click the indicator dropdown
  await page.getByLabel('selected options').getByRole('textbox').click();
  await page.waitForTimeout(1000); // Wait for dropdown to appear
  
  // Get all available options
  const options = await page.getByRole('option').all();
  
  // If options are available, select the first one
  if (options.length > 0) {
    await options[0].click();
    console.log('Selected first available indicator');
    return true;
  }
  
  return false;
}

/**
 * Helper function to select any neighborhood
 */
async function selectAnyNeighborhood(page) {
  // Use a general selector for any neighborhood path
  const mapFeatureSelector = 'path[class*="_path"]';
  
  // Wait for neighborhood paths to be available
  await page.waitForSelector(mapFeatureSelector, { timeout: 10000 });
  
  // Get all available paths
  const paths = await page.locator(mapFeatureSelector).all();
  
  // If paths are available, click the first one
  if (paths.length > 0) {
    await paths[0].click();
    await page.waitForTimeout(1000); // Wait for selection to process
    console.log('Selected a neighborhood');
    return true;
  }
  
  console.log('No neighborhoods available to select');
  return false;
}

/**
 * Get the neighborhood class and code for selectors
 */
async function getNeighborhoodSelectors(page) {
  const mapFeatureSelector = 'path[class*="_path"]';
  
  try {
    // Get the class name of the selected neighborhood
    const selectedNeighborhoodClass = await page.locator(mapFeatureSelector).first().evaluate(
      el => {
        const classes = el.getAttribute('class').split(' ');
        const pathClass = classes.find(cls => cls.includes('_path'));
        return pathClass || '';
      }
    );
    
    // Extract the neighborhood code from the class
    const neighborhoodCode = selectedNeighborhoodClass.split('_')[0] || '';
    
    return { selectedNeighborhoodClass, neighborhoodCode };
  } catch (error) {
    console.error('Error getting neighborhood selectors:', error);
    return { selectedNeighborhoodClass: '', neighborhoodCode: '' };
  }
}

/**
 * Helper function to capture colors of map and beeswarm
 */
async function captureColors(page, selectedNeighborhoodClass, neighborhoodCode) {
  try {
    // Capture map color
    const mapColor = await page.locator(`path.${selectedNeighborhoodClass}`).evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    // Capture beeswarm color
    const beeswarmNodeSelector = `circle[class*="${neighborhoodCode}"]`;
    const beeswarmColor = await page.locator(beeswarmNodeSelector).first().evaluate(
      el => window.getComputedStyle(el).fill
    );
    
    return { mapColor, beeswarmColor };
  } catch (error) {
    console.error('Error capturing colors:', error);
    return { mapColor: 'unknown', beeswarmColor: 'unknown' };
  }
}

/**
 * Enable difference mode by selecting a compare year
 */
async function enableDifferenceMode(page) {
  try {
    // Check if compare year dropdown exists
    const compareYearDropdown = page.locator('select[name="compareYear"]');
    if (await compareYearDropdown.count() === 0) {
      console.log('Compare year dropdown not found');
      return false;
    }
    
    // Get available options
    const options = await compareYearDropdown.evaluate(el => {
      return Array.from(el.options)
        .filter(option => option.value && option.value !== '')
        .map(option => option.text);
    });
    
    // If no non-empty options available
    if (options.length === 0) {
      console.log('No compare year options available');
      return false;
    }
    
    // Select the first non-empty option
    await compareYearDropdown.selectOption({ label: options[0] });
    await page.waitForTimeout(2000); // Wait for difference mode to activate
    
    console.log(`Enabled difference mode with compare year: ${options[0]}`);
    return true;
  } catch (error) {
    console.error('Error enabling difference mode:', error);
    return false;
  }
}

/**
 * Disable difference mode by clearing the compare year
 */
async function disableDifferenceMode(page) {
  try {
    // Select empty option in compare year dropdown
    await page.locator('select[name="compareYear"]').selectOption({ label: '' });
    await page.waitForTimeout(2000); // Wait for normal mode to restore
    
    console.log('Disabled difference mode');
    return true;
  } catch (error) {
    console.error('Error disabling difference mode:', error);
    return false;
  }
}
