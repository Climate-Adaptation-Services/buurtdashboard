import { dsvFormat } from 'd3-dsv'
import { defaultConfig, dordrechtConfig } from '$lib/config'
import { unzipSync, gunzipSync, strFromU8 } from 'fflate'
import { BUURT_GEOJSON_URL, MUNICIPALITY_JSON_URL, DATASET_VERSION } from '$lib/datasets'
import { prepareJSONData } from '$lib/services/prepareJSONData'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  const configParam = searchParams.get('config') || 'default';

  // Select the appropriate config object based on URL parameter
  const configObj = configParam === 'dordrecht' ? dordrechtConfig : defaultConfig;

  // Start lightweight fetches (metadata, CSV, and Nederland aggregates)
  // GeoJSON will be loaded client-side for progressive rendering
  const [metadataPromise, metadataEnglishPromise, csvPromise, nederlandAggregatesPromise] = [
    fetch(configObj.metadataLocation),
    fetch(configObj.metadataLocationEnglish),
    fetch(configObj.neighbourhoodCSVdataLocation),
    fetch('/nederland-aggregates.json').catch(() => null) // Don't fail if file doesn't exist
  ];

  // Wait for lightweight data only
  const [metadataResponse, metadataEnglishResponse, csvResponse, nederlandAggregatesResponse] = await Promise.all([
    metadataPromise,
    metadataEnglishPromise,
    csvPromise,
    nederlandAggregatesPromise
  ]);

  // Process the responses
  const metadataText = await metadataResponse.text();
  const metadataEnglishText = await metadataEnglishResponse.text();
  const zipBuffer = await csvResponse.arrayBuffer();

  // Parse metadata
  const metadata = dsvFormat(';').parse(metadataText);
  const metadata_english = dsvFormat(';').parse(metadataEnglishText);

  // Handle both zip and gzip formats
  let csvText;
  if (configObj.neighbourhoodCSVdataLocation.endsWith('.gz')) {
    const decompressed = gunzipSync(new Uint8Array(zipBuffer));
    csvText = strFromU8(decompressed);
  } else {
    const files = unzipSync(new Uint8Array(zipBuffer));
    const fileName = Object.keys(files).find(name => name.endsWith('.csv'));
    csvText = strFromU8(files[fileName]);
  }

  const buurtCSVdata = dsvFormat(';').parse(csvText);

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
    metadata,
    metadata_english,
    buurtCSVdata,
    nederlandAggregates,
    neighbourhoodGeoJson: null,
    municipalityGeoJson: null
  };
}