// src/lib/datasets.js
// Centralized location for all dataset URLs and versions
// This file is imported by both the client app AND Node.js scripts (precalculate-nederland.js)

// Current dataset version
export const DATASET_VERSION = '20260204';

// Config Portal base URL (always uses Vercel production)
export const CONFIG_PORTAL_URL = "https://buurtdashboard-config-portal.vercel.app";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";

// Config mode: 'dev' or 'published' (default)
// VITE_ prefix ensures the variable is available at build time
// This value is baked into the bundle during build
// Uses optional chaining for Node.js compatibility (precalculate-nederland.js)
export const CONFIG_MODE = (typeof import.meta.env !== 'undefined' && import.meta.env.VITE_CONFIG_MODE) || (typeof process !== 'undefined' && process.env?.VITE_CONFIG_MODE) || 'published';

// Helper to build config portal URLs
export const buildConfigCsvUrl = (slug, configMode) =>
  `${CONFIG_PORTAL_URL}/api/config/${slug}/csv?mode=${configMode}`;

export const buildConfigJsonUrl = (slug, configMode) =>
  `${CONFIG_PORTAL_URL}/api/config/${slug}/json?mode=${configMode}`;

// GeoJSON URLs (fallback, can be overridden by config portal)
export const BUURT_GEOJSON_URL = `${S3_BASE_URL}/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json`;
export const MUNICIPALITY_JSON_URL = `${S3_BASE_URL}/buurtdashboard-KEA/geojsondata/gemeentes.json`;

// Dashboard config slugs
export const DASHBOARD_SLUGS = {
  default: 'default-nl',
  dordrecht: 'dordrecht'
};


// Fetch dashboard config from config portal (includes csv_data_url, data_download_url, etc.)
export async function fetchDashboardConfig(configParam = 'default') {
  const slug = DASHBOARD_SLUGS[configParam] || DASHBOARD_SLUGS.default;
  const url = buildConfigJsonUrl(slug, CONFIG_MODE);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard config: ${response.status}`);
  }

  return response.json();
}

// Indicators config URLs (built with config mode)
export const DEFAULT_INDICATORS_CONFIG_URL = buildConfigCsvUrl('default-nl', CONFIG_MODE);
export const DORDRECHT_INDICATORS_CONFIG_URL = buildConfigCsvUrl('dordrecht', CONFIG_MODE);

// Legacy exports for backwards compatibility with precalculate-nederland.js script
// These are fallback URLs - the app now fetches URLs from config portal
export const DEFAULT_CSV_DATA_URL = `${S3_BASE_URL}/buurtdashboard-KEA/csvdata/Buurt2024BuurtdashboardDataset20260204RMK.csv.gz`;
export const DORDRECHT_CSV_DATA_URL = `${S3_BASE_URL}/dordrecht-rmk/csvdata/Dordrecht_RMK_011225(b11buurt).csv.gz`;
export const DEFAULT_DATA_DOWNLOAD_URL = `${S3_BASE_URL}/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_jan26.xlsx`;
export const DORDRECHT_DATA_DOWNLOAD_URL = `${S3_BASE_URL}/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_jan26.xlsx`;

// Legacy alias for backwards compatibility
export const buildConfigUrl = buildConfigCsvUrl;
