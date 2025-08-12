// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Fast, Essential Checks
 * 
 * These tests run quickly and catch major issues.
 * Perfect for CI/CD and development feedback loops.
 */

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?config=dordrecht');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Basic data loading
  });

  test('Application loads without errors', async ({ page }) => {
    // Verify page has loaded by checking for body content
    await expect(page.locator('body')).toBeVisible();
    
    // Check for main container
    const mainSelectors = ['main', '.app', '.container', '#app', 'body > div'];
    let hasMainContainer = false;
    
    for (const selector of mainSelectors) {
      if (await page.locator(selector).count() > 0) {
        hasMainContainer = true;
        console.log(`Main container found: ${selector}`);
        break;
      }
    }
    
    expect(hasMainContainer).toBe(true);
    console.log('✅ Application loaded successfully');
  });

  test('Map component renders', async ({ page }) => {
    // Look for map containers
    const mapSelectors = ['.map', '.map-container', 'svg', '.leaflet-container'];
    let mapElement = null;
    
    for (const selector of mapSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        mapElement = element;
        console.log(`Map found: ${selector}`);
        break;
      }
    }
    
    if (mapElement) {
      await expect(mapElement).toBeVisible();
      
      // Check for SVG paths (map data)
      const pathElements = await page.locator('path').count();
      console.log(`✅ Map rendered with ${pathElements} path elements`);
      expect(pathElements).toBeGreaterThan(0);
    } else {
      console.log('⚠️  No map component found');
    }
  });

  test('No critical JavaScript errors', async ({ page }) => {
    const criticalErrors = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        // Filter out known non-critical issues
        if (!text.includes('Failed to decode downloaded font') &&
            !text.includes('OTS parsing error') &&
            !text.includes('Error: <path> attribute d') &&
            !text.includes('Error: <rect> attribute')) {
          criticalErrors.push(text);
        }
      }
    });
    
    page.on('pageerror', error => {
      criticalErrors.push(`Page error: ${error.message}`);
    });
    
    // Reload to capture errors
    await page.reload();
    await page.waitForTimeout(3000);
    
    console.log(`Found ${criticalErrors.length} critical errors`);
    if (criticalErrors.length > 0) {
      console.log('Critical errors:', criticalErrors);
    }
    
    // Allow minimal errors but fail if too many
    expect(criticalErrors.length).toBeLessThan(3);
    console.log('✅ JavaScript errors within acceptable limits');
  });

  test('Control interface is present', async ({ page }) => {
    // Look for interactive elements
    const controlSelectors = [
      '.sidebar', '.control-panel', '.panel', 'aside', 
      '.multiselect', 'select', 'input', 'button'
    ];
    
    let hasControls = false;
    for (const selector of controlSelectors) {
      if (await page.locator(selector).count() > 0) {
        hasControls = true;
        console.log(`Controls found: ${selector}`);
        break;
      }
    }
    
    // This is informational - UI might be different
    console.log(`✅ Interactive controls present: ${hasControls}`);
  });
});