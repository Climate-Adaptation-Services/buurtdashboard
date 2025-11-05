import { test, expect } from '@playwright/test';

test.describe('Multiple indicator URL parameters', () => {
  test('should preserve multiple indicators without gemeente', async ({ page }) => {
    // Test with multiple indicators
    await page.goto('http://localhost:4173/?indicator=Ernstige+eenzaamheid&indicator=Lage+grondwaterstand');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if URL still has both indicators
    const url = page.url();
    expect(url).toContain('indicator=Ernstige+eenzaamheid');
    expect(url).toContain('indicator=Lage+grondwaterstand');

    console.log('URL after load:', url);
  });

  test('should preserve multiple indicators with gemeente', async ({ page }) => {
    // Test with gemeente and multiple indicators
    await page.goto('http://localhost:4173/?gemeente=GM0344&indicator=Risico+Paalrot+2050+hoog&indicator=Lage+grondwaterstand');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if URL still has all parameters
    const url = page.url();
    expect(url).toContain('gemeente=GM0344');
    expect(url).toContain('indicator=Risico+Paalrot+2050+hoog');
    expect(url).toContain('indicator=Lage+grondwaterstand');

    console.log('URL after load:', url);
  });

  test('should preserve indicators when selecting gemeente from dropdown', async ({ page }) => {
    // Start with just indicators
    await page.goto('http://localhost:4173/?indicator=Ernstige+eenzaamheid&indicator=Lage+grondwaterstand');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Select a gemeente from dropdown
    await page.click('text=Gemeente');
    await page.fill('input[placeholder*="Zoek"]', 'Utrecht');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);

    // Check if URL still has both indicators and the gemeente
    const url = page.url();
    expect(url).toContain('indicator=Ernstige+eenzaamheid');
    expect(url).toContain('indicator=Lage+grondwaterstand');
    expect(url).toContain('gemeente=');

    console.log('URL after selecting gemeente:', url);
  });
});
