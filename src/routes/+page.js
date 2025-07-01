import { dsvFormat } from 'd3-dsv'
import { defaultConfig, dordrechtConfig } from '$lib/config'
import { unzipSync, gunzipSync, strFromU8 } from 'fflate'
import { BUURT_GEOJSON_URL, MUNICIPALITY_JSON_URL } from '$lib/datasets'
import { prepareJSONData } from '$lib/noncomponents/prepareJSONData'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  const configParam = searchParams.get('config') || 'default';

  // Select the appropriate config object based on URL parameter
  const configObj = configParam === 'dordrecht' ? dordrechtConfig : defaultConfig;

  // Start all fetches in parallel - including GeoJSON data
  const [metadataPromise, metadataEnglishPromise, csvPromise, municipalityPromise, neighbourhoodPromise] = [
    fetch(configObj.metadataLocation),
    fetch(configObj.metadataLocationEnglish),
    fetch(configObj.neighbourhoodCSVdataLocation),
    fetch(MUNICIPALITY_JSON_URL),
    fetch(BUURT_GEOJSON_URL)
  ];

  // Wait for all fetches to complete
  const [metadataResponse, metadataEnglishResponse, csvResponse, municipalityResponse, neighbourhoodResponse] = await Promise.all([
    metadataPromise,
    metadataEnglishPromise,
    csvPromise,
    municipalityPromise,
    neighbourhoodPromise
  ]);

  // Process the responses in parallel with error handling for GeoJSON data
  let neighbourhoodGeoJson = null;
  let municipalityGeoJson = null;
  let metadataText = '';
  let metadataEnglishText = '';
  let zipBuffer;

  try {
    // Process the responses in parallel
    const [metadataTextResult, metadataEnglishTextResult, zipBufferResult, neighbourhoodGeoJsonResult, municipalityGeoJsonResult] = await Promise.all([
      metadataResponse.text(),
      metadataEnglishResponse.text(),
      csvResponse.arrayBuffer(),
      neighbourhoodResponse.ok ? neighbourhoodResponse.json() : Promise.resolve(null),
      municipalityResponse.ok ? municipalityResponse.json() : Promise.resolve(null)
    ]);

    // Assign the results
    metadataText = metadataTextResult;
    metadataEnglishText = metadataEnglishTextResult;
    zipBuffer = zipBufferResult;
    neighbourhoodGeoJson = neighbourhoodGeoJsonResult;
    municipalityGeoJson = municipalityGeoJsonResult;
  } catch (error) {
    console.error('Error processing responses:', error);
    // Continue with available data
  }

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

  // Process and cache the GeoJSON data if available
  if (neighbourhoodGeoJson && municipalityGeoJson) {
    // Pass URLs for caching purposes
    const dataUrls = {
      municipalityUrl: MUNICIPALITY_JSON_URL,
      neighbourhoodUrl: BUURT_GEOJSON_URL
    };

    // Process the data with caching
    await prepareJSONData([municipalityGeoJson, neighbourhoodGeoJson], buurtCSVdata, dataUrls);
  }
  console.log('csvdata', buurtCSVdata)

  return {
    lang,
    metadata,
    metadata_english,
    buurtCSVdata,
    neighbourhoodGeoJson,
    municipalityGeoJson
  };
}