// src/lib/datasets.ts
// Centralized location for all dataset URLs and versions

// Current dataset version
export const DATASET_VERSION = '20251105';

// URLs for different datasets
export const BUURT_GEOJSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/buurt24IdentificationOnly.json";

// Municipality data URL
export const MUNICIPALITY_JSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/gemeentes.json";

// Default indicators config URLs
export const DEFAULT_INDICATORS_CONFIG_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-config-131125-02.csv";

export const DEFAULT_INDICATORS_CONFIG_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/EN-buurtdashboard-metadata-050825-01.csv";

export const DEFAULT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/Buurt2024BuurtdashboardDataset20251113.csv.gz";

export const DEFAULT_DATA_DOWNLOAD_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_nov25.xlsx";

// Dordrecht indicators config URLs
export const DORDRECHT_INDICATORS_CONFIG_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_rmk_120825_1.csv";

export const DORDRECHT_INDICATORS_CONFIG_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_030625_2023_2.csv";

export const DORDRECHT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/csvdata/Dordrecht_rmk_030725_1.csv.zip";

export const DORDRECHT_DATA_DOWNLOAD_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/data-download/Downloadbuurtdashboard_nov25.xlsx";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";
