// src/lib/datasets.ts
// Centralized location for all dataset URLs and versions

// Current dataset version
export const DATASET_VERSION = '20251105';

// Config mode: 'dev' or 'published' (default)
// Set via environment variable PUBLIC_CONFIG_MODE
// Uses import.meta.env which works with Vite's env handling
const CONFIG_MODE = import.meta.env.PUBLIC_CONFIG_MODE || 'published';

// Config Portal base URL (always uses Vercel production)
const CONFIG_PORTAL_URL = "https://buurtdashboard-config-portal.vercel.app";

// Helper to build config portal CSV URL
const buildConfigUrl = (slug) =>
  `${CONFIG_PORTAL_URL}/api/config/${slug}/csv?mode=${CONFIG_MODE}`;

// URLs for different datasets
export const BUURT_GEOJSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json";

// Municipality data URL
export const MUNICIPALITY_JSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/gemeentes.json";

// Default indicators config URL - from config portal
// English translations are applied client-side from src/lib/i18n/indicator-translations.json
// Run `npm run generate-translations` to update translations when config changes
export const DEFAULT_INDICATORS_CONFIG_URL = buildConfigUrl('default-nl');

export const DEFAULT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/Buurt2024BuurtdashboardDataset20251113.csv.gz";

export const DEFAULT_DATA_DOWNLOAD_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_nov25.xlsx";

// Dordrecht indicators config URL - from config portal
export const DORDRECHT_INDICATORS_CONFIG_URL = buildConfigUrl('dordrecht');

export const DORDRECHT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/csvdata/Dordrecht_RMK_011225(b11buurt).csv.gz";

export const DORDRECHT_DATA_DOWNLOAD_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_nov25.xlsx";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";
