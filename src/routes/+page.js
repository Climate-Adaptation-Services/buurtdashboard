import { dsv } from 'd3'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');

  const metadata = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata.csv")
  const metadata_english = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata-english.csv")

  return {
    lang,
    metadata,
    metadata_english
  };
}