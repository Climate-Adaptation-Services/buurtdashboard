// @ts-check
import { test } from '@playwright/test';

/**
 * Simplified screenshot capture test
 * 
 * This test just captures screenshots of the application in various states
 * without complex interactions.
 */
test('Capture dashboard screenshots', async ({ page }) => {
  // Navigate to the development site with Dordrecht config
  console.log('Loading application...');
  await page.goto('https://buurtdashboard-dev.vercel.app/?config=dordrecht');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');
  
  try {
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/01-initial-state.png' });
    console.log('Captured initial state');
    
    // Wait a bit to ensure UI is fully rendered
    await page.waitForTimeout(3000);
    
    // Try to find the map if it exists
    const mapExists = await page.locator('.leaflet-container').count() > 0;
    if (mapExists) {
      console.log('Map component found');
      await page.screenshot({ path: 'tests/screenshots/02-map-visible.png' });
      
      // Check for map elements
      const paths = await page.locator('.leaflet-container path').count();
      console.log(`Found ${paths} path elements in the map`);
    } else {
      console.log('Map component not found');
    }
    
    // Check for indicators section
    const indicatorsExists = await page.locator('.indicators-section, .indicators, .indicator-container').first().count() > 0;
    if (indicatorsExists) {
      console.log('Indicators section found');
      await page.screenshot({ path: 'tests/screenshots/03-indicators-visible.png' });
    }
    
    // Look for the specific UI elements we're interested in
    const hasDropdown = await page.locator('select[name="compareYear"]').count() > 0;
    if (hasDropdown) {
      console.log('Compare year dropdown found');
      await page.screenshot({ path: 'tests/screenshots/04-compare-dropdown.png' });
      
      // Try to capture the options
      const options = await page.locator('select[name="compareYear"] option').all();
      console.log(`Found ${options.length} options in the compare year dropdown`);
      
      for (let i = 0; i < options.length; i++) {
        const text = await options[i].textContent();
        console.log(`Option ${i}: ${text}`);
      }
    } else {
      console.log('Compare year dropdown not found - difference mode likely not available in initial state');
    }
    
    // Check for unit switcher
    const hasUnitSwitch = await page.locator('button', { hasText: /^(m²|%)$/ }).count() > 0;
    if (hasUnitSwitch) {
      console.log('Unit switch button found');
      await page.screenshot({ path: 'tests/screenshots/05-unit-switch.png' });
    } else {
      console.log('Unit switch button not found');
    }
    
  } catch (error) {
    console.error('Test error:', error);
    // Capture error state
    await page.screenshot({ path: 'tests/screenshots/error-state.png' });
  } finally {
    // Take final screenshot regardless of test outcome
    await page.screenshot({ path: 'tests/screenshots/final-state.png' });
  }
});
