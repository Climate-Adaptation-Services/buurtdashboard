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
// Uses import.meta.env for Vite, falls back to process.env for Node.js scripts
const getConfigMode = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PUBLIC_CONFIG_MODE || 'published';
  }
  return process.env.PUBLIC_CONFIG_MODE || 'published';
};

// Indicators config URLs (built with config mode)
export const DEFAULT_INDICATORS_CONFIG_URL = buildConfigUrl('default-nl', getConfigMode());
export const DORDRECHT_INDICATORS_CONFIG_URL = buildConfigUrl('dordrecht', getConfigMode());
