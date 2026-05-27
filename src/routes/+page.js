import { dsvFormat } from 'd3-dsv'
import { defaultConfig, dordrechtConfig } from '$lib/config'
import { DATASET_VERSION, fetchDashboardConfig } from '$lib/datasets'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  const configParam = searchParams.get('config') || 'default';

  // Select the appropriate local config object (for fallback values)
  const localConfig = configParam === 'dordrecht' ? dordrechtConfig : defaultConfig;

  // Fetch dashboard config from config portal (single source of truth for URLs)
  let portalConfig;
  try {
    portalConfig = await fetchDashboardConfig(configParam);
  } catch (err) {
    console.warn('Failed to fetch config from portal, using fallback:', err.message);
    portalConfig = null;
  }

  // Merge portal config with local config (portal takes precedence for URLs)
  // Config Portal is now the single source of truth for CSV and download URLs
  const csvUrl = portalConfig?.csv_data_url;
  const downloadUrl = portalConfig?.data_download_url;

  if (!csvUrl) {
    throw new Error(
      'Could not load CSV data URL from Config Portal. ' +
      'Please ensure the Config Portal is accessible and the dashboard config has a csv_data_url set.'
    );
  }

  const configObj = {
    ...localConfig,
    neighbourhoodCSVdataLocation: csvUrl,
    dataDownloadLocation: downloadUrl || null
  };

  // Fetch indicators config and Nederland aggregates - CSV loads client-side in background
  const [indicatorsConfigResponse, nederlandAggregatesResponse] = await Promise.all([
    fetch(configObj.indicatorsConfigLocation),
    fetch('/nederland-aggregates.json').catch(() => null)
  ]);

  const indicatorsConfigText = await indicatorsConfigResponse.text();
  const indicatorsConfig = dsvFormat(';').parse(indicatorsConfigText);

  // Parse Nederland aggregates if available
  let nederlandAggregates = null;
  if (nederlandAggregatesResponse && nederlandAggregatesResponse.ok) {
    nederlandAggregates = await nederlandAggregatesResponse.json();

    // Check if cached version matches current dataset version
    if (nederlandAggregates && nederlandAggregates.version !== DATASET_VERSION) {
      console.warn(
        `Nederland aggregates cache is outdated!\n` +
        `Cached version: ${nederlandAggregates.version}\n` +
        `Current DATASET_VERSION: ${DATASET_VERSION}\n` +
        `Please run: npm run precalculate-nederland`
      );
      // Still use the cached data but mark it as potentially stale
      nederlandAggregates._stale = true;
    }
  }

  // Return immediately with null GeoJSON - will be loaded client-side
  return {
    lang,
    indicatorsConfig,
    nederlandAggregates,
    neighbourhoodGeoJson: null,
    municipalityGeoJson: null,
    // Pass the merged config so client can update configStore with portal URLs
    dashboardConfig: configObj
  };
}