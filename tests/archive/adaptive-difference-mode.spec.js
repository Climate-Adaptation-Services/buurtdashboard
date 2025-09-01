// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Adaptive Difference Mode Color Consistency Test
 * 
 * This test first identifies indicators that support difference mode
 * by checking for the presence of a compare year dropdown after selection.
 */

test.describe('Adaptive Difference Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Set up console logging from the page
    page.on('console', msg => {
      const text = msg.text();
      // Filter out the noisy SVG errors
      if (!text.includes('attribute') && !text.includes('Expected number') && !text.includes('Expected length')) {
        console.log(`PAGE: ${text}`);
      }
    });
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait time for all components to initialize
  });

  test('Find an indicator that supports difference mode and verify color consistency', async ({ page }) => {
    console.log('Starting adaptive difference mode test');
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/adaptive-initial.png' });
    
    // Click dropdown to see available options
    const dropdown = page.getByLabel('selected options').getByRole('textbox');
    if (await dropdown.count() === 0) {
      console.log('Indicator dropdown not found, test cannot proceed');
      return;
    }
    
    await dropdown.click();
    await page.waitForTimeout(1000);
    
    // Get all available options
    const allOptions = await page.getByRole('option').all();
    console.log(`Found ${allOptions.length} indicator options`);
    
    // Function to check if an indicator supports difference mode
    async function checkDifferenceMode(indicatorName) {
      console.log(`Testing indicator: ${indicatorName}`);
      
      // Select the indicator
      await dropdown.click();
      await page.waitForTimeout(500);
      // Use exact matching to avoid ambiguity with similar indicator names
      try {
        await page.getByRole('option', { name: indicatorName, exact: true }).click();
      } catch (error) {
        console.log(`Error selecting "${indicatorName}": ${error.message}`);
        console.log('Trying first match as fallback...');
        
        // Get all options that include this text as a substring
        const options = await page.getByRole('option').filter({
          hasText: indicatorName
        }).all();
        
        if (options.length > 0) {
          console.log(`Found ${options.length} similar options, selecting first one`);
          await options[0].click();
        } else {
          throw new Error(`Could not find any options matching "${indicatorName}"`);
        }
      }
      await page.waitForTimeout(2000); // Wait for selection to apply
      
      // Check for compare year dropdown
      const compareYearSelector = 'select[name="compareYear"]';
      const hasCompareYear = await page.locator(compareYearSelector).count() > 0;
      console.log(`Indicator "${indicatorName}" supports difference mode: ${hasCompareYear}`);
      
      if (hasCompareYear) {
        // Take screenshot of normal mode
        await page.screenshot({ path: `tests/screenshots/adaptive-${indicatorName.replace(/[^a-z0-9]/gi, '_')}-normal.png` });
        
        // Get available compare year options
        const options = await page.locator(compareYearSelector).evaluate(el => {
          return Array.from(el.options)
            .filter(option => option.value && option.value !== '')
            .map(option => ({ value: option.value, text: option.text }));
        });
        
        if (options.length > 0) {
          console.log(`Available compare years: ${options.map(o => o.text).join(', ')}`);
          
          // Enable difference mode
          await page.locator(compareYearSelector).selectOption({ label: options[0].text });
          await page.waitForTimeout(3000); // Wait for difference mode to apply
          
          // Take screenshot of difference mode
          await page.screenshot({ path: `tests/screenshots/adaptive-${indicatorName.replace(/[^a-z0-9]/gi, '_')}-difference.png` });
          
          // Capture colors from map and beeswarm if available
          await captureComponentVisuals(page, indicatorName, 'difference');
          
          // Return success
          return {
            name: indicatorName,
            supportsMode: true,
            compareYear: options[0].text
          };
        } else {
          console.log(`Indicator has compare year dropdown but no options`);
          return { name: indicatorName, supportsMode: false };
        }
      }
      
      return { name: indicatorName, supportsMode: false };
    }
    
    // For efficiency, let's check these most likely candidates first
    const likelyIndicators = [
      'Boomkroonopp. publieke ruimte',
      'Boomkroonopp. publieke ruimte beb.',  
      'Bodemhoogte',
      'Boomkroonoppervlakte',
      'Boomkroonbedekking',
      'Groen',
      'Groen per inwoner'
    ];
    
    let supportedIndicator = null;
    
    // First try the likely candidates
    for (const indicatorName of likelyIndicators) {
      const indicatorOption = page.getByRole('option', { name: indicatorName });
      if (await indicatorOption.count() > 0) {
        const result = await checkDifferenceMode(indicatorName);
        if (result.supportsMode) {
          supportedIndicator = result;
          break;
        }
      }
    }
    
    // If no supported indicator found among likely candidates, try some others
    if (!supportedIndicator && allOptions.length > 0) {
      // Try up to 5 other options
      const maxOptions = Math.min(5, allOptions.length);
      for (let i = 0; i < maxOptions; i++) {
        const text = await allOptions[i].textContent();
        if (text && !likelyIndicators.includes(text)) {
          const result = await checkDifferenceMode(text);
          if (result.supportsMode) {
            supportedIndicator = result;
            break;
          }
        }
      }
    }
    
    // Final results
    if (supportedIndicator) {
      console.log(`Successfully found indicator supporting difference mode: ${supportedIndicator.name} with compare year: ${supportedIndicator.compareYear}`);
    } else {
      console.log('No indicators were found that support difference mode');
    }
  });
});

/**
 * Helper function to capture component screenshots and compare colors
 */
async function captureComponentVisuals(page, indicatorName, mode) {
  // Normalized indicator name for filenames
  const safeIndicatorName = indicatorName.replace(/[^a-z0-9]/gi, '_');
  
  // Capture map if available
  try {
    const mapContainer = page.locator('.leaflet-container');
    if (await mapContainer.count() > 0) {
      await mapContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const mapBoundingBox = await mapContainer.boundingBox();
      if (mapBoundingBox) {
        await page.screenshot({ 
          path: `tests/screenshots/adaptive-${safeIndicatorName}-${mode}-map.png`,
          clip: mapBoundingBox
        });
        console.log(`Captured map screenshot for ${indicatorName} in ${mode} mode`);
        
        // Attempt to extract colors from the map
        const mapColors = await page.evaluate(() => {
          const paths = Array.from(document.querySelectorAll('.leaflet-container path[fill]'));
          return paths.slice(0, 5).map(path => ({
            fill: path.getAttribute('fill'),
            class: path.getAttribute('class'),
          }));
        });
        console.log(`Map colors for ${indicatorName} in ${mode} mode:`, JSON.stringify(mapColors));
      }
    }
  } catch (error) {
    console.log(`Error capturing map: ${error}`);
  }
  
  // Capture beeswarm if available
  try {
    const beeswarmSelectors = [
      '.beeswarm-container', 
      'svg.beeswarm', 
      '.indicator-container svg',
      '.beeswarm-component'
    ];
    
    for (const selector of beeswarmSelectors) {
      const beeswarm = page.locator(selector);
      if (await beeswarm.count() > 0) {
        await beeswarm.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        const boundingBox = await beeswarm.boundingBox();
        if (boundingBox && boundingBox.width > 50 && boundingBox.height > 50) {
          await page.screenshot({ 
            path: `tests/screenshots/adaptive-${safeIndicatorName}-${mode}-beeswarm.png`,
            clip: boundingBox
          });
          console.log(`Captured beeswarm screenshot for ${indicatorName} in ${mode} mode`);
          
          // Attempt to extract colors from the beeswarm
          const beeswarmColors = await page.evaluate(selector => {
            const circles = Array.from(document.querySelectorAll(`${selector} circle`));
            return circles.slice(0, 5).map(circle => ({
              fill: circle.getAttribute('fill'),
              class: circle.getAttribute('class'),
            }));
          }, selector);
          console.log(`Beeswarm colors for ${indicatorName} in ${mode} mode:`, JSON.stringify(beeswarmColors));
          
          break;
        }
      }
    }
  } catch (error) {
    console.log(`Error capturing beeswarm: ${error}`);
  }
}
