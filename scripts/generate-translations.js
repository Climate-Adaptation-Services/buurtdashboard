#!/usr/bin/env node
/**
 * Translation generation script for English indicator translations
 *
 * This script:
 * 1. Fetches Dutch indicators config from config portal
 * 2. Fetches English indicators config from S3
 * 3. Matches indicators by Indicatornaamtabel (data column names are the same)
 * 4. Generates a translation mapping file
 *
 * Run this script when indicator config changes:
 * Usage: npm run generate-translations
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { dsvFormat } from 'd3-dsv';
// Note: We can't import from datasets.js because it uses import.meta.env (Vite-only)
// Instead, we define the URLs directly here

// Config Portal base URL (always uses Vercel production)
const CONFIG_PORTAL_URL = "https://buurtdashboard-config-portal.vercel.app";
const CONFIG_MODE = process.env.PUBLIC_CONFIG_MODE || 'published';

const DEFAULT_INDICATORS_CONFIG_URL = `${CONFIG_PORTAL_URL}/api/config/default-nl/csv?mode=${CONFIG_MODE}`;
const DEFAULT_INDICATORS_CONFIG_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/EN-buurtdashboard-metadata-050825-01.csv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🌍 Starting indicator translations generation...');

  try {
    // 1. Fetch both configs
    console.log('\n📥 Fetching indicator configs...');
    console.log(`   Dutch: ${DEFAULT_INDICATORS_CONFIG_URL}`);
    console.log(`   English: ${DEFAULT_INDICATORS_CONFIG_ENGLISH_URL}`);

    const [dutchResponse, englishResponse] = await Promise.all([
      fetch(DEFAULT_INDICATORS_CONFIG_URL),
      fetch(DEFAULT_INDICATORS_CONFIG_ENGLISH_URL)
    ]);

    if (!dutchResponse.ok) {
      throw new Error(`Failed to fetch Dutch config: ${dutchResponse.status}`);
    }
    if (!englishResponse.ok) {
      throw new Error(`Failed to fetch English config: ${englishResponse.status}`);
    }

    // 2. Parse CSV files
    console.log('\n📊 Parsing CSV files...');
    const dutchText = await dutchResponse.text();
    const englishText = await englishResponse.text();

    const dutchConfig = dsvFormat(';').parse(dutchText);
    const englishConfig = dsvFormat(';').parse(englishText);

    console.log(`   Dutch indicators: ${dutchConfig.length}`);
    console.log(`   English indicators: ${englishConfig.length}`);

    // 3. Create lookup map from English config by Indicatornaamtabel
    // The Indicatornaamtabel contains the CSV column names which are the same in both languages
    const englishByAttribute = {};
    englishConfig.forEach(indicator => {
      if (indicator.Indicatornaamtabel) {
        // Use the first attribute as the key (handles multi-column indicators)
        const key = indicator.Indicatornaamtabel.split(',')[0].trim();
        englishByAttribute[key] = indicator;
      }
    });

    // 4. Generate translations mapping
    console.log('\n🔄 Generating translations...');
    const translations = {};
    let matched = 0;
    let unmatched = 0;

    dutchConfig.forEach(dutchIndicator => {
      if (!dutchIndicator.Titel || dutchIndicator.Titel === '') return;

      const attribute = dutchIndicator.Indicatornaamtabel?.split(',')[0]?.trim();
      const englishIndicator = englishByAttribute[attribute];

      if (englishIndicator) {
        translations[dutchIndicator.Titel] = {
          title: englishIndicator.Titel,
          subtitle: englishIndicator.Subtitel || null,
          description: englishIndicator['Tekst vraagteken'] || null,
          plottitle: englishIndicator['Plottitel (enkel bij kwantitatief)'] || null,
          // Also translate domain labels if present
          domain: englishIndicator.Domein || null
        };
        matched++;
      } else {
        console.log(`   ⚠️  No English translation for: ${dutchIndicator.Titel} (${attribute})`);
        unmatched++;
      }
    });

    console.log(`\n   ✓ Matched: ${matched}`);
    console.log(`   ✗ Unmatched: ${unmatched}`);

    // 5. Save to file
    const outputPath = join(__dirname, '..', 'src', 'lib', 'i18n', 'indicator-translations.json');
    const output = {
      generatedAt: new Date().toISOString(),
      sourceUrls: {
        dutch: DEFAULT_INDICATORS_CONFIG_URL,
        english: DEFAULT_INDICATORS_CONFIG_ENGLISH_URL
      },
      translations
    };

    // Ensure i18n directory exists
    mkdirSync(join(__dirname, '..', 'src', 'lib', 'i18n'), { recursive: true });

    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n✅ Success!');
    console.log(`   Translations saved to: src/lib/i18n/indicator-translations.json`);
    console.log(`   Total translations: ${Object.keys(translations).length}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main();
