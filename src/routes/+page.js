import { dsvFormat } from 'd3-dsv'
import { defaultConfig, dordrechtConfig } from '$lib/config'
import { unzipSync, strFromU8 } from 'fflate'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  const configParam = searchParams.get('config') || 'default';

  // Select the appropriate config object based on URL parameter
  const configObj = configParam === 'dordrecht' ? dordrechtConfig : defaultConfig;

  // Fetch and parse metadata files
  const metadataResponse = await fetch(configObj.metadataLocation)
  const metadataText = await metadataResponse.text()
  const metadata = dsvFormat(';').parse(metadataText)
  
  const metadataEnglishResponse = await fetch(configObj.metadataLocationEnglish)
  const metadataEnglishText = await metadataEnglishResponse.text()
  const metadata_english = dsvFormat(';').parse(metadataEnglishText)
  
  // Handle zipped CSV file
  const csvResponse = await fetch(configObj.neighbourhoodCSVdataLocation)
  const zipBuffer = await csvResponse.arrayBuffer()
  const files = unzipSync(new Uint8Array(zipBuffer))
  const fileName = Object.keys(files).find(name => name.endsWith('.csv'))
  const csvText = strFromU8(files[fileName])
  const buurtCSVdata = dsvFormat(';').parse(csvText)

  return {
    lang,
    metadata,
    metadata_english,
    buurtCSVdata,
  };
}