import { dsv } from 'd3'

export async function load({ url }) {
  // Access the URLSearchParams object
  const searchParams = url.searchParams;

  // Get individual query parameters
  const lang = searchParams.get('lang');

  // const metadata = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata.csv")
  // const metadata_english = await dsv(';', "https://raw.githubusercontent.com/Climate-Adaptation-Services/buurtdashboard-data/main/metadata-english.csv")

  const metadata_dordrecht = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht/metadata/metadata_180225_2023_4.csv")
  const metadata_dordrecht_2019 = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht/metadata/metadata_101224_2019_1.csv")
  const data_dordrecht = await dsv(';', "https://buurtdashboard-data.s3.eu-north-1.amazonaws.com/dordrecht/csvdata/Dordrecht_dashboard_120225_2.csv")
  
  return {
    lang,
    // metadata,
    // metadata_english,
    metadata_dordrecht,
    metadata_dordrecht_2019,
    data_dordrecht
  };
}