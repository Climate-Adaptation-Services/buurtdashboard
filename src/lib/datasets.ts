// src/lib/datasets.ts
// Centralized location for all dataset URLs and versions

// Current dataset version
export const DATASET_VERSION = '20250619';

// URLs for different datasets
export const BUURT_GEOJSON_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/geojsondata/Buurt2024_IdentificationOnly.json";

// Municipality data URL
export const MUNICIPALITY_JSON_URL = "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/GemeenteGrenzen2023-small.json";

// Default config URLs
export const DEFAULT_METADATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-170425-03.csv";

export const DEFAULT_METADATA_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-engels-metadata-060125-04.csv";

export const DEFAULT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/BuurtdashboardDataDownload20250425.csv.gz";

// Dordrecht config URLs
export const DORDRECHT_METADATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_030625_2023_2.csv";

export const DORDRECHT_METADATA_ENGLISH_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/metadata/metadata_030625_2023_2.csv";

export const DORDRECHT_CSV_DATA_URL =
  "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht-rmk/csvdata/Dordrecht_dashboard_260525_2.csv.zip";

// S3 base URL for preconnect
export const S3_BASE_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com";
