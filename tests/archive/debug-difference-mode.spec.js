// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Debug Difference Mode Color Consistency Test
 * 
 * This test includes extensive console logging to debug what's happening
 * during the test execution.
 */

test.describe('Debug Difference Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    console.log('Navigating to development URL...');
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Set up console logging from the page
    page.on('console', msg => {
      console.log(`PAGE LOG: ${msg.text()}`);
    });
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    console.log('Page loaded (networkidle)');
    
    await page.waitForTimeout(3000); // Extra wait time for all components to initialize
    console.log('Initial wait completed');
    
    // Execute JavaScript in the page to log page title and URL
    await page.evaluate(() => {
      console.log(`Page loaded: ${document.title} - ${window.location.href}`);
    });
  });

  test('Debug Boomkroonoppervlakte difference mode', async ({ page }) => {
    console.log('Starting test - looking for Boomkroonoppervlakte indicator');
    
    // Clear screenshots folder
    console.log('Capturing initial screenshot');
    await page.screenshot({ path: 'tests/screenshots/debug-initial.png' });
    
    // Inspect dropdown
    console.log('Checking for indicator dropdown...');
    const dropdownExists = await page.getByLabel('selected options').getByRole('textbox').count() > 0;
    console.log(`Dropdown exists: ${dropdownExists}`);
    
    if (dropdownExists) {
      console.log('Clicking dropdown to open options...');
      await page.getByLabel('selected options').getByRole('textbox').click();
      await page.waitForTimeout(1000); // Wait for dropdown to open
      
      // Count options
      const allOptions = await page.getByRole('option').all();
      console.log(`Found ${allOptions.length} options in dropdown`);
      
      // Look specifically for options containing our keywords
      const targetIndicators = ['Boomkroonoppervlakte', 'boomkroonoppervlakte', 'BKB'];
      let foundOptions = [];
      
      for (const keyword of targetIndicators) {
        const matchingOptions = await page.getByRole('option', { name: new RegExp(keyword, 'i') }).all();
        console.log(`Found ${matchingOptions.length} options matching "${keyword}"`);
        
        if (matchingOptions.length > 0) {
          for (const option of matchingOptions) {
            const text = await option.textContent();
            foundOptions.push({ keyword, text });
          }
        }
      }
      
      // Log all found options
      console.log('Found options matching keywords:');
      console.log(JSON.stringify(foundOptions, null, 2));
      
      // Select an option if we found any
      if (foundOptions.length > 0) {
        console.log(`Selecting option: ${foundOptions[0].text}`);
        await page.getByRole('option', { name: foundOptions[0].text }).click();
      } else if (allOptions.length > 0) {
        // Fall back to first option
        const firstOptionText = await allOptions[0].textContent();
        console.log(`No keyword matches, selecting first option: ${firstOptionText}`);
        await allOptions[0].click();
      } else {
        console.log('No options found to select');
      }
      
      // Wait for selection to apply
      console.log('Waiting for selection to apply...');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'tests/screenshots/debug-selected-indicator.png' });
      
      // Inspect the page for AHN-related elements
      console.log('Checking for compare year dropdown...');
      const compareYearSelector = 'select[name="compareYear"]';
      const hasCompareYear = await page.locator(compareYearSelector).count() > 0;
      console.log(`Compare year dropdown exists: ${hasCompareYear}`);
      
      if (hasCompareYear) {
        // Check available options
        const options = await page.locator(compareYearSelector).evaluate(el => {
          return Array.from(el.options)
            .filter(option => option.value && option.value !== '')
            .map(option => ({ value: option.value, text: option.text }));
        });
        
        console.log('Available compare year options:');
        console.log(JSON.stringify(options, null, 2));
        
        // Enable difference mode if options available
        if (options.length > 0) {
          console.log(`Selecting compare year: ${options[0].text}`);
          await page.locator(compareYearSelector).selectOption({ label: options[0].text });
          console.log('Waiting for difference mode to apply...');
          await page.waitForTimeout(3000);
          
          // Capture difference mode state
          console.log('Capturing difference mode screenshot');
          await page.screenshot({ path: 'tests/screenshots/debug-difference-mode.png' });
          
          // Capture map and beeswarm if available
          await captureComponentScreenshots(page, 'difference-mode');
          
          // Now disable difference mode
          console.log('Disabling difference mode');
          await page.locator(compareYearSelector).selectOption({ label: '' });
          await page.waitForTimeout(2000);
          
          // Capture normal mode state again
          console.log('Capturing normal mode screenshot after disabling difference mode');
          await page.screenshot({ path: 'tests/screenshots/debug-normal-mode-restored.png' });
        } else {
          console.log('No compare year options available despite dropdown being present');
        }
      } else {
        console.log('No compare year dropdown found - indicator likely does not support difference mode');
        
        // Check for any AHN-related elements in the page
        const ahnElements = await page.evaluate(() => {
          // Look for elements containing "AHN" text
          const elements = Array.from(document.querySelectorAll('*'));
          const ahnElements = elements.filter(el => 
            el.textContent && 
            el.textContent.includes('AHN')
          );
          
          return ahnElements.map(el => ({
            tag: el.tagName,
            id: el.id || null,
            class: el.className || null,
            text: el.textContent?.substring(0, 50) + (el.textContent?.length > 50 ? '...' : '')
          }));
        });
        
        console.log('Elements containing "AHN" text:');
        console.log(JSON.stringify(ahnElements, null, 2));
      }
    } else {
      console.log('No indicator dropdown found - test cannot proceed');
    }
  });
});

/**
 * Helper function to capture screenshots of map and beeswarm components
 */
async function captureComponentScreenshots(page, stateName) {
  console.log(`Capturing component screenshots for state: ${stateName}`);
  
  // Try to capture map
  try {
    console.log('Looking for map container...');
    const mapContainer = page.locator('.leaflet-container');
    const mapExists = await mapContainer.count() > 0;
    console.log(`Map container exists: ${mapExists}`);
    
    if (mapExists) {
      console.log('Scrolling to map...');
      await mapContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      const mapBoundingBox = await mapContainer.boundingBox();
      if (mapBoundingBox) {
        console.log(`Capturing map screenshot (${mapBoundingBox.width}x${mapBoundingBox.height})`);
        await page.screenshot({ 
          path: `tests/screenshots/debug-map-${stateName}.png`,
          clip: mapBoundingBox
        });
        console.log(`Map screenshot captured: debug-map-${stateName}.png`);
      } else {
        console.log('Could not get bounding box for map');
      }
    }
  } catch (error) {
    console.log(`Error capturing map: ${error}`);
  }
  
  // Try to capture beeswarm
  try {
    console.log('Looking for beeswarm container...');
    
    // Look for beeswarm using multiple possible selectors
    const beeswarmSelectors = [
      '.beeswarm-container', 
      'svg.beeswarm', 
      '.indicator-container svg',
      '.beeswarm-component',
      // Add debug selector to find any SVG that might be the beeswarm
      'svg'
    ];
    
    // Log all found elements matching our selectors
    for (const selector of beeswarmSelectors) {
      const count = await page.locator(selector).count();
      console.log(`Found ${count} elements matching "${selector}"`);
      
      if (count > 0) {
        // Get details about these elements
        const details = await page.evaluate(sel => {
          const elements = Array.from(document.querySelectorAll(sel));
          return elements.map(el => ({
            tag: el.tagName,
            id: el.id || null,
            class: el.className?.baseVal || el.className || null,
            dimensions: el.getBoundingClientRect ? 
              {
                width: el.getBoundingClientRect().width,
                height: el.getBoundingClientRect().height
              } : null
          }));
        }, selector);
        
        console.log(`Details for "${selector}":`);
        console.log(JSON.stringify(details, null, 2));
      }
    }
    
    // Try to capture the first matching element from our selectors
    let beeswarmCaptured = false;
    
    for (const selector of beeswarmSelectors) {
      if (beeswarmCaptured) break;
      
      const beeswarm = page.locator(selector).first();
      if (await beeswarm.count() > 0) {
        console.log(`Found beeswarm with selector: ${selector}`);
        
        try {
          console.log('Scrolling to beeswarm...');
          await beeswarm.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1000);
          
          const boundingBox = await beeswarm.boundingBox();
          if (boundingBox && boundingBox.width > 10 && boundingBox.height > 10) {
            console.log(`Capturing beeswarm screenshot (${boundingBox.width}x${boundingBox.height})`);
            await page.screenshot({ 
              path: `tests/screenshots/debug-beeswarm-${stateName}.png`,
              clip: boundingBox
            });
            console.log(`Beeswarm screenshot captured: debug-beeswarm-${stateName}.png`);
            beeswarmCaptured = true;
          } else {
            console.log(`Beeswarm bounding box too small or not found: ${JSON.stringify(boundingBox)}`);
          }
        } catch (error) {
          console.log(`Error working with beeswarm element: ${error}`);
        }
      }
    }
    
    if (!beeswarmCaptured) {
      console.log('Could not capture any beeswarm element');
    }
  } catch (error) {
    console.log(`Error capturing beeswarm: ${error}`);
  }
}
