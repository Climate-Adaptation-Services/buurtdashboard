import { dsv } from 'd3'
import { defaultConfig, dordrechtConfig } from '$lib/config'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  const configParam = searchParams.get('config') || 'default';
  
  // Select the appropriate config object based on URL parameter
  const configObj = configParam === 'dordrecht' ? dordrechtConfig : defaultConfig;

  const metadata = await dsv(';', configObj.metadataLocation)
  const metadata_english = await dsv(';', configObj.metadataLocationEnglish)

  return {
    lang,
    metadata,
    metadata_english,
  };
}