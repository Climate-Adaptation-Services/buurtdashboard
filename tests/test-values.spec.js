// @ts-check
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

['-dev', ''].forEach(locationName => {    
  test(`${locationName}test`, async ({ page }) => {
    
    await page.goto(`https://buurtdashboard${locationName}.vercel.app`);
    await page.locator('.GM0225_path').click();
    await expect(page.locator('.BU02250001_path_PET29tm34p')).toBeVisible();
    await expect(page.locator('g').filter({ hasText: '- 20cm' }).locator('rect')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Grondwaterstand huidig' })).toBeVisible();
    await expect(page.locator('.BU02250101_node_GLGHuidigMean')).toBeVisible();
    await expect(page.getByText('1.01.21.41.61.82.02.22.42.6Meter onder maaiveld per buurt in gemeente Druten')).toBeVisible();
    await expect(page.getByPlaceholder('Zoek buurt...')).toBeVisible();
    await expect(page.locator('body')).toContainText('1.81');
    await expect(page.locator('body')).toContainText('1.78');
    await expect(page.getByText('30.26')).toBeVisible();
    await page.getByText('30.26').click();
    await expect(page.getByRole('heading', { name: 'Bevolkingsdichtheid' })).toBeVisible();
    await page.locator('.BU02250201_path_GLGHuidigMean').click();
    await expect(page.getByText('Vooroorlogse woonwijk', { exact: true })).toBeVisible();
    await expect(page.locator('.BU02250203_node_GLGHuidigMean')).toBeVisible();
    await expect(page.locator('.BU02250102_path_perc5_10mm')).toBeVisible();
    await expect(page.locator('body')).toContainText('Buurt Afferden1.52');
    await expect(page.locator('svg').filter({ hasText: '- 15cm' })).toBeVisible();
    await expect(page.locator('body')).toContainText('NederlandGemeente DrutenBuurt AfferdenWijktype Vooroorlogse woonwijk');


  });
})
