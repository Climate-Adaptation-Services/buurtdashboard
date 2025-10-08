import { dsvFormat } from 'd3-dsv'
import { defaultConfig, dordrechtConfig } from '$lib/config'
import { unzipSync, gunzipSync, strFromU8 } from 'fflate'
import { BUURT_GEOJSON_URL, MUNICIPALITY_JSON_URL } from '$lib/datasets'
import { prepareJSONData } from '$lib/services/prepareJSONData'

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

  // === COMPARISON WITH OLD DATA ===
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         COMPARING OLD vs NEW DATA                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Fetch old metadata for comparison
  const OLD_METADATA_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-250625-01.csv";
  const OLD_CSV_URL = "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/csvdata/BuurtdashboardDataDownload20250625_2.csv.gz";

  let oldMetadata = [];
  let oldCSVData = [];

  try {
    const oldMetadataResponse = await fetch(OLD_METADATA_URL);
    const oldMetadataText = await oldMetadataResponse.text();
    oldMetadata = dsvFormat(';').parse(oldMetadataText);

    const oldCSVResponse = await fetch(OLD_CSV_URL);
    const oldCSVBuffer = await oldCSVResponse.arrayBuffer();
    const oldDecompressed = gunzipSync(new Uint8Array(oldCSVBuffer));
    const oldCSVText = strFromU8(oldDecompressed);
    oldCSVData = dsvFormat(';').parse(oldCSVText);
  } catch (error) {
    console.log('Could not fetch old data for comparison:', error.message);
  }

  // Parse current metadata
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

  // === METADATA COMPARISON ===
  console.log('\n📋 METADATA COMPARISON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OLD metadata URL:', OLD_METADATA_URL);
  console.log('NEW metadata URL:', configObj.metadataLocation);
  console.log('OLD indicators count:', oldMetadata.length);
  console.log('NEW indicators count:', metadata.length);

  // Find indicators with BEB/variant differences
  const oldBEBIndicators = oldMetadata.filter(m => m.Varianten && m.Varianten.includes('BEB'));
  const newVariant1Indicators = metadata.filter(m => m.Varianten && m.Varianten.includes('1'));

  console.log('\nOLD: Indicators with "BEB" variant:', oldBEBIndicators.length);
  console.log('NEW: Indicators with "1" variant:', newVariant1Indicators.length);

  console.log('\nOLD BEB indicators:');
  console.table(oldBEBIndicators.map(m => ({ Titel: m.Titel, Varianten: m.Varianten })));

  console.log('\nNEW variant "1" indicators:');
  console.table(newVariant1Indicators.map(m => ({ Titel: m.Titel, Varianten: m.Varianten })));

  // === CSV DATA COMPARISON ===
  console.log('\n📊 CSV DATA COMPARISON');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('OLD CSV URL:', OLD_CSV_URL);
  console.log('NEW CSV URL:', configObj.neighbourhoodCSVdataLocation);
  console.log('OLD rows:', oldCSVData.length);
  console.log('NEW rows:', buurtCSVdata.length);
  console.log('OLD columns:', oldCSVData.length > 0 ? Object.keys(oldCSVData[0]).length : 0);
  console.log('NEW columns:', Object.keys(buurtCSVdata[0] || {}).length);

  const oldColumns = oldCSVData.length > 0 ? Object.keys(oldCSVData[0]) : [];
  const newColumns = Object.keys(buurtCSVdata[0] || {});

  const oldBEBColumns = oldColumns.filter(col => col.includes('_BEB'));
  const newBEBColumns = newColumns.filter(col => col.endsWith('_1'));

  console.log('\nOLD: Columns with _BEB suffix:', oldBEBColumns.length);
  console.log('NEW: Columns with _1 suffix:', newBEBColumns.length);

  console.log('\nOLD _BEB columns (first 10):', oldBEBColumns.slice(0, 10));
  console.log('NEW _1 columns (first 10):', newBEBColumns.slice(0, 10));

  // Compare columns added/removed
  const addedColumns = newColumns.filter(col => !oldColumns.includes(col));
  const removedColumns = oldColumns.filter(col => !newColumns.includes(col));

  if (addedColumns.length > 0) {
    console.log('\n✅ NEW columns added:', addedColumns.slice(0, 20));
  }
  if (removedColumns.length > 0) {
    console.log('\n❌ OLD columns removed:', removedColumns.slice(0, 20));
  }

  // Sample data comparison for first buurt
  if (oldCSVData.length > 0 && buurtCSVdata.length > 0) {
    console.log('\n🔍 SAMPLE ROW COMPARISON (first buurt)');

    // Check which buurtcode columns exist
    const oldBuurtcodeCol = oldColumns.find(col => col.includes('buurtcode'));
    const newBuurtcodeCol = newColumns.find(col => col.includes('buurtcode'));

    console.log('OLD buurtcode column name:', oldBuurtcodeCol);
    console.log('OLD buurtcode value:', oldCSVData[0][oldBuurtcodeCol]);
    console.log('NEW buurtcode column name:', newBuurtcodeCol);
    console.log('NEW buurtcode value:', buurtCSVdata[0][newBuurtcodeCol]);

    // Show first few columns of each dataset
    console.log('\nOLD first 10 columns:', oldColumns.slice(0, 10));
    console.log('NEW first 10 columns:', newColumns.slice(0, 10));

    // Compare a variant column if it exists in both
    if (newBEBColumns.length > 0) {
      const sampleCol = newBEBColumns[0];
      const baseCol = sampleCol.replace('_1', '');
      console.log(`\nSample variant column comparison:`);
      console.log(`Base column "${baseCol}":`, buurtCSVdata[0][baseCol]);
      console.log(`Variant column "${sampleCol}":`, buurtCSVdata[0][sampleCol]);
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         END OF COMPARISON                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Process and cache the GeoJSON data if available
  if (neighbourhoodGeoJson && municipalityGeoJson) {
    console.log('\n🗺️ GEOJSON DATA CHECK');
    console.log('neighbourhoodGeoJson structure:', {
      type: neighbourhoodGeoJson.type,
      hasFeatures: !!neighbourhoodGeoJson.features,
      featureCount: neighbourhoodGeoJson.features?.length,
      hasObjects: !!neighbourhoodGeoJson.objects,
      objectKeys: neighbourhoodGeoJson.objects ? Object.keys(neighbourhoodGeoJson.objects) : null
    });

    if (neighbourhoodGeoJson.features && neighbourhoodGeoJson.features.length > 0) {
      console.log('Sample neighbourhood feature properties:', neighbourhoodGeoJson.features[0]?.properties);
      console.log('Looking for buurtcode in GeoJSON:', Object.keys(neighbourhoodGeoJson.features[0]?.properties || {}).filter(k => k.includes('buurt')));
    }

    // Pass URLs for caching purposes
    const dataUrls = {
      municipalityUrl: MUNICIPALITY_JSON_URL,
      neighbourhoodUrl: BUURT_GEOJSON_URL
    };

    // Process the data with caching
    await prepareJSONData([municipalityGeoJson, neighbourhoodGeoJson], buurtCSVdata, dataUrls);

    if (neighbourhoodGeoJson.features && neighbourhoodGeoJson.features.length > 0) {
      console.log('After prepareJSONData - Sample feature:', neighbourhoodGeoJson.features[0]?.properties);
    }
  }


  return {
    lang,
    metadata,
    metadata_english,
    buurtCSVdata,
    neighbourhoodGeoJson,
    municipalityGeoJson
  };
}