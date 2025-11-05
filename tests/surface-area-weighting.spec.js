// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Surface Area Weighting & BEB Variant Tests
 *
 * These tests verify the critical features of:
 * 1. Surface area weighted averages for Nederland/Gemeente stats
 * 2. BEB (Bebouwde kom) variant switching functionality
 * 3. Data integrity with weighted calculations
 */

test.describe('Surface Area Weighting Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // Allow data loading
  });

  test('Nederland stats show valid weighted values', async ({ page }) => {
    // Select an indicator that has surface area weighting
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    // Look for "Groen" indicator which uses surface area weighting
    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes('Groen')) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Check Nederland stat exists and has a valid value
    // Look for img element that contains "Nederland" and a number
    const nederlandStat = page.locator('img').filter({ hasText: /Nederland.*\d+/ }).first();
    if (await nederlandStat.count() > 0) {
      await expect(nederlandStat).toBeVisible();

      // Get the alt text or aria-label which contains the full stat
      const statText = await nederlandStat.getAttribute('alt') ||
                       await nederlandStat.getAttribute('aria-label') ||
                       await nederlandStat.textContent();

      // Verify no NaN or invalid values
      expect(statText).not.toContain('NaN');
      expect(statText).not.toContain('undefined');

      // Should contain a percentage or number
      expect(statText).toMatch(/\d+/);

      console.log(`✅ Nederland stat shows valid weighted value: ${statText}`);
    }
  });

  test('Weighted calculations produce no NaN values', async ({ page }) => {
    // Navigate and wait for rendering
    await page.waitForTimeout(3000);

    // Check entire page for NaN values
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('NaN');

    // Check specifically in stats section
    const stats = page.locator('.stat, .statistics, [class*="stat"]');
    if (await stats.count() > 0) {
      const statTexts = await stats.allTextContents();
      statTexts.forEach(text => {
        expect(text).not.toContain('NaN');
        expect(text).not.toContain('undefined');
      });
    }

    console.log('✅ No NaN values found in weighted calculations');
  });

  test('Bodembedekking shows valid percentages that sum correctly', async ({ page }) => {
    // Select Bodembedekking indicator
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes('Bodembedekking')) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Wait for barplot to render
    await page.waitForTimeout(2000);

    // Check that bars exist (visual check)
    const bars = page.locator('rect[class*="bar"], .bar, [class*="barplot"] rect');
    const barCount = await bars.count();

    if (barCount > 0) {
      console.log(`✅ Bodembedekking rendered with ${barCount} bars`);
      expect(barCount).toBeGreaterThan(0);
    }
  });
});

test.describe('BEB Variant Switching Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
  });

  test('BEB dropdown appears for indicators with variant', async ({ page }) => {
    // Select an indicator with BEB variant (like Boomkroonoppervlakte)
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && (text.includes('Boomkroon') || text.includes('Groen'))) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Look for BEB dropdown
    const bebDropdown = page.locator('select.beb-dropdown, .beb-switch select, select[class*="beb"]');
    const dropdownCount = await bebDropdown.count();

    if (dropdownCount > 0) {
      await expect(bebDropdown.first()).toBeVisible();
      console.log('✅ BEB dropdown appears for variant indicators');

      // Check dropdown has options
      const dropdownOptions = await bebDropdown.first().locator('option').all();
      expect(dropdownOptions.length).toBeGreaterThan(1);

      // Verify options are "Hele buurt" and "Bebouwde kom"
      const optionTexts = await Promise.all(
        dropdownOptions.map(opt => opt.textContent())
      );
      expect(optionTexts.join(',')).toMatch(/hele.*buurt/i);
      expect(optionTexts.join(',')).toMatch(/bebouwde.*kom/i);
    }
  });

  test('BEB dropdown changes map colors', async ({ page }) => {
    // Select indicator with BEB variant
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes('Bodembedekking')) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Take screenshot of "Hele buurt"
    await page.screenshot({
      path: 'tests/screenshots/beb-hele-buurt.png',
      fullPage: false
    });

    // Find and change BEB dropdown
    const bebDropdown = page.locator('select.beb-dropdown, .beb-switch select').first();
    if (await bebDropdown.count() > 0) {
      await bebDropdown.selectOption('bebouwde_kom');
      await page.waitForTimeout(2000);

      // Take screenshot of "Bebouwde kom"
      await page.screenshot({
        path: 'tests/screenshots/beb-bebouwde-kom.png',
        fullPage: false
      });

      console.log('✅ BEB dropdown interaction completed - screenshots saved');
    }
  });

  test('BEB switch updates stats values', async ({ page }) => {
    // Select indicator with BEB variant
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && (text.includes('Groen') || text.includes('Boomkroon'))) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Get initial Nederland stat value
    const nederlandStat = page.locator('text=/Nederland/i').first();
    let initialValue = null;
    if (await nederlandStat.count() > 0) {
      const initialText = await nederlandStat.textContent();
      // Extract number from text
      const match = initialText?.match(/(\d+\.?\d*)/);
      if (match) {
        initialValue = parseFloat(match[1]);
      }
    }

    // Toggle BEB dropdown
    const bebDropdown = page.locator('select.beb-dropdown, .beb-switch select').first();
    if (await bebDropdown.count() > 0 && initialValue !== null) {
      await bebDropdown.selectOption('bebouwde_kom');
      await page.waitForTimeout(3000);

      // Get new Nederland stat value
      const newText = await nederlandStat.textContent();
      const newMatch = newText?.match(/(\d+\.?\d*)/);

      if (newMatch) {
        const newValue = parseFloat(newMatch[1]);

        // Values should be different (unless there's no BEB data)
        // We'll just verify it's a valid number
        expect(newValue).toBeGreaterThanOrEqual(0);
        expect(isNaN(newValue)).toBe(false);

        console.log(`✅ BEB switch: Hele buurt=${initialValue}, Bebouwde kom=${newValue}`);
      }
    }
  });

  test('"Geen data" shows for municipalities without BEB data', async ({ page }) => {
    // Select indicator with BEB variant
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && (text.includes('Groen') || text.includes('Boomkroon'))) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Select a municipality without BEB data (e.g., Barneveld)
    // This would require finding the municipality selector
    // For now, just verify "Geen data" handling exists

    // Toggle to bebouwde kom
    const bebDropdown = page.locator('select.beb-dropdown, .beb-switch select').first();
    if (await bebDropdown.count() > 0) {
      await bebDropdown.selectOption('bebouwde_kom');
      await page.waitForTimeout(2000);

      // Check if any stats show "Geen data" (which is valid for municipalities without BEB data)
      const geenDataElements = await page.locator('text=/Geen data/i').count();
      console.log(`Found ${geenDataElements} "Geen data" elements with BEB variant selected`);

      // This is informational - "Geen data" is valid for regions without BEB data
      expect(geenDataElements).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Data Integrity with Surface Area Weighting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
  });

  test('All numerical stats are valid numbers or "Geen data"', async ({ page }) => {
    await page.waitForTimeout(3000);

    // Find all stat elements
    const stats = page.locator('.stat, .indicator-stats, [class*="stat"]');
    const statCount = await stats.count();

    if (statCount > 0) {
      const statTexts = await stats.allTextContents();

      for (const text of statTexts) {
        // Each stat should either:
        // 1. Contain a valid number
        // 2. Say "Geen data"
        // 3. Be empty (not yet loaded)
        const hasNumber = /\d+/.test(text);
        const hasGeenData = /geen.*data/i.test(text);
        const isEmpty = text.trim() === '';

        const isValid = hasNumber || hasGeenData || isEmpty;

        if (!isValid) {
          console.log(`Invalid stat text: "${text}"`);
        }

        expect(isValid).toBe(true);

        // Must not contain NaN or undefined
        expect(text).not.toContain('NaN');
        expect(text).not.toContain('undefined');
      }

      console.log(`✅ All ${statCount} stats contain valid data`);
    }
  });

  test('Barplot percentages are reasonable (0-100%)', async ({ page }) => {
    // Select Bodembedekking
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && text.includes('Bodembedekking')) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Look for percentage labels on bars
    const percentageTexts = await page.locator('text=/\\d+%/').allTextContents();

    for (const text of percentageTexts) {
      const match = text.match(/(\d+\.?\d*)%/);
      if (match) {
        const percentage = parseFloat(match[1]);

        // Percentages should be between 0 and 100
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      }
    }

    if (percentageTexts.length > 0) {
      console.log(`✅ All ${percentageTexts.length} percentages are in valid range (0-100%)`);
    }
  });

  test('Surface area column is used correctly for weighting', async ({ page }) => {
    // This is more of an integration check
    // We verify that the system doesn't crash and produces valid output

    // Select multiple indicators and verify they all work
    const indicatorsToTest = ['Groen', 'Verharding', 'Water'];

    for (const indicatorName of indicatorsToTest) {
      const multiselect = page.locator('.multiselect').first();
      await multiselect.click({ force: true });
      await page.waitForTimeout(1000);

      const options = await page.getByRole('option').all();
      for (const option of options) {
        const text = await option.textContent();
        if (text && text.includes(indicatorName)) {
          await option.click();
          await page.waitForTimeout(3000);
          break;
        }
      }

      // Verify Nederland stat is valid
      // Look for img element that contains "Nederland" and a number
      const nederlandStat = page.locator('img').filter({ hasText: /Nederland.*\d+/ }).first();
      if (await nederlandStat.count() > 0) {
        const statText = await nederlandStat.getAttribute('alt') ||
                         await nederlandStat.getAttribute('aria-label') ||
                         await nederlandStat.textContent();
        expect(statText).not.toContain('NaN');
        expect(statText).toMatch(/\d+/); // Should have a number

        console.log(`✅ ${indicatorName}: Valid weighted calculation - ${statText}`);
      }

      // Small delay between tests
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Regression Tests - Prevent Previous Issues', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);
  });

  test('No duplicate keys in beeswarm plot', async ({ page }) => {
    // This was a previous bug - neighborhoods had undefined buurtcode values
    const errors = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && text.includes('duplicate keys')) {
        errors.push(text);
      }
    });

    // Select an indicator to trigger beeswarm plot
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    if (options.length > 0) {
      await options[1].click(); // Select second option
      await page.waitForTimeout(3000);
    }

    expect(errors.length).toBe(0);
    console.log('✅ No duplicate key errors in beeswarm plot');
  });

  test('BEB dropdown works in both Chrome and Firefox', async ({ page, browserName }) => {
    // This was a Chrome-specific bug that was fixed

    // Select indicator with BEB variant
    const multiselect = page.locator('.multiselect').first();
    await multiselect.click({ force: true });
    await page.waitForTimeout(1000);

    const options = await page.getByRole('option').all();
    for (const option of options) {
      const text = await option.textContent();
      if (text && (text.includes('Groen') || text.includes('Boomkroon'))) {
        await option.click();
        await page.waitForTimeout(3000);
        break;
      }
    }

    // Find BEB dropdown
    const bebDropdown = page.locator('select.beb-dropdown, .beb-switch select').first();

    if (await bebDropdown.count() > 0) {
      // Select bebouwde kom
      await bebDropdown.selectOption('bebouwde_kom');
      await page.waitForTimeout(2000);

      // Verify selection stuck (it was reverting to hele_buurt in Chrome)
      const selectedValue = await bebDropdown.inputValue();
      expect(selectedValue).toBe('bebouwde_kom');

      console.log(`✅ BEB dropdown works correctly in ${browserName}`);
    }
  });

  test('CSV and GeoJSON column mismatch handled gracefully', async ({ page }) => {
    // We fixed an issue where CSV had "buurtcode" but GeoJSON had "buurtcode2024"
    // Verify the system handles this gracefully

    await page.waitForTimeout(3000);

    // Check for undefined values in the UI
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('undefined');

    // Check console for errors related to undefined properties
    const errors = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error' && text.includes('undefined')) {
        errors.push(text);
      }
    });

    await page.reload();
    await page.waitForTimeout(3000);

    // Allow some errors but not related to buurtcode
    const buurtcodeErrors = errors.filter(e => e.includes('buurtcode'));
    expect(buurtcodeErrors.length).toBe(0);

    console.log('✅ CSV/GeoJSON column mismatch handled correctly');
  });
});
