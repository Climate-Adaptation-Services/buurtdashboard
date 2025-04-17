import { dsv } from 'd3'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');

  const metadata = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-metadata-060125-03.csv")
  const metadata_english = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/metadata/buurtdashboard-engels-metadata-060125-04.csv")
  const csvData = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/buurtdashboard-KEA/data-download/BuurtdashboardDataDownload20250416.csv")

  return {
    lang,
    metadata,
    metadata_english,
    csvData
    // metadata_dordrecht,
    // metadata_dordrecht_2019,
    // data_dordrecht
  };
}