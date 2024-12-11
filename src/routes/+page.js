import { dsv } from 'd3'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');

  const metadata = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/buurtdashboard-metadata-101224-05.csv")
  const metadata_english = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata-english.csv")

  return {
    lang,
    metadata,
    metadata_english
  };
}