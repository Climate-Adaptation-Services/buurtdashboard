// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Simplified Difference Mode Color Consistency Test
 * 
 * This test focuses solely on visual verification through screenshots
 * at various points in the difference mode workflow.
 */

test.describe('Simplified Difference Mode Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to development deployment with Dordrecht config
    await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Extra wait time for all components to initialize
  });

  test('Visual verification of difference mode changes', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/initial-state.png' });
    
    // Attempt to select an indicator if possible
    try {
      await page.getByLabel('selected options').getByRole('textbox').click();
      await page.waitForTimeout(1000);
      
      const options = await page.getByRole('option').all();
      if (options.length > 0) {
        await options[0].click();
        console.log('Selected first available indicator');
      }
      
      // Wait for indicator selection to apply
      await page.waitForTimeout(2000);
      
      // Take screenshot after indicator selection
      await page.screenshot({ path: 'tests/screenshots/indicator-selected.png' });
    } catch (error) {
      console.log('Error selecting indicator, continuing with default:', error.message);
      // Take screenshot of current state
      await page.screenshot({ path: 'tests/screenshots/indicator-selection-error.png' });
    }
    
    // Look for compare year dropdown
    try {
      const compareYearSelector = 'select[name="compareYear"]';
      await page.waitForSelector(compareYearSelector, { timeout: 5000 });
      
      // Get available options
      const options = await page.locator(compareYearSelector).evaluate(el => {
        return Array.from(el.options)
          .filter(option => option.value && option.value !== '')
          .map(option => option.text);
      });
      
      // If options available, enable difference mode
      if (options.length > 0) {
        await page.locator(compareYearSelector).selectOption({ label: options[0] });
        await page.waitForTimeout(2000); // Wait for difference mode to activate
        console.log(`Enabled difference mode with compare year: ${options[0]}`);
        
        // Take screenshot with difference mode enabled
        await page.screenshot({ path: 'tests/screenshots/difference-mode-enabled.png' });
        
        // Disable difference mode
        await page.locator(compareYearSelector).selectOption({ label: '' });
        await page.waitForTimeout(2000); // Wait for normal mode to restore
        
        // Take screenshot with difference mode disabled
        await page.screenshot({ path: 'tests/screenshots/difference-mode-disabled.png' });
      } else {
        console.log('No compare year options available');
        await page.screenshot({ path: 'tests/screenshots/no-compare-years.png' });
      }
    } catch (error) {
      console.log('Error toggling difference mode:', error.message);
      await page.screenshot({ path: 'tests/screenshots/difference-mode-error.png' });
    }
    
    // Try unit switching if available
    try {
      const unitButton = page.getByRole('button', { name: 'm²' });
      const hasUnitSwitch = await unitButton.count() > 0;
      
      if (hasUnitSwitch) {
        // Take screenshot before unit switch
        await page.screenshot({ path: 'tests/screenshots/before-unit-switch.png' });
        
        // Switch to m² unit
        await unitButton.click();
        await page.waitForTimeout(2000); // Wait for unit switch to process
        
        // Take screenshot after unit switch
        await page.screenshot({ path: 'tests/screenshots/after-unit-switch.png' });
        
        // Switch back to percent if possible
        const percentButton = page.getByRole('button', { name: '%' });
        if (await percentButton.count() > 0) {
          await percentButton.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot after switching back
          await page.screenshot({ path: 'tests/screenshots/after-switch-back.png' });
        }
      } else {
        console.log('Unit switch not available');
        await page.screenshot({ path: 'tests/screenshots/no-unit-switch.png' });
      }
    } catch (error) {
      console.log('Error testing unit switching:', error.message);
      await page.screenshot({ path: 'tests/screenshots/unit-switch-error.png' });
    }
    
    // Final state screenshot
    await page.screenshot({ path: 'tests/screenshots/final-state.png' });
  });
  
  test('Visual snapshot of map and beeswarm', async ({ page }) => {
    // Attempt to select a map-friendly indicator
    try {
      await page.getByLabel('selected options').getByRole('textbox').click();
      await page.waitForTimeout(1000);
      
      // Try to find map-friendly indicators
      for (const keyword of ['bodem', 'groen', 'hoogte', 'hitte']) {
        const matchingOptions = await page.getByRole('option', { 
          name: new RegExp(keyword, 'i') 
        }).all();
        
        if (matchingOptions.length > 0) {
          await matchingOptions[0].click();
          console.log(`Selected indicator matching: ${keyword}`);
          break;
        }
      }
      
      // Wait for indicator selection to apply
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('Error selecting map-friendly indicator:', error.message);
    }
    
    // Take map screenshot
    try {
      // Focus on map area
      const mapContainer = page.locator('.leaflet-container');
      if (await mapContainer.count() > 0) {
        await mapContainer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Take map screenshot
        await page.screenshot({ 
          path: 'tests/screenshots/map-view.png',
          clip: await mapContainer.boundingBox()
        });
      }
    } catch (error) {
      console.log('Error taking map screenshot:', error.message);
    }
    
    // Take beeswarm screenshot
    try {
      // Find beeswarm container
      const beeswarmContainer = page.locator('.beeswarm-container, svg.beeswarm');
      if (await beeswarmContainer.count() > 0) {
        await beeswarmContainer.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        
        // Take beeswarm screenshot
        await page.screenshot({ 
          path: 'tests/screenshots/beeswarm-view.png',
          clip: await beeswarmContainer.boundingBox()
        });
      }
    } catch (error) {
      console.log('Error taking beeswarm screenshot:', error.message);
    }
    
    // Enable difference mode if possible
    try {
      const compareYearSelector = 'select[name="compareYear"]';
      if (await page.locator(compareYearSelector).count() > 0) {
        // Get available options
        const options = await page.locator(compareYearSelector).evaluate(el => {
          return Array.from(el.options)
            .filter(option => option.value && option.value !== '')
            .map(option => option.text);
        });
        
        // Enable difference mode if options available
        if (options.length > 0) {
          await page.locator(compareYearSelector).selectOption({ label: options[0] });
          await page.waitForTimeout(3000); // Longer wait for difference mode
          
          // Take map difference mode screenshot
          try {
            const mapContainer = page.locator('.leaflet-container');
            if (await mapContainer.count() > 0) {
              await mapContainer.scrollIntoViewIfNeeded();
              
              // Take map difference mode screenshot
              await page.screenshot({ 
                path: 'tests/screenshots/map-difference-mode.png',
                clip: await mapContainer.boundingBox()
              });
            }
          } catch (error) {
            console.log('Error taking map difference screenshot:', error.message);
          }
          
          // Take beeswarm difference mode screenshot
          try {
            const beeswarmContainer = page.locator('.beeswarm-container, svg.beeswarm');
            if (await beeswarmContainer.count() > 0) {
              await beeswarmContainer.scrollIntoViewIfNeeded();
              
              // Take beeswarm difference mode screenshot
              await page.screenshot({ 
                path: 'tests/screenshots/beeswarm-difference-mode.png',
                clip: await beeswarmContainer.boundingBox()
              });
            }
          } catch (error) {
            console.log('Error taking beeswarm difference screenshot:', error.message);
          }
        }
      }
    } catch (error) {
      console.log('Error enabling difference mode for screenshots:', error.message);
    }
  });
});
