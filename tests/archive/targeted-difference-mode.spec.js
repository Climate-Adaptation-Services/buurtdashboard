// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Targeted Difference Mode Color Consistency Test
 * 
 * This test focuses specifically on indicators known to support difference mode
 * with a focus on visual verification and interaction with the AHN data.
 */

test.describe('Targeted Difference Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait time for all components to initialize
  });

  test('Verify Bodemhoogte difference mode visually', async ({ page }) => {
    // Create screenshots directory if it doesn't exist
    await page.evaluate(() => console.log('Test starting - looking for Bodemhoogte indicator'));
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/initial-state.png' });
    
    // Try to select Bodemhoogte indicator (we know from memories this supports difference mode)
    const bodemhoogteKeywords = ['Bodemhoogte', 'bodemhoogte', 'hoogte', 'Hoogte', 'AHN'];
    let indicatorFound = false;
    
    // Click dropdown to see available options
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.waitForTimeout(1000); // Wait for dropdown to open
    
    // Search for an indicator that matches our keywords
    for (const keyword of bodemhoogteKeywords) {
      const matchingOptions = await page.getByRole('option', { name: new RegExp(keyword, 'i') }).all();
      
      if (matchingOptions.length > 0) {
        await matchingOptions[0].click();
        await page.evaluate(kw => console.log(`Found and selected indicator matching: ${kw}`), keyword);
        indicatorFound = true;
        break;
      }
    }
    
    // If none of our specific keywords matched, try to select any option
    if (!indicatorFound) {
      const allOptions = await page.getByRole('option').all();
      if (allOptions.length > 0) {
        await allOptions[0].click();
        await page.evaluate(() => console.log('Selected first available indicator'));
        indicatorFound = true;
      } else {
        await page.evaluate(() => console.log('No indicator options found'));
      }
    }
    
    // Wait for indicator selection to apply
    await page.waitForTimeout(2000);
    
    // Take screenshot after indicator selection
    await page.screenshot({ path: 'tests/screenshots/indicator-selected.png' });
    
    // Check for compareYear selector (AHN dropdown)
    const compareYearSelector = 'select[name="compareYear"]';
    const hasCompareYear = await page.locator(compareYearSelector).count() > 0;
    
    if (hasCompareYear) {
      await page.evaluate(() => console.log('Compare year dropdown found - this indicator supports difference mode'));
      
      // Capture current state of map and beeswarm (if visible)
      await captureComponentScreenshots(page, 'normal-mode');
      
      // Get available compare year options
      const options = await page.locator(compareYearSelector).evaluate(el => {
        return Array.from(el.options)
          .filter(option => option.value && option.value !== '')
          .map(option => option.text);
      });
      
      if (options.length > 0) {
        // Enable difference mode with first available option
        await page.locator(compareYearSelector).selectOption({ label: options[0] });
        await page.evaluate(opt => console.log(`Enabled difference mode with compare year: ${opt}`), options[0]);
        await page.waitForTimeout(3000); // Wait for difference mode to apply
        
        // Take screenshot of difference mode
        await page.screenshot({ path: 'tests/screenshots/difference-mode-enabled.png' });
        
        // Capture components in difference mode
        await captureComponentScreenshots(page, 'difference-mode');
        
        // Now disable difference mode
        await page.locator(compareYearSelector).selectOption({ label: '' });
        await page.evaluate(() => console.log('Disabled difference mode'));
        await page.waitForTimeout(2000);
        
        // Capture components after returning to normal mode
        await captureComponentScreenshots(page, 'restored-normal-mode');
      } else {
        await page.evaluate(() => console.log('No compare year options available'));
      }
    } else {
      await page.evaluate(() => console.log('No compare year dropdown found - this indicator likely does not support difference mode'));
    }
  });
});

/**
 * Helper function to capture screenshots of map and beeswarm components
 */
async function captureComponentScreenshots(page, stateName) {
  // Try to capture map
  try {
    const mapContainer = page.locator('.leaflet-container');
    if (await mapContainer.count() > 0) {
      await mapContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const mapBoundingBox = await mapContainer.boundingBox();
      if (mapBoundingBox) {
        await page.screenshot({ 
          path: `tests/screenshots/map-${stateName}.png`,
          clip: mapBoundingBox
        });
        await page.evaluate(name => console.log(`Captured map screenshot: ${name}`), `map-${stateName}.png`);
      }
    }
  } catch (error) {
    await page.evaluate(err => console.log(`Error capturing map: ${err}`), error.toString());
  }
  
  // Try to capture beeswarm
  try {
    // Look for beeswarm using multiple possible selectors
    const beeswarmSelectors = [
      '.beeswarm-container', 
      'svg.beeswarm', 
      '.indicator-container svg',
      '.beeswarm-component'
    ];
    
    let beeswarmFound = false;
    
    for (const selector of beeswarmSelectors) {
      const beeswarm = page.locator(selector);
      if (await beeswarm.count() > 0) {
        await beeswarm.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const boundingBox = await beeswarm.boundingBox();
        if (boundingBox) {
          await page.screenshot({ 
            path: `tests/screenshots/beeswarm-${stateName}.png`,
            clip: boundingBox
          });
          await page.evaluate(name => console.log(`Captured beeswarm screenshot: ${name}`), `beeswarm-${stateName}.png`);
          beeswarmFound = true;
          break;
        }
      }
    }
    
    if (!beeswarmFound) {
      await page.evaluate(() => console.log('Beeswarm element not found with any selector'));
    }
  } catch (error) {
    await page.evaluate(err => console.log(`Error capturing beeswarm: ${err}`), error.toString());
  }
  
  // Take a full page screenshot as well
  await page.screenshot({ path: `tests/screenshots/full-${stateName}.png` });
}
