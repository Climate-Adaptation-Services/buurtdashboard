import { dsv } from 'd3'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');
  // const name = searchParams.get('name');

  // const metadata = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata.csv")
  // const metadata_english = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata-english.csv")

  const metadata_dordrecht = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/metadata/metadata_111124_2.csv")
  const data_dordrecht = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/Dordrecht_dashboard_301024.csv")
  
  return {
    lang,
    // metadata,
    // metadata_english,
    metadata_dordrecht,
    data_dordrecht
  };
}