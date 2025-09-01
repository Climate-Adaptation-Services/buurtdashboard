// src/lib/datasets.ts
// Centralized location for all dataset URLs and versions

// Current dataset version
export const DATASET_VERSION = '20250619';

// URLs for different datasets
export const BUURT_GEOJSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json";

// Municipality data URL
export const MUNICIPALITY_JSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/gemeentes.json";

// Default config URLs
export const DEFAULT_METADATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-250625-01.csv";

export const DEFAULT_METADATA_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/EN-buurtdashboard-metadata-050825-01.csv";

export const DEFAULT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/BuurtdashboardDataDownload20250625_2.csv.gz";

// Dordrecht config URLs
export const DORDRECHT_METADATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_rmk_120825_1.csv";

export const DORDRECHT_METADATA_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_030625_2023_2.csv";

export const DORDRECHT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/csvdata/Dordrecht_rmk_030725_1.csv.zip";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";
