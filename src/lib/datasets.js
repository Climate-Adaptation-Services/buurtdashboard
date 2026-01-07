// src/lib/datasets.js
// Centralized location for all dataset URLs and versions
// This file is imported by both the client app AND Node.js scripts (precalculate-nederland.js)

// Current dataset version
export const DATASET_VERSION = '20260107';

// Config Portal base URL (always uses Vercel production)
export const CONFIG_PORTAL_URL = "https://buurtdashboard-config-portal.vercel.app";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";

// Helper to build config portal CSV URL
export const buildConfigUrl = (slug, configMode) =>
  `${CONFIG_PORTAL_URL}/api/config/${slug}/csv?mode=${configMode}`;

// GeoJSON URLs
export const BUURT_GEOJSON_URL = `${S3_BASE_URL}/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json`;
export const MUNICIPALITY_JSON_URL = `${S3_BASE_URL}/buurtdashboard-KEA/geojsondata/gemeentes.json`;

// CSV data URLs
export const DEFAULT_CSV_DATA_URL = `${S3_BASE_URL}/buurtdashboard-KEA/csvdata/jan26-Buurtdashboarddata.csv.gz`;
export const DORDRECHT_CSV_DATA_URL = `${S3_BASE_URL}/dordrecht-rmk/csvdata/Dordrecht_RMK_011225(b11buurt).csv.gz`;

// Excel download URLs
export const DEFAULT_DATA_DOWNLOAD_URL = `${S3_BASE_URL}/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_jan26.xlsx`;
export const DORDRECHT_DATA_DOWNLOAD_URL = `${S3_BASE_URL}/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_jan26.xlsx`;

// Config mode: 'dev' or 'published' (default)
// VITE_ prefix ensures the variable is available at build time
// This value is baked into the bundle during build
export const CONFIG_MODE = import.meta.env.VITE_CONFIG_MODE || 'published';

// Indicators config URLs (built with config mode)
export const DEFAULT_INDICATORS_CONFIG_URL = buildConfigUrl('default-nl', CONFIG_MODE);
export const DORDRECHT_INDICATORS_CONFIG_URL = buildConfigUrl('dordrecht', CONFIG_MODE);
