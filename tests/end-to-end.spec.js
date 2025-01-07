// @ts-check
import { test } from '@playwright/test';

['-dev', ''].forEach(locationName => {    
  test(`${locationName}test`, async ({ page }) => {
    await page.goto(`https://buurtdashboard${locationName}.vercel.app`);
    await page.locator('.GM1969_path').click();
    await page.locator('.BU19691609_path_perc5_10mm').click();
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Gevoelstemperatuur' }).click();
    await page.locator('.BU19691509_path_PET29tm34p').click();
    await page.getByLabel('selected options').getByRole('textbox').click();
    await page.getByRole('option', { name: 'Groen/Grijs/Blauw' }).click();
    await page.locator('.BU19691609_path_perc_boom').click();
    await page.locator('.BU19691509_path_perc_boom').click();
    // await page.locator('img').nth(1).click();
    await page.locator('div:nth-child(3) > .sc-carousel-button').click();
    await page.getByLabel('Close modal').click();
    await page.getByRole('button', { name: 'Remove all' }).click();
    await page.getByRole('button').nth(1).click();
    await page.getByRole('button').click();
    await page.locator('.GM1581_path').click();
    await page.locator('.BU15810101_path_perc5_10mm').click();
    await page.locator('.BU15810408_path_Verschilzetting_2050_Hoog').click();
    await page.locator('.BU15810400_node_perc_groen_zonder_agr').click();
    await page.locator('.BU15810308_node_m2GroenPI').click();
  });
})
